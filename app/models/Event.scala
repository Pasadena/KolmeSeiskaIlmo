package models

import java.sql.Date
import java.text.SimpleDateFormat

import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import play.api.db.slick.Config.driver.simple._
import play.api.libs.json._

/**
 * Created by spokos on 3/25/15.
 */
case class Event(id: Option[Long], name: String, description: String, dateOfEvent: DateTime, registrationStartDate: DateTime, registrationEndDate: DateTime)

case class EventData(event: Event, cabins: List[EventCabinData])

case class EventCabinData(id: Long, eventId: Long, cabin: Cabin, cabinCount: Int)

object Event {

  val pattern = "d.M.yyyy"
  implicit val dateFormat = Format[DateTime](Reads.jodaDateReads(pattern), Writes.jodaDateWrites(pattern))

  implicit val eventFormat = Json.format[Event]
}

object EventCabinData {
  implicit val dataFormat = Json.format[EventCabinData]
}

object EventData {
  implicit val eventDataFormat = Json.format[EventData]
}

class Events(tag: Tag) extends Table[Event](tag, "EVENT") {

  implicit val dateTimeFormat = DateTimeFormat.forPattern("dd-mm-yyyy")
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

case class EventCabin(id: Option[Long], eventId: Option[Long], cabinId: Long, amount: Int)

object EventCabin {
  implicit val eventCabinFormat = Json.format[EventCabin]
}

class EventCabins(tag: Tag) extends Table[EventCabin](tag, "EVENT_CABIN") {

  def id = column[Option[Long]]("ID", O.PrimaryKey, O.AutoInc)
  def eventId = column[Option[Long]]("EVENT_ID")
  def cabinId = column[Long]("CABIN_ID")
  def amount = column[Int]("AMOUNT_")

  def event = foreignKey("EVENT_FK", eventId, TableQuery[Events])(_.id)

  def cabin = foreignKey("CABIN_FK", cabinId, TableQuery[Cabins])(_.id.get)

  def * = (id, eventId, cabinId, amount) <> ((EventCabin.apply _).tupled, EventCabin.unapply _)

}

object EventDAO {

  val events = TableQuery[Events]
  val eventCabins = TableQuery[EventCabins]
  val cabins = TableQuery[Cabins]

  def getAll()(implicit session: Session): List[Event] = {
    events.list
  }

  def create(event: Event)(implicit session: Session): Option[Long]= {
    (events returning events.map(_.id)) += event
  }

  def updateEvent(event: Event, cabins: List[EventCabin])(implicit session: Session): Unit = {
    val copiedElement = event.copy(event.id, event.name, event.description, event.dateOfEvent, event.registrationStartDate, event.registrationEndDate)
    events.filter(_.id === copiedElement.id.get).update(copiedElement)
    val cabinsIds = cabins.foldLeft(List.empty[Long])((ids: List[Long], cabin:EventCabin) => cabin.cabinId :: ids)
    val existingCabinsIds = eventCabins.filter(cabin => cabin.eventId === copiedElement.id.get).foldLeft(List.empty[Long])((ids: List[Long], cabin:EventCabin) => cabin.cabinId :: ids)
    //delete
    eventCabins.filter(cabin => cabin.eventId === copiedElement.id.get && !(cabin.cabinId inSet cabinsIds)).delete
    //update
    cabins.filter(cabin => existingCabinsIds.contains(cabin.id)).foreach { existingCabin =>
      eventCabins.update(existingCabin)
    }
    //create
    this.createEventCabins(event.id.get, cabins.filter(cabin => cabin.id == None))
  }

  def createEventCabins(eventId: Long, cabins: List[EventCabin])(implicit session: Session) = {
    for (cabin <- cabins) (eventCabins returning eventCabins.map(_.id) += cabin.copy(None, Some(eventId), cabin.cabinId, cabin.amount))
  }

  def getEventCabins(eventId: Long)(implicit session: Session): List[EventCabin] = {
    eventCabins.filter(_.eventId === eventId).list
  }

  def findById(id:Long)(implicit session: Session): (Event, List[EventCabin]) = {
    events.filter(event => event.id === id).firstOption match {
      case Some(event) => (event, this.getEventCabins(id))
      case None => throw new RuntimeException("No matching value for id #id")
    }
  }

  def findEventDataById(id:Long)(implicit session: Session): EventData = {
    val foo = for {
      event <- events if event.id === id
      eventCabin <- eventCabins if eventCabin.eventId === id
      cabin <- cabins if eventCabin.cabinId === cabin.id
    } yield (event, cabin, eventCabin.amount, eventCabin.id)
    foo.list.groupBy(_._1).map {case (event, data) => EventData(event, data.map {case (event, cabin, amount, eventCabinId) => EventCabinData(eventCabinId.get, event.id.get, cabin, amount)})}.toList match {
      case Nil => throw new RuntimeException("No matching value for id #id")
      case x :: xs => x
    }
  }

  def delete(id: Long)(implicit session: Session) = {
    this.deleteEventCabins(id)
    val toDeleteEvent = events.filter(_.id === id)
    toDeleteEvent.delete
  }

  private def deleteEventCabins(eventId: Long)(implicit session: Session) = {
    eventCabins.filter(_.eventId === eventId).delete
  }
}
