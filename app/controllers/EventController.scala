package controllers

import models._
import play.api.data.validation.ValidationError
import play.api.db.slick.DBAction
import play.api.mvc.Controller
import play.api.libs.json._
import play.api.db.slick._
import play.api.db.slick.Config.driver.simple._

/**
 * Created by spokos on 2/28/15.
 */
object EventController extends Controller {

  implicit def tuple2Reads[A, B](implicit aFormat: Format[A], bFormat: Format[B]): Reads[Tuple2[A, B]] = Reads[Tuple2[A, B]] {
    case JsArray(arr) if arr.size == 2 => for {
      a <- aFormat.reads(arr(0))
      b <- bFormat.reads(arr(1))

    } yield (a, b)
    case _ => JsError(Seq(JsPath() -> Seq(ValidationError("Expected array of two elements"))))
  }

  implicit def tuple2Writes[A, B](implicit aWrites: Writes[A], bWrites: Writes[B]): Writes[Tuple2[A, B]] = new Writes[Tuple2[A, B]] {
    def writes(tuple: Tuple2[A, B]) = JsArray(Seq(aWrites.writes(tuple._1), bWrites.writes(tuple._2)))
  }

  def index = DBAction { implicit rs =>
    Ok(views.html.admin.events())
  }

  def adminIndex = DBAction { implicit rs =>
    Ok(views.html.admin.admin())
  }

  def events = DBAction { implicit rs =>
    val events: List[Event] =  EventDAO.getAll()
    Ok(Json.obj("events" -> Json.toJson(events.sortWith((first, second) => second.dateOfEvent.compareTo(first.dateOfEvent) < 0))))
  }

  def createEvent = DBAction(parse json) { implicit rs =>
    val jsResult = rs.body.validate[(Event, List[EventCabin])]
    jsResult match {
      case event => event.asOpt match {
        case Some(x) => {
          EventDAO.create(x._1) match {
            case Some(id) => {
              EventDAO.createEventCabins(id, x._2)
              Ok(Json.obj("status" -> "Ok", "message" -> "Event succesfully saved", "event" -> Json.toJson(EventDAO.findById(id))))
            }
            case None => BadRequest(Json.obj("status" ->"KO", "message" -> "Unexpected error happened when saving event cabins!"))
          }
        }
        case None => BadRequest(Json.obj("status" ->"KO", "message" -> "Unexpected error happened during event parsing!"))
      }
    }
  }

  def deleteEvent(id: Long) = DBAction {  implicit rs =>
    (EventDAO.delete(id) == 1) match {
      case true => Ok(Json.obj("status" -> "Ok", "message" -> "Event succesfully deleted"))
      case false => BadRequest(Json.obj("status" -> "KO", "message" -> "Unexpected error happened during event delete!"))
    }
  }

  def getEvent(id: Long) = DBAction { implicit re =>
    val event = EventDAO.findById(id)
    Ok(Json.obj("event" -> Json.toJson(event)))
  }

  def getSelectedEvent(id: Long) = DBAction { implicit re =>
    val event = EventDAO.findEventDataById(id)
    Ok(Json.obj("event" -> Json.toJson(event)))
  }

  def updateEvent(id: Long) = DBAction(parse json) {  implicit rs =>
    val jsResult = rs.body.validate[(Event, List[EventCabin])]
    jsResult match {
      case eventData => eventData.asOpt match {
        case Some(eventTuple) =>
          EventDAO.updateEvent(eventTuple._1, eventTuple._2)
          Ok(Json.obj("status" -> "Ok", "message" -> "Event succesfully updated!", "event" -> Json.toJson(EventDAO.findById(eventTuple._1.id.get))))
        case None => BadRequest(Json.obj("status" -> "KO", "message" -> "Unexpected error happened during event update!"))
      }
    }
  }
}
