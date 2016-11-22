package controllers

import models.{Cabin, CabinDAO}
import play.api.libs.json.{JsValue, Json}
import play.api.mvc._
import play.api.db.slick._
import javax.inject._

import scala.concurrent.ExecutionContext.Implicits.global
import slick.driver.JdbcProfile

import scala.concurrent.Future


/**
 * Created by spokos on 6/1/15.
 */
class CabinController @Inject()(cabinDAO: CabinDAO)(dbConfigProvider: DatabaseConfigProvider) extends Controller with Secured {

  val dbConfig = dbConfigProvider.get[JdbcProfile]

  def cabinIndex = isAuthenticated { implicit rs =>
    Ok(views.html.admin.cabins())
  }

  def fetchCabins(): Action[AnyContent] = Action.async { implicit rs =>
    cabinDAO.getAll().map(users => Ok(Json.toJson(users)))
  }


  def fetchCabin(id: Long) = Action.async { implicit rs =>
    cabinDAO.findById(id).map(cabin => Ok(Json.toJson(cabin)))
  }


  def createCabin()  = Action.async(BodyParsers.parse.json) { implicit rs =>
    parsePost[Cabin](this, {
      case cabin => cabinDAO.createCabin(cabin)
        .map(savedCabin => Ok(Json.obj("status" -> "Ok", "message" -> "Cabin succesfully saved!", "cabin" -> Json.toJson(savedCabin))))
    })
  }

  def deleteCabin(id: Long) = Action.async { implicit rs =>
    cabinDAO.deleteCabin(id).map(res => (res == 1) match {
      case true => Ok(Json.obj("status" -> "Ok", "message" -> "Cabin succesfully deleted"))
      case false => BadRequest(Json.obj("status" -> "KO", "message" -> "Unexpected error happened while deleteting cabin!"))
    })
  }

  def updateCabin(id: Long): Action[JsValue] = Action.async(BodyParsers.parse.json) { implicit rs =>
    parsePost[Cabin](this, {
      case cabin => cabinDAO.updateCabin(cabin)
        .map(updated =>  Ok(Json.obj("status" -> "Ok", "message" -> "Cabin succesfully updated!", "cabin" -> Json.toJson(cabin))))
    })
  }


}
