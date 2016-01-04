import play.api.data.validation.ValidationError
import play.api.db.slick.{DBSessionRequest, DBAction}
import play.api.libs.json._
import play.api.mvc._
import play.mvc.Http.Request

/**
  * Created by spokos on 1/3/16.
  */
package object controllers {

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

  trait Secured {
    self: Controller =>
      def username(requestHeaders:RequestHeader) = requestHeaders.session.get(Security.username)

      def onUnauthorized(request:RequestHeader) = Redirect(routes.LoginController.login())

      def isAuthenticated(f: DBSessionRequest[AnyContent] => Result) = {
        Security.Authenticated(username, onUnauthorized) {user =>
          DBAction(request => f(request))
        }
      }
  }

}
