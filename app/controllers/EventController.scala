package controllers

import models.{EventDAO, Event}
import play.api.db.slick.DBAction
import play.api.mvc.Controller
import play.api.libs.json._
import play.api.db.slick._
import play.api.db.slick.Config.driver.simple.Session

/**
 * Created by spokos on 2/28/15.
 */
object EventController extends Controller {

  def index = DBAction { implicit rs =>
    Ok(views.html.admin.events())
  }

  def adminIndex = DBAction { implicit rs =>
    Ok(views.html.admin.admin())
  }

  def events = DBAction { implicit rs =>
    Ok(Json.toJson(EventDAO.getAll()))
  }

  def createEvent = DBAction(parse json) { implicit rs =>
    rs.body.validate[Event] match {
      case event => event.asOpt match {
        case Some(x) => {
          EventDAO.create(x)
          Ok(Json.toJson("Event saved"))
        }
        case None => BadRequest(Json.obj("status" ->"KO", "message" -> "Unexpected error happened during event saving!"))
      }
    }
  }

  def deleteEvent(id: Long) = DBAction {  implicit rs =>
    (EventDAO.delete(id) == 1) match {
      case true => Ok(Json.obj("status" -> "Ok", "message" -> "Event succesfully deleted"))
      case false => BadRequest(Json.obj("status" -> "KO", "message" -> "Unexpected error happened during event delete!"))
    }

  }
}
