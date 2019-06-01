package net.creasource.webflix.actors

import java.nio.file.Path

import akka.Done
import akka.actor.SupervisorStrategy.{Restart, Stop}
import akka.actor._
import akka.event.Logging
import akka.pattern.ask
import net.creasource.Application
import net.creasource.exceptions.{NotFoundException, ValidationException}
import net.creasource.json.JsonSupport
import net.creasource.webflix.events.{LibraryCreated, LibraryDeleted}
import net.creasource.webflix.{Library, LibraryFile}

import scala.concurrent.duration._
import scala.util.{Failure, Success, Try}

object LibrarySupervisor extends JsonSupport {

  case object Purge
  case class Purge(paths: Seq[Path])

  case object GetLibraries
  case class AddLibrary(library: Library)
  case class GetLibrary(name: String)
  case class GetLibraryFiles(name: String)
  case class ScanLibrary(name: String)
  case class RemoveLibrary(name: String)
  case class GetFileById(libraryName: String, id: String)

  def props()(implicit app: Application): Props = Props(new LibrarySupervisor())

}

class LibrarySupervisor()(implicit val app: Application) extends Actor {

  import LibrarySupervisor._
  import context.dispatcher

  val logger = Logging(context.system, this)

  var libraries: Map[String, (ActorRef, Library)] = Map.empty

  override def receive: Receive = {

    case GetLibraries => sender() ! libraries.values.map(_._2).toSeq

    case GetLibrary(name: String) =>
      libraries.get(name).map(_._2) match {
        case Some(library) => sender() ! library
        case _ => sender() ! Status.Failure(NotFoundException("No library with that name"))
      }

    case GetLibraryFiles(name) =>
      val client = sender()
      libraries.get(name) match {
        case Some((actorRef, _)) =>
          val filesFuture = (actorRef ? LibraryActor.GetFiles)(1.minute).mapTo[Seq[LibraryFile]]
          filesFuture.onComplete {
            case Success(files) => client ! files
            case Failure(exception) => client ! Status.Failure(exception)
          }
        case None => client ! Status.Failure(NotFoundException("No library with that name"))
      }

    case ScanLibrary(name) =>
      val client = sender()
      libraries.get(name).map(_._1) match {
        case Some(actorRef) =>
          // TODO forward ?
          val filesFuture = (actorRef ? LibraryActor.Scan)(10.minute).mapTo[Seq[LibraryFile]]
          filesFuture.onComplete {
            case Success(files) => client ! files
            case Failure(exception) => client ! Status.Failure(exception)
          }
        case None => sender() ! Status.Failure(NotFoundException("No library with that name"))
      }

    case AddLibrary(library) =>
      val validateAndCreate = for {
        library <- library.validate()
        _ <-
          if (libraries.keys.exists(_ == library.name))
            Failure(ValidationException("name", "alreadyExists"))
          else
            Success(())
        actorName = libraries.size + "-" + library.name.replaceAll("""[^0-9a-zA-Z-_.*$+:@&=,!~';]""", "")
        _ <-
          Try(context.actorOf(LibraryActor.props(library), actorName)) map { actorRef =>
            libraries += (library.name -> (actorRef -> library))
            context.watch(actorRef)
            app.bus.publish(LibraryCreated(library))
          } recover { case e =>
            throw ValidationException("other", "failure", Some(e.getMessage))
          }
      } yield library
      validateAndCreate match {
        case Success(lib) => sender() ! lib
        case Failure(e) => sender() ! Status.Failure(e)
      }

    case RemoveLibrary(name) =>
      libraries
        .get(name)
        .foreach { case (actorRef, library) =>
          context.stop(actorRef)
          app.bus.publish(LibraryDeleted(name))
          libraries -= name
        }
      sender() ! Done

    case GetFileById(libraryName, id) =>
      val client = sender()
      libraries.get(libraryName).map(_._1) match {
        case Some(actorRef) => actorRef forward LibraryActor.GetFileById(id)
        case None =>
          logger.warning(s"Couldn't find the corresponding library with name ($libraryName). Id is: $id")
          client ! Status.Failure(NotFoundException("No file with that id"))
      }

    case Terminated(_) => // libraries -= actorRef // TODO memory leak

  }

  def valError(control: String, code: String, value: Option[String] = None) =
    Status.Failure(ValidationException(control, code, value))

  override def supervisorStrategy: SupervisorStrategy = OneForOneStrategy() {
    case _: ActorInitializationException => Stop
    case _: ActorKilledException         => Stop
    case _: DeathPactException           => Stop
    case _: Exception                    => Restart
  }

}
