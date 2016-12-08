import play.api.data.validation.ValidationError
import play.api.libs.json._
import play.api.mvc._

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

/**
  * Created by spokos on 1/3/16.
  */
package object controllers {

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

  def parsePost[T](controller: Controller, onSuccess: T => Future[Result])(implicit request:Request[JsValue], reads:Reads[T]) = {
    val parsedJson = request.body.validate[T]
    parsedJson.fold(
      errors =>  {
          System.out.println(errors)
          Future.successful(controller.BadRequest(Json.obj("status" -> "KO",
              "message" -> "Unexpected error happened during request parsing!")))
    },
      cabin => onSuccess.apply(cabin).recover {
        case error => {
          error.printStackTrace()
          System.out.println(error)
          controller.BadRequest(Json.obj("status" -> "KO", "message" -> "Operation failed with unexpected error!"))
        }
      }
    )
  }

  trait Secured {
    self: Controller =>
      def username(requestHeaders:RequestHeader) = requestHeaders.session.get(Security.username)

      def onUnauthorized(request:RequestHeader) = Redirect(routes.LoginController.login())

      def isAuthenticated(f: Request[AnyContent] => Result)  = {
        Security.Authenticated(username, onUnauthorized) { user =>
          Action(request => f(request))
        }
      }
  }

}
