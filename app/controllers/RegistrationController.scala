package controllers

import java.time.LocalDate
import java.time.format.DateTimeFormatter

import com.typesafe.config.ConfigFactory
import it.innove.play.pdf.PdfGenerator
import models._
import org.apache.commons.mail.EmailAttachment
import org.joda.time.DateTime
import play.api.Logger
import play.api.data.validation.ValidationError
import play.api.i18n.Messages
import play.api.libs.json.{JsValue, Json, _}
import play.api.libs.mailer._
import javax.inject._
import play.api.libs.mailer._
import play.api.i18n._

import slick.driver.JdbcProfile
import play.api.mvc._
import play.api.db.slick._
import javax.inject._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
 * Created by spokos on 8/4/15.
 */
class RegistrationController @Inject()(registrationDAO: RegistrationDAO)(eventDAO: EventDAO)
    (mailerClient: MailerClient)(pdfGenerator: PdfGenerator)(dbConfigProvider: DatabaseConfigProvider)
    (val messagesApi: MessagesApi) extends Controller with I18nSupport {

  val registrationLogger = Logger("controllers")

  def loadEventRegisteredPersons(eventId: Long): Action[AnyContent] = Action.async { implicit rs =>
    registrationDAO.loadRegistrationsWithPersons(eventId).map(data => Ok(Json.toJson(groupRegistrationData(data))))
  }

  private def groupRegistrationData(registrationPartials: Seq[(Registration, Cabin, RegisteredPerson)]): Seq[RegistrationWithPersons] = {
    registrationPartials.groupBy(_._1)
    .map { case (key, value) => RegistrationWithPersons(key, value.head._2, value.map(_._3)) }
      .toList.sortWith(_.registration.timestamp.get.getTime > _.registration.timestamp.get.getTime)
  }

  def register() = Action.async(BodyParsers.parse.json) { implicit rs =>
    parsePost[(List[RegisteredPerson], Registration)](this, {
      registrationData => {
        eventDAO.isEventRegistrationInProgress(registrationData._2.eventId).flatMap {
          case false => Future.successful(BadRequest(Json.obj("status" -> "KO", "message" -> "Registration is not currently in progress")))
          case true => {
            registrationLogger.debug("Registering data " + registrationData)
            registrationDAO.doesEventHaveRoomForSelectedRegistration(registrationData._2).flatMap {
              case false => Future.successful(BadRequest(Json.obj("status" -> "KO", "message" -> "The selected cabin type was sold out during registration. Please select different cabin")))
              case true => {
                registrationDAO.saveRegistrationData(registrationData._2, registrationData._1)
                  .flatMap(savedData => registrationDAO.loadRegistrationWithEventAndCabin(savedData._1.id.get)
                    .map(registrationDetails => {
                      sendConfirmationMail(registrationData._1, registrationDetails, rs.host)
                      Ok(Json.obj("status" -> "Ok", "message" -> "Registration succesfully saved"))
                    })
                ).recover {
                    case e => {
                        registrationLogger.error("Unknown error happened during registration save: " +e)
                        BadRequest(Json.obj("status" -> "KO", "message" -> "Unknown error happened during registration' save!"))
                    }
                }
              }
            }
          }
        }
      }
    })
  }

  def loadRegistrations(eventId: Long): Action[AnyContent] = Action.async { implicit rs =>
    registrationDAO.loadEventRegistrations(eventId).map(registrations =>  Ok(Json.obj("registrations" -> Json.toJson(registrations))))
  }

  private def getContactPersonFromList(persons: List[RegisteredPerson]) = persons.filter(_.contactPerson == 1) match {
    case Nil => persons.head
    case x :: xs => x
  }

  def sendConfirmationMail(allPersonsInCabin: List[RegisteredPerson], registrationData: RegistrationData, host: String) = {
    import scala.collection.JavaConverters._
    val configOptions = ConfigFactory.load()
    val fonts = List("fonts/FreeSans.ttf")

    val dueDate = LocalDate.now.plusDays(14)
    val dueDateFormatted =  dueDate.format(DateTimeFormatter.ofPattern("d.M.yyyy"))
    pdfGenerator.loadLocalFonts(fonts.asJava)
    val attachment = pdfGenerator.toBytes(views.html.test.render(allPersonsInCabin, diningsMap, registrationData, dueDateFormatted), host)
    val outputStream = new java.io.FileOutputStream("Yhtenveto_teekkariristeily.pdf")
    outputStream.write(attachment)

    val email = Email(
      subject = "Tervetuloa teekkariristeilylle", from= configOptions.getString("play.mailer.user"),
      to = Seq(getContactPersonFromList(allPersonsInCabin).email),
      attachments = Seq(
        AttachmentData("Yhtenveto_teekkariristeily.pdf", attachment, "application/pdf", Some("Simple data"), Some(EmailAttachment.INLINE))
      ),
      bodyText = Some(views.txt.email().toString())
    )
    try {
      mailerClient.send(email)
    } catch {
      case e:Exception => {
        System.out.println("Exception in mail sending " + e.getMessage)
        registrationLogger.error("Failed to send email", e)
      }
    }
  }

  val diningsMap:Map[Int, (String, Double)] = Map(0 -> ("Buffet-illallinen, 2.kattaus", 35.00),
  1 -> ("Buffet-illallinen, 2. kattaus", 35.00), 1 -> ("Meriaamiainen", 10.50), 2 -> ("Buffet-lounas", 31.00))

  def foo(): Action[AnyContent] = Action.async { implicit rs =>
    val dueDate = LocalDate.now.plusDays(14)
    val dueDateFormatted =  dueDate.format(DateTimeFormatter.ofPattern("d.M.yyyy"))
    val persons = List(RegisteredPerson(None, -1, "testiEtunimi", "testisukunimi", "foo@bar.fi", "23.03.2015", "111", Some("Suomi"), 1, 1),
      RegisteredPerson(None, -1, "TestingFirst", "TestingLast", "baz@baz.fi", "05.03.2005", "111", Some("Suomi"), -1, 1))
    Future.successful(Ok(views.html.test(persons, diningsMap, RegistrationData(Registration(None, 1, 1, None), Event(Some(1), "Foobar", "Bazquuz", new DateTime(), new DateTime(), new DateTime(), true),
    Cabin(Some(1), "A4", "Arara", 4, 100.0)), dueDateFormatted)))
  }

}
