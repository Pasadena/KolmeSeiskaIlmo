package controllers

import play.api._
import play.api.db.slick._
import play.api.libs.functional.syntax._

import play.api.mvc._
import play.api.libs.json._
import play.api.data._
import play.api.data.Forms._
import models._

class Application extends Controller {

  def index = Action {
    Ok(views.html.index(""))
  }

  def register(id: Long) = Action { implicit rs =>
    Ok(views.html.index(""))
  }


  /**def javascriptRoutes = Action{ implicit request =>
    Ok(Routes.javascriptRouter("jsRoutes")(
      routes.javascript.EventController.events,
      routes.javascript.EventController.createEvent,
      routes.javascript.EventController.deleteEvent,
      routes.javascript.CabinController.fetchCabins,
      routes.javascript.EventController.getSelectedEvent
    )).as("text/javascript")

  }**/

}