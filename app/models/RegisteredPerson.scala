package models

import java.sql.Timestamp
import java.text.SimpleDateFormat
import javax.inject.Inject

import org.joda.time.{DateTime, DateTimeZone}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.json._
import play.api.libs.json.Json._
import slick.driver.JdbcProfile
import slick.driver.PostgresDriver.api._

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

import slick.lifted.Tag

/**
 * Created by spokos on 8/4/15.
 */

case class Registration(id: Option[Long], cabinId: Long, eventId: Long, timestamp: Option[Timestamp] = Some(new Timestamp(DateTime.now(DateTimeZone.forOffsetHours(2)).getMillis)))

case class RegisteredPerson(id: Option[Long], registrationId: Long, firstName: String, lastName: String, email: String, dateOfBirth: String, clubNumber: String, nationality: Option[String], selectedDining: Int, contactPerson: Int)

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
  def nationality = column[String]("NATIONALITY")
  def selectedDining = column[Int]("SELECTED_DINING")
  def contactPerson = column[Int]("CONTACT_PERSON")

  def * = (id, registrationId, firstName, lastName, email, dateOfBirth, clubNumber, nationality.?, selectedDining, contactPerson) <> ((RegisteredPerson.apply _).tupled, RegisteredPerson.unapply _)
}

class RegistrationDAO @Inject()(cabinDAO: CabinDAO)(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[JdbcProfile] {

  val registrations = TableQuery[Registrations]
  val registeredPersons = TableQuery[RegisteredPersons]
  val events = TableQuery[Events]
  val eventCabins = TableQuery[EventCabins]
  val cabins = cabinDAO.getCabinTable()

  def saveRegistrationData(registration: Registration, persons: List[RegisteredPerson]) = {
    for {
      savedRegistration <- saveRegistration(registration)
      savedPersons <- saveRegistrationPersons(persons, savedRegistration.id.get)
    } yield(savedRegistration, savedPersons)
  }

  def saveRegistration(registration: Registration): Future[Registration] = {
    val insertQuery = registrations returning registrations.map(_.id) into ((registration, id) => registration.copy(id = id))
    val action = insertQuery += registration.copy(timestamp = Some(new Timestamp(DateTime.now(DateTimeZone.forOffsetHours(2)).getMillis)))
    db.run(action)
  }

  def saveRegistrationPersons(persons: List[RegisteredPerson], registrationId: Long) = {
    val toBeInserted = persons.map { person => registeredPersons.insertOrUpdate( person.copy(None, registrationId, person.firstName, person.lastName, person.email, person.dateOfBirth, person.clubNumber, person.nationality, person.selectedDining, person.contactPerson) ) }
    val inOneGo = DBIO.sequence(toBeInserted)
    db.run(inOneGo)
  }

  def loadEventRegistrations(eventId: Long): Future[Seq[Registration]] = {
    db.run( registrations.filter(_.eventId === eventId).result )
  }

  def loadRegistrationWithEventAndCabin(registrationId: Long): Future[RegistrationData] = {

    val registrationDataQuery = for {
      registration <- registrations if registration.id === registrationId
      event <- events if event.id === registration.eventId
      cabin <- cabins if cabin.id === registration.cabinId
    } yield (registration, event, cabin)

    db.run(registrationDataQuery.result.headOption.map {
        case None => throw new RuntimeException("No matching registration data for id #id")
        case Some(data) => RegistrationData(data._1, data._2, data._3)
    })
  }

  def loadRegistrationsWithPersons(eventId: Long): Future[Seq[(Registration, Cabin, RegisteredPerson)]] = {

    val registrationListQuery = for {
      registration <- registrations if registration.eventId === eventId
      cabin <- cabins if cabin.id === registration.cabinId
      person <- registeredPersons if person.registrationId === registration.id
    } yield (registration, cabin, person)

    db.run( registrationListQuery.result )
  }

  def personsInRegistration(registrationId: Long): Future[Seq[RegisteredPerson]] = {
    db.run(registeredPersons.filter(person => person.registrationId === registrationId).result)
  }

  def doesEventHaveRoomForSelectedRegistration(registration: Registration): Future[Boolean] = {

    def isAmountExceeded(currentCount: Int): Future[Boolean] = {
      getEventCabinByCabinIdAndEventId(registration.cabinId, registration.eventId).map { res:Option[EventCabin] =>
        res match {
          case None => true
          case Some(x) => x.amount > currentCount
        }
      }
    }

    val occupiedCabinCount:Future[Int] = db.run( registrations.filter(existingRegistration => existingRegistration.cabinId === registration.cabinId && existingRegistration.eventId === registration.eventId).length.result )
    occupiedCabinCount.flatMap { count:Int => isAmountExceeded(count)}
  }

  private def getEventCabinByCabinIdAndEventId(cabinId: Long, eventId: Long): Future[Option[EventCabin]] = {
    db.run( eventCabins.filter(item => item.eventId === eventId && item.cabinId === cabinId ).result.headOption )
  }
}
