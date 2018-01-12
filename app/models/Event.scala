package models

import java.sql.Date
import java.sql.Timestamp
import java.text.SimpleDateFormat
import javax.inject.Inject

import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import org.joda.time.format.DateTimeFormatter
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.json._
import slick.driver.JdbcProfile
import slick.driver.PostgresDriver.api._

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
//import play.api.db.DB
import play.api.Play.current

/**
 * Created by spokos on 3/25/15.
 */
case class Event(id: Option[Long], name: String, description: String, dateOfEvent: DateTime, registrationStartDate: DateTime, registrationEndDate: DateTime, diningOptional: Boolean = false)

case class EventData(event: Event, cabins: Seq[EventCabinData])

case class EventCabinData(id: Long, eventId: Long, cabin: Cabin, cabinCount: Int)

object Event {

  val writePattern = "yyyy-MM-dd HH:mm:ss±hh"
  val dateFormatter = DateTimeFormat.forPattern(writePattern);

  implicit val tsreads: Reads[DateTime] = Reads.of[String] map (DateTime.parse _)
  implicit val tswrites: Writes[DateTime] = Writes { (dt: DateTime) => JsString(dt.toString)}

  implicit val eventFormat = Json.format[Event]

}

object EventCabinData {
  implicit val dataFormat = Json.format[EventCabinData]
}

object EventData {
  implicit val eventDataFormat = Json.format[EventData]
}

class Events(tag: Tag) extends Table[Event](tag, "EVENT") {

  implicit val dateMapper = MappedColumnType.base[DateTime, Timestamp](
      dt => new java.sql.Timestamp(dt.getMillis),
      ts => new DateTime(ts.getTime)
  )

  def id = column[Option[Long]]("ID", O.PrimaryKey, O.AutoInc)
  def name = column[String]("NAME_")
  def description = column[String]("DESCRIPTION")
  def dateOfEvent = column[DateTime]("DATE_OF_EVENT")
  def registrationStartDate = column[DateTime]("REGISTRATION_START_DATE")
  def registrationEndDate = column[DateTime]("REGISTRATION_END_DATE")
  def diningOptional = column[Boolean]("DINING_OPTIONAL")

  def * = (id, name, description, dateOfEvent, registrationStartDate, registrationEndDate, diningOptional) <> ((Event.apply _).tupled, Event.unapply _)

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

  def maybe = (id, eventId, cabinId.?, amount.?).<>[Option[EventCabin], (Option[Long], Option[Long], Option[Long], Option[Int])](
  { eventCabin =>
    eventCabin match {
      case (id, eventId, Some(cabinId), Some(amount)) => Some(EventCabin.apply(id, eventId, cabinId, amount))
      case _ => None
    }
  },
  { eventCabin => None
  })

}

class EventDAO @Inject()(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[JdbcProfile] {
  import driver.api._

  val events = TableQuery[Events]
  val eventCabins = TableQuery[EventCabins]
  val cabins = TableQuery[Cabins]

  def getAll(): Future[Seq[Event]] = {
    db.run(events.result)
  }

  def create(event: Event): Future[Event]= {
    val insertQuery = events returning events.map(_.id) into ((event, id) => event.copy(id = id))
    val action = insertQuery += event
    db.run(action)
  }

  def findById(id: Long): Future[Event] = {
    db.run(events.filter(_.id === id).result.headOption.map { res =>
      res match {
        case None => throw new RuntimeException("No matching value for id #id")
        case Some(event) => event
      }
    })
  }

  def findEventCabinData(event: Event): Future[Seq[EventCabinData]] = {
    val action = for {
      (eventCabin, cabin) <- eventCabins join cabins on (_.cabinId === _.id) if eventCabin.eventId === event.id.get
    } yield (eventCabin.id.get, eventCabin.eventId.get, cabin, eventCabin.amount)
    db.run(action.result.map(list => list.map(parts => EventCabinData(parts._1, parts._2, parts._3, parts._4))) )
}

  def updateEvent(event: Event, cabinsForEvent: List[EventCabin]) = {
    val copiedElement = event.copy(event.id, event.name, event.description, event.dateOfEvent,
        event.registrationStartDate, event.registrationEndDate, event.diningOptional)

    val cabinsIds = cabinsForEvent.foldLeft(List.empty[Long])((ids: List[Long], cabin:EventCabin) => cabin.cabinId :: ids)

    //try {
    val updatedEvent = db.run( events.filter(_.id === copiedElement.id.get).update(copiedElement) )

    //delete
    db.run( eventCabins.filter(cabin => cabin.eventId === copiedElement.id.get && !(cabin.cabinId inSet cabinsIds)).delete )

    cabinsForEvent.foreach(cabin => db.run( eventCabins.insertOrUpdate(cabin.copy(cabin.id, cabin.eventId, cabin.cabinId, cabin.amount)) ))
    updatedEvent
  }

  def createEventAndCabins(event: Event, eventCabins: List[EventCabin]): Future[Event] = {
    for {
      savedEvent <- create(event)
      savedCabins <- createEventCabins(savedEvent.id.get, eventCabins)
    } yield savedEvent
  }

  def createEventCabins(eventId: Long, cabins: List[EventCabin]) = {
    val toBeInserted = cabins.map { cabin => eventCabins.insertOrUpdate(cabin.copy(None, Some(eventId), cabin.cabinId, cabin.amount)) }
    val inOneGo = DBIO.sequence(toBeInserted)
    db.run(inOneGo)
  }

  def getEventCabins(eventId: Long): Future[Seq[EventCabin]] = {
    db.run( eventCabins.filter(_.eventId === eventId).result )
  }

  def findEventDataById(id:Long): Future[EventData] = {
    for {
      event <- findById(id)
      cabinData <- findEventCabinData(event)
    } yield EventData(event, cabinData)
  }

  def delete(id: Long): Future[Int] = {
    this.deleteEventCabins(id)
    db.run( events.filter(_.id === id).delete )
  }

  private def deleteEventCabins(eventId: Long) = {
    db.run( eventCabins.filter(_.eventId === eventId).delete )
  }

  def isEventRegistrationInProgress(eventId: Long): Future[Boolean] = {
    db.run(events.filter(_.id === eventId).result.headOption map {
      case None => true
      case Some(event) => event.registrationStartDate.isBeforeNow && event.registrationEndDate.isAfterNow
    })
  }
}
