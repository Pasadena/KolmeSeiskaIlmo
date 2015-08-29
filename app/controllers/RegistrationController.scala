package controllers

import models.{Cabin, Registration, RegistrationDAO, RegisteredPerson}
import play.api.data.validation.ValidationError
import play.api.mvc._
import play.api.libs.json._
import play.api.db.slick._

/**
 * Created by spokos on 8/4/15.
 */
object RegistrationController extends Controller {

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

  def register = DBAction(parse json) { implicit rs =>
    val jsResult = rs.body.validate[(List[RegisteredPerson], Registration)]
    jsResult match {
      case registrationData => registrationData.asOpt match {
        case Some((list, registration)) => {
          val registrationId = RegistrationDAO.saveRegistration(registration)
          RegistrationDAO.saveRegistrationPersons(list, registrationId)
          Ok(Json.obj("status" -> "Ok", "message" -> "Registration succesfully saved"))
        }
        case None => BadRequest(Json.obj("status" -> "KO", "message" -> "Unexpected error happened while parsing registration list"))
      }
    }
  }

  def loadRegistrations(eventId: Long) = DBAction { implicit rs =>
    Ok(Json.obj("registrations" -> Json.toJson(RegistrationDAO.loadEventRegistrations(eventId))))
  }

}
