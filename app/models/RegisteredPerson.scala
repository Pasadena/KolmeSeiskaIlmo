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

case class RegisteredPerson(id: Option[Long], registrationId: Long, firstName: String, lastName: String, email: String, dateOfBirth: String, clubNumber: String, selectedDining: Int, contactPerson: Int)

case class RegistrationData(registration: Registration, event: Event, cabin: Cabin)

case class RegistrationWithPersons(registration: Registration, cabin: Cabin, persons: Seq[RegisteredPerson])

object Registration {

  def timestampToDateTime(t: Timestamp): DateTime = new DateTime(t.getTime)

  def dateTimeToTimestamp(dt: DateTime): Timestamp = new Timestamp(dt.getMillis)

  implicit val timestampFormat = new Format[Timestamp] {

    def writes(t: Timestamp): JsValue = toJson(timestampToDateTime(t))

    def reads(json: JsValue): JsResult[Timestamp] = fromJson[DateTime](json).map(dateTimeToTimestamp)

  }

  implicit val registrationFormat = Json.format[Registration]
}

object RegisteredPerson {
  implicit val registeredPersonFormat = Json.format[RegisteredPerson]
}

object RegistrationWithPersons {
  implicit val registrationWithPersonsFormat = Json.format[RegistrationWithPersons]
}

class Registrations(tag: Tag) extends Table[Registration](tag, "REGISTRATION") {
  def id = column[Option[Long]]("ID", O.PrimaryKey, O.AutoInc)
  def cabinId = column[Long]("CABIN_ID")
  def eventId = column[Long]("EVENT_ID")
  def timestamp = column[Option[Timestamp]]("TIMESTAMP_")

  def event = foreignKey("EVENT_FK", eventId, TableQuery[Events])(_.id.get)

  def cabin = foreignKey("CABIN_FK", cabinId, TableQuery[Cabins])(_.id.get)

  def * = (id, cabinId, eventId, timestamp) <> ((Registration.apply _).tupled, Registration.unapply _)
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
  val events = TableQuery[Events]
  val cabins = TableQuery[Cabins]

  def saveRegistration(registration: Registration)(implicit session: Session): Long = {
    ((registrations returning registrations.map(_.id)) += registration.copy(registration.id, registration.cabinId, registration.eventId, Some(new Timestamp(System.currentTimeMillis())))).get
  }

  def saveRegistrationPersons(persons: List[RegisteredPerson], registrationId: Long)(implicit session: Session) = {
    for(person <- persons)  registeredPersons += person.copy(None, registrationId, person.firstName, person.lastName, person.email, person.dateOfBirth, person.clubNumber, person.selectedDining, person.contactPerson)
  }

  def loadEventRegistrations(eventId: Long)(implicit session: Session): List[Registration] = {
    registrations.filter(_.eventId === eventId).list
  }

  def loadRegistrationWithEventAndCabin(registrationId: Long)(implicit session: Session): RegistrationData = {
    val registrationData = for {
      registration <- registrations if registration.id === registrationId
      event <- events if event.id === registration.eventId
      cabin <- cabins if cabin.id === registration.cabinId
    } yield (registration, event, cabin)
    val registrationDataList = registrationData.list
    registrationDataList.headOption match {
      case None => throw new RuntimeException("No matching registration data for id #id")
      case Some(data) => RegistrationData(data._1, data._2, data._3)
    }
  }

  def loadRegistrationsWithPersons(eventId: Long)(implicit session:Session): List[RegistrationWithPersons] = {
    val registrationList = for {
      registration <- registrations if registration.eventId === eventId
      cabin <- cabins if cabin.id === registration.cabinId
      person <- registeredPersons if person.registrationId === registration.id
    } yield (registration, cabin, person)
    registrationList.list.groupBy(_._1).map { case (key, value) => RegistrationWithPersons(key, value.head._2, value.map(_._3))}.toList.sortWith(_.registration.timestamp.get.getTime() > _.registration.timestamp.get.getTime())
  }

}
