package models

import java.sql.Date

import org.joda.time.DateTime
import play.api.db.slick.Config.driver.simple._
import play.api.libs.json.Json

/**
 * Created by spokos on 3/25/15.
 */
case class Event(id: Option[Long], name: String, description: String, dateOfEvent: DateTime, registrationStartDate: DateTime, registrationEndDate: DateTime)

object Event {

  implicit val eventFormat = Json.format[Event]
}

class Events(tag: Tag) extends Table[Event](tag, "EVENT") {

  implicit val dateMapper = MappedColumnType.base[DateTime, Date](
    dateTime => new Date(dateTime.getMillis),
    date => new DateTime(date)
  )

  def id = column[Option[Long]]("ID", O.PrimaryKey, O.AutoInc)
  def name = column[String]("NAME_")
  def description = column[String]("DESCRIPTION")
  def dateOfEvent = column[DateTime]("DATE_OF_EVENT")
  def registrationStartDate = column[DateTime]("REGISTRATION_START_DATE")
  def registrationEndDate = column[DateTime]("REGISTRATION_END_DATE")

  def * = (id, name, description, dateOfEvent, registrationStartDate, registrationEndDate) <> ((Event.apply _).tupled, Event.unapply _)

}

case class EventCabin(id: Option[Long], eventId: Long, cabinId: Long)

class EventCabins(tag: Tag) extends Table[EventCabin](tag, "EVENT_CABIN") {

  def id = column[Option[Long]]("ID", O.PrimaryKey, O.AutoInc)
  def eventId = column[Long]("EVENT_ID")
  def cabinId = column[Long]("CABIN_ID")

  def * = (id, eventId, cabinId) <> (EventCabin.tupled, EventCabin.unapply _)

}

object EventDAO {

  val events = TableQuery[Events]
  val eventCabins = TableQuery[EventCabins]

  def getAll()(implicit session: Session): List[Event] = {
    events.list
  }

  def create(event: Event)(implicit session: Session): Option[Long]= {
    (events returning events.map(_.id)) += event
  }

  def createEventCabins(eventId: Long, cabins: List[Cabin])(implicit session: Session) = {
    for (cabin <- cabins) (eventCabins returning eventCabins.map(_.id) += new EventCabin(None, eventId, cabin.id.get))
  }

  def getEventCabins(eventID: Long)(implicit session: Session) = {
      for {cabinKeys <- eventCabins.list if cabinKeys.eventId == eventID
           cabin:Cabin <- CabinDAO.getAll() if (cabin.id.get == cabinKeys.cabinId)
      } yield cabin
  }

  def findById(id:Long)(implicit session: Session): Event = {
    events.filter(event => event.id === id).firstOption match {
      case Some(event) => event
      case None => throw new RuntimeException("No matching value for id #id")
    }
  }

  def delete(id: Long)(implicit session: Session) = {
    val toDeleteEvent = events.filter(_.id === id)
    toDeleteEvent.delete
  }
}
