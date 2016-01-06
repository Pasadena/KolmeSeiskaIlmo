package controllers

import java.io.{FileOutputStream, File}
import java.util.Date

import com.typesafe.config.ConfigFactory
import models._
import org.joda.time.DateTime
import play.api.Logger
import play.api.data.validation.ValidationError
import play.api.mvc._
import play.api.libs.json._
import play.api.db.slick._
import play.api.libs.mailer._
import play.api.Play.current
import play.api.i18n.Messages
import it.innove.play.pdf.PdfGenerator
import org.apache.commons.mail.EmailAttachment

/**
 * Created by spokos on 8/4/15.
 */
object RegistrationController extends Controller {

  val registrationLogger = Logger(this.getClass)

  implicit def tuple3Reads[A, B, C](implicit aFormat: Format[A], bFormat: Format[B], cFormat: Format[C]): Reads[Tuple3[A, B, C]] = Reads[Tuple3[A, B, C]] {
    case JsArray(arr) if arr.size == 3 => for {
      a <- aFormat.reads(arr(0))
      b <- bFormat.reads(arr(1))
      c <- cFormat.reads(arr(2))

    } yield (a, b, c)
    case _ => JsError(Seq(JsPath() -> Seq(ValidationError("Expected array of two elements"))))
  }

  implicit def tuple3Writes[A, B, C](implicit aWrites: Writes[A], bWrites: Writes[B], cWrites: Format[C]): Writes[Tuple3[A, B, C]] = new Writes[Tuple3[A, B, C]] {
    def writes(tuple: Tuple3[A, B, C]) = JsArray(Seq(aWrites.writes(tuple._1), bWrites.writes(tuple._2), cWrites.writes(tuple._3)))
  }

  implicit def tuple2Reads[A, B](implicit aFormat: Format[A], bFormat: Format[B]): Reads[Tuple2[A, B]] = Reads[Tuple2[A, B]] {
    case JsArray(arr) if arr.size == 2 => for {
      a <- aFormat.reads(arr(0))
      b <- bFormat.reads(arr(1))

    } yield (a, b)
    case _ => JsError(Seq(JsPath() -> Seq(ValidationError("Expected array of two elements"))))
  }

  implicit def tuple2Writes[A, B](implicit aWrites: Writes[A], bWrites: Writes[B]): Writes[Tuple2[A, B]] = new Writes[Tuple2[A, B]] {
    def writes(tuple: Tuple2[A, B]) = JsArray(Seq(aWrites.writes(tuple._1), bWrites.writes(tuple._2)))
  }

  def loadEventRegisteredPersons(eventId: Long) = DBAction { implicit rs =>
    Ok(Json.toJson(RegistrationDAO.loadRegistrationsWithPersons(eventId)))
  }

  def register = DBAction(parse json) { implicit rs =>
    val jsResult = rs.body.validate[(List[RegisteredPerson], Registration)]
    jsResult match {
      case registrationData => registrationData.asOpt match {
        case Some((list, registration)) => {
          val registrationId = RegistrationDAO.saveRegistration(registration)
          RegistrationDAO.saveRegistrationPersons(list, registrationId)
          list.filter(_.contactPerson == 1) match {
            case Nil => sendConfirmationMail(list(0), list, RegistrationDAO.loadRegistrationWithEventAndCabin(registrationId), rs.request.host)
            case x :: xs => sendConfirmationMail(x, list, RegistrationDAO.loadRegistrationWithEventAndCabin(registrationId), rs.host)
          }
          Ok(Json.obj("status" -> "Ok", "message" -> "Registration succesfully saved"))
        }
        case None => BadRequest(Json.obj("status" -> "KO", "message" -> "Unexpected error happened while parsing registration list"))
      }
    }
  }

  def loadRegistrations(eventId: Long) = DBAction { implicit rs =>
    Ok(Json.obj("registrations" -> Json.toJson(RegistrationDAO.loadEventRegistrations(eventId))))
  }

  def sendConfirmationMail(contactPerson: RegisteredPerson, allPersonsInCabin: List[RegisteredPerson], registrationData: RegistrationData, host: String) = {
    val diningsMap: Map[Int, (String, Double)] = Map(0 -> ("Päivällinen, 1. kattaus", 32.0), 1 -> ("Päivällinen, 1. kattaus", 32.0), 2 -> ("Meriaamiainen", 7.5), 3 -> ("Lounas", 16.0))
    val configOptions = ConfigFactory.load()
    val fonts = List("fonts/FreeSans.ttf")
    PdfGenerator.loadLocalFonts(fonts.toArray)
    val attachment = PdfGenerator.toBytes(views.html.test.render(allPersonsInCabin, diningsMap, registrationData), host)
    val outputStream = new java.io.FileOutputStream("Yhtenveto_teekkariristeily.pdf")
    outputStream.write(attachment)

    val email = Email(Messages("registration.email.title"), configOptions.getString("smtp.user"),
      Seq(contactPerson.email),
      attachments = Seq(
        AttachmentData("Yhtenveto_teekkariristeily.pdf", attachment, "application/pdf", Some("Simple data"), Some(EmailAttachment.INLINE))
      ),
      bodyText = Some(views.txt.email(configOptions.getString("smtp.user")).toString())
    )
    try {
      MailerPlugin.send(email)
    } catch {
      case e:Exception => {
        System.out.println("Exception in mail sending " + e.getMessage)
        registrationLogger.error("Failed to send email", e)
      }
    }
  }

  def foo = DBAction { implicit rs =>
    val persons = List(RegisteredPerson(None, -1, "testiEtunimi", "testisukunimi", "foo@bar.fi", "23.03.2015", "111", 1, 1),
      RegisteredPerson(None, -1, "TestingFirst", "TestingLast", "baz@baz.fi", "05.03.2005", "111", 2, 0))
    val diningsMap: Map[Int, (String, Double)] = Map(0 -> ("Päivällinen, 1. kattaus", 32.0), 1 -> ("Päivällinen, 1. kattaus", 32.0), 2 -> ("Meriaamiainen", 7.5), 3 -> ("Lounas", 16.0))
    Ok(views.html.test(persons, diningsMap, RegistrationData(Registration(None, 1, 1, None), Event(Some(1), "Foobar", "Bazquuz", new DateTime(), new DateTime(), new DateTime()),
    Cabin(Some(1), "A4", "Arara", 4, 100.0))))
  }

}
