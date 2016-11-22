package controllers

import com.typesafe.config.ConfigFactory
import play.api.libs.json.{JsValue, Json}
import play.api.mvc._
import play.api.db.slick._
import javax.inject._

import slick.driver.JdbcProfile

/**
  * Created by spokos on 1/3/16.
  */
class LoginController @Inject()(dbConfigProvider: DatabaseConfigProvider)  extends Controller {

  case class Credentials(userName: String, password: String)
  implicit val credentialsFormat = Json.format[Credentials]

  def login = Action { Ok(views.html.login())}


  def logUserIn: Action[JsValue] = Action(BodyParsers.parse.json) { implicit rs =>
    val jsResult = rs.body.validate[Credentials]
    jsResult match {
      case data => {
        val credentials = data.asOpt.getOrElse(Credentials("", ""))
        val credentialsValid = validateCredentials(credentials)
        credentialsValid match {
          case true => Ok(Json.obj("status" -> "Ok")).withSession(Security.username -> credentials.userName)
          case false => BadRequest("Username of password incorrect!")
        }
      }
    }
  }

  def validateCredentials(credentials: Credentials): Boolean = {
    val configOptions = ConfigFactory.load()
    if(!credentials.userName.equals(configOptions.getString("authentication.username")))
      return false
    if(!credentials.password.equals(configOptions.getString("authentication.password")))
      return false
    true
  }

}
