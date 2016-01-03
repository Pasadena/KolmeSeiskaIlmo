package controllers

import com.typesafe.config.ConfigFactory
import play.api.db.slick.DBAction
import play.api.libs.json.Json
import play.api.mvc.Controller

/**
  * Created by spokos on 1/3/16.
  */
object LoginController extends Controller {

  case class Credentials(userName: String, password: String)
  implicit val credentialsFormat = Json.format[Credentials]

  def login = DBAction { Ok(views.html.login())}

  def logUserIn = DBAction(parse json) { implicit rs =>
    val jsResult = rs.body.validate[Credentials]
    jsResult match {
      case data => {
        val credentials = data.asOpt.getOrElse(Credentials("", ""))
        val credentialsValid = validateCredentials(credentials)
        credentialsValid match {
          //case true => Redirect(routes.EventController.adminIndex()).withSession("user" -> credentials.userName)
          case true => Ok(Json.obj("status" -> "Ok"))
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
