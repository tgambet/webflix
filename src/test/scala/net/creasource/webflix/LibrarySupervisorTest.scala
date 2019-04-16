package net.creasource.webflix

import akka.Done
import akka.testkit.TestActorRef
import net.creasource.util.{SimpleActorTest, WithLibrary}
import net.creasource.webflix.actors.{LibraryActor2, LibrarySupervisor}

class LibrarySupervisorTest extends SimpleActorTest with WithLibrary {

  "A LibrarySupervisor" should {

    val supervisor = TestActorRef(LibrarySupervisor.props()) //system.actorOf(LibrarySupervisor.props())

    "add a Library successfully" in {

      supervisor ! LibrarySupervisor.AddLibrary(Library.Local("name", libraryPath))

      expectMsg(LibrarySupervisor.AddLibrarySuccess)

    }

    "fail to add a library with a name already defined" in {

      supervisor ! LibrarySupervisor.AddLibrary(Library.Local("name", libraryPath))

      expectMsg(LibrarySupervisor.AddLibraryFailure)

    }

    "retrieve libraries" in {

      supervisor ! LibrarySupervisor.GetLibraries

      expectMsg(Seq(Library.Local("name", libraryPath)))

    }

    "get a library by name" in {

      supervisor ! LibrarySupervisor.GetLibrary("name")

      expectMsg(Some(Library.Local("name", libraryPath)))

      supervisor ! LibrarySupervisor.GetLibrary("badName")

      expectMsg(None)

    }

    "scan a library by name" in {

      supervisor ! LibrarySupervisor.ScanLibrary("name")

      expectMsgPF() {
        case LibraryActor2.ScanSuccess(files) => files.length should be (libraryFiles.length + 1)
      }

      supervisor ! LibrarySupervisor.ScanLibrary("badName")

      expectMsgPF() {
        case LibraryActor2.ScanFailure(cause) => cause.getMessage should be ("No library with that name")
      }

    }

    "retrieve files by library name" in {

      supervisor ! LibrarySupervisor.GetLibraryFiles("name")

      expectMsgPF() {
        case files: Seq[_] => files.length should be (libraryFiles.length + 1)
      }

    }

    "remove a library successfully" in {

      supervisor ! LibrarySupervisor.RemoveLibrary("name")

      expectMsg(Done)

    }

  }

}