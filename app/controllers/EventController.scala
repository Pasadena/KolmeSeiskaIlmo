package controllers

import _root_.util.ExcelUtils
import models._
import play.api.data.validation.ValidationError
import play.api.mvc._
import play.api.libs.json._
import play.api.db.slick._
import play.api.Logger
import org.joda.time.DateTime

import javax.inject._
import scala.concurrent.ExecutionContext.Implicits.global

import slick.driver.JdbcProfile

/**
 * Created by spokos on 2/28/15.
 */
class EventController @Inject()(eventDAO: EventDAO)(registrationDAO: RegistrationDAO)(dbConfigProvider: DatabaseConfigProvider) extends Controller with Secured {

  val eventLogger = Logger("controllers")

  def index = isAuthenticated { implicit rs =>
    Ok(views.html.admin.events())
  }

  def adminIndex = isAuthenticated { implicit rs =>
    Ok(views.html.admin.admin())
  }

  def isBeforeNow(event:Event) = event.dateOfEvent.isAfter(DateTime.now())

  def events(activeOnly: Boolean): Action[AnyContent] = Action.async{ implicit rs =>
    eventDAO.getAll().map(events => Ok(Json.obj("events" ->
      Json.toJson(
          events.filter(event => !activeOnly || isBeforeNow(event))
          .sortWith((first, second) => second.dateOfEvent.compareTo(first.dateOfEvent) < 0)))))
  }


  def createEvent(): Action[JsValue] = Action.async(BodyParsers.parse.json) { implicit rs =>
    parsePost[(Event, List[EventCabin])](this, {
      case eventData => {
        eventDAO.createEventAndCabins(eventData._1, eventData._2)
          .map(event => Ok(Json.obj("status" -> "Ok", "message" -> "Event succesfully saved", "event" -> Json.toJson(event))))
      }
    })
  }

  def deleteEvent(id: Long) = Action.async {  implicit rs =>
    eventDAO.delete(id).map(deleteStatus => deleteStatus == 1 match {
      case true => Ok(Json.obj("status" -> "Ok", "message" -> "Event succesfully deleted"))
      case false => BadRequest(Json.obj("status" -> "KO", "message" -> "Unexpected error happened during event delete!"))
    })
  }


  def getEvent(id: Long) = Action.async { implicit re =>
    eventDAO.findById(id).map(event => Ok(Json.obj("event" -> Json.toJson(event))))
  }

  def getSelectedEvent(id: Long) = Action.async  { implicit re =>
     eventDAO.findEventDataById(id).map(eventData => Ok(Json.obj("event" -> Json.toJson(eventData))))
  }


  def updateEvent(id: Long) = Action.async(BodyParsers.parse.json) {  implicit rs =>
    parsePost[(Event, List[EventCabin])](this, {
      eventData => {
        eventDAO.updateEvent(eventData._1, eventData._2).map(res =>
          Ok(Json.obj("status" -> "Ok", "message" -> "Event succesfully saved", "event" -> Json.toJson(eventData._1)))
        )
      }
    })
  }

  def downloadRegistrationExcel(eventId: Long) = Action.async {  implicit rs =>
    val eventData = for {
      registrations <- registrationDAO.loadRegistrationsWithPersons(eventId)
      event <- eventDAO.findById(eventId)
    } yield (registrations, event)
    eventData.map(data => {
      val registrationsWithPersons = data._1.groupBy(_._1).map { case (key, value) => RegistrationWithPersons(key, value.head._2, value.map(_._3)) }.toList
      val registrationFile = ExcelUtils.generateExcelFronRegisteredPersons(registrationsWithPersons, data._2)
      Ok.sendFile(registrationFile, false, (_) => s"Yhteenveto ${data._2.name}.xlsx")
    })
  }
}
