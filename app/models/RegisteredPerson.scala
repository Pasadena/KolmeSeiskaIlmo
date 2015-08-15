package models

import java.sql.Timestamp
import java.text.SimpleDateFormat

import org.joda.time.DateTime
import play.api.db.slick.Config.driver.simple._
import play.api.libs.json._
import play.api.libs.json.Json._

/**
 * Created by spokos on 8/4/15.
 */

case class Registration(id: Option[Long], cabinId: Long, eventId: Long, timestamp: Option[Timestamp])

object Registration {

  def timestampToDateTime(t: Timestamp): DateTime = new DateTime(t.getTime)

  def dateTimeToTimestamp(dt: DateTime): Timestamp = new Timestamp(dt.getMillis)

  implicit val timestampFormat = new Format[Timestamp] {

    def writes(t: Timestamp): JsValue = toJson(timestampToDateTime(t))

    def reads(json: JsValue): JsResult[Timestamp] = fromJson[DateTime](json).map(dateTimeToTimestamp)

  }

  implicit val registrationFormat = Json.format[Registration]
}

class Registrations(tag: Tag) extends Table[Registration](tag, "REGISTRATION") {
  def id = column[Option[Long]]("ID", O.PrimaryKey, O.AutoInc)
  def cabinId = column[Long]("CABIN_ID")
  def eventId = column[Long]("EVENT_ID")
  def timestamp = column[Option[Timestamp]]("TIMESTAMP_")

  def * = (id, cabinId, eventId, timestamp) <> ((Registration.apply _).tupled, Registration.unapply _)
}

case class RegisteredPerson(id: Option[Long], registrationId: Long, firstName: String, lastName: String, email: String, dateOfBirth: String, clubNumber: String, selectedDining: Int, contactPerson: Int)

object RegisteredPerson {
  implicit val registeredPersonFormat = Json.format[RegisteredPerson]
}

class RegisteredPersons(tag: Tag) extends Table[RegisteredPerson](tag, "REGISTERED_PERSONS") {
  def id = column[Option[Long]]("ID", O.PrimaryKey, O.AutoInc)
  def registrationId = column[Long]("REGISTRATION_ID")
  def firstName = column[String]("FIRST_NAME")
  def lastName = column[String]("LAST_NAME")
  def email = column[String]("EMAIL")
  def dateOfBirth= column[String]("DATE_OF_BIRTH")
  def clubNumber = column[String]("CLUB_NUMBER")
  def selectedDining = column[Int]("SELECTED_DINING")
  def contactPerson = column[Int]("CONTACT_PERSON")

  def * = (id, registrationId, firstName, lastName, email, dateOfBirth, clubNumber, selectedDining, contactPerson) <> ((RegisteredPerson.apply _).tupled, RegisteredPerson.unapply _)
}

object RegistrationDAO {

  val registrations = TableQuery[Registrations]
  val registeredPersons = TableQuery[RegisteredPersons]

  def saveRegistration(registration: Registration)(implicit session: Session): Long = {
    ((registrations returning registrations.map(_.id)) += registration.copy(registration.id, registration.cabinId, registration.eventId, Some(new Timestamp(System.currentTimeMillis())))).get
  }

  def saveRegistrationPersons(persons: List[RegisteredPerson], registrationId: Long)(implicit session: Session) = {
    for(person <- persons)  registeredPersons += person.copy(None, registrationId, person.firstName, person.lastName, person.email, person.dateOfBirth, person.clubNumber, person.selectedDining, 1)
  }

}
