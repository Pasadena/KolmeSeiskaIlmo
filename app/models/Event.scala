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
    cabins.filter(cabin => existingCabinsIds.contains(cabin.cabinId)).foreach { existingCabin =>
      eventCabins.filter(_.id === existingCabin.id).update(existingCabin.copy(existingCabin.id, existingCabin.eventId, existingCabin.cabinId, existingCabin.amount))
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
    val eventDataJoin = for {
      ((event, eventCabin), cabin) <- events leftJoin eventCabins on (_.id === _.eventId) leftJoin cabins on (_._2.cabinId === _.id) if event.id === id
    } yield (event, cabin.maybe, eventCabin.maybe)
    val eventDataList = eventDataJoin.list
    val eventDataMap = eventDataList.groupBy(_._1)
    val eventDatas = eventDataMap.map {case (event, data) => EventData(event, data.filter(item => item._2 != None).map {
      case (event, Some(cabin), Some(eventCabin)) => EventCabinData(eventCabin.id.get, event.id.get, cabin, eventCabin.amount)
      case _ => null
    })}
    eventDatas.toList match {
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
