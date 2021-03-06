package net.easyflix.tmdb

import java.net.URLEncoder

import net.easyflix.json.JsonSupport
import spray.json.RootJsonFormat

// https://developers.themoviedb.org/3/search/search-tv-shows

final case class SearchTVShows(page: Int, results: List[SearchTVShows.TVListResult], total_results: Int, total_pages: Int)

object SearchTVShows extends JsonSupport {

  def get(
      api_key: String,
      query: String,
      language: Option[String] = Some("en-US"),
      page: Option[Int] = Some(1),
      first_air_date_year: Option[Int] = None): String = {

    s"/3/search/tv?api_key=$api_key&query=${URLEncoder.encode(query, "UTF-8")}" +
      language.toParam("language") +
      page.toParam("page") +
      first_air_date_year.toParam("first_air_date_year")
  }

  implicit val format: RootJsonFormat[SearchTVShows] = jsonFormat4(SearchTVShows.apply)

  final case class TVListResult(
      poster_path: Option[String],
      popularity: Float,
      id: Int,
      backdrop_path: Option[String],
      vote_average: Float,
      overview: String,
      first_air_date: String,
      origin_country: List[String],
      genre_ids: List[Int],
      original_language: String,
      vote_count: Int,
      name: String,
      original_name: String)

  object TVListResult {
    implicit val format: RootJsonFormat[TVListResult] = jsonFormat13(TVListResult.apply)
  }

}
