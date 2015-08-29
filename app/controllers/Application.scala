package controllers

import play.api._
import play.api.db.slick._
import play.api.libs.functional.syntax._

import play.api.data._
import play.api.data.Forms._
import play.api.db.slick.Config.driver.simple.Session
import play.api.mvc._
import play.api.libs.json._
import play.api.data._
import play.api.data.Forms._
import models._

object Application extends Controller {

  def index = DBAction { implicit rs =>
    Ok(views.html.index(""))
  }

  def register(id: Long) = DBAction { implicit rs =>
    Ok(views.html.index(""))
  }


  def javascriptRoutes = Action{ implicit request =>
    Ok(Routes.javascriptRouter("jsRoutes")(
      routes.javascript.EventController.events,
      routes.javascript.EventController.createEvent,
      routes.javascript.EventController.deleteEvent,
      routes.javascript.EventController.getEvent,
      routes.javascript.CabinController.fetchCabins,
      routes.javascript.EventController.getSelectedEvent
    )).as("text/javascript")

  }

}