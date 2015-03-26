package models

import java.sql.Timestamp
import java.util.Date

import play.api.db.slick.Config.driver.simple._
import play.api.libs.json.Json

/**
 * Created by spokos on 3/25/15.
 */
case class Event(id: Option[Long], name: String, description: String, dateOfEvent: Date, registrationStartDate: Date, registrationEndDate: Date)

object Event {
  implicit val eventFormat = Json.format[Event]
}

class Events(tag: Tag) extends Table[Event](tag, "EVENTS") {

  implicit val dateMapper = MappedColumnType.base[Date, Timestamp](
    date => new Timestamp(date.getTime),
    stamp => new Date(stamp.getTime)
  )

  def id = column[Option[Long]]("ID", O.PrimaryKey, O.AutoInc)
  def name = column[String]("NAME")
  def description = column[String]("DESCRIPTION")
  def dateOfEvent = column[Date]("DATE_OF_EVENT")
  def registrationStartDate = column[Date]("REGISTRATION_START_DATE")
  def registrationEndDate = column[Date]("REGISTRATION_END_DATE")

  def * = (id, name, description, dateOfEvent, registrationStartDate, registrationEndDate) <> ((Event.apply _).tupled, Event.unapply _)
}

object EventDAO {

  val events = TableQuery[Events]

  def getAll()(implicit session: Session): List[Event] = {
    events.list
  }

  def create(event: Event)(implicit session: Session): Unit = {
    events returning events.map(_.id) += event
  }
}
