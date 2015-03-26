package controllers

import play.api._
import play.api.db.slick._
import play.api.libs.functional.syntax._

import play.api.data._
import play.api.data.Forms._
import play.api.db.slick.Config.driver.simple.Session
import play.api.mvc._
import play.api.libs.json._
import play.api.data._
import play.api.data.Forms._
import models._

object Application extends Controller {

  /**implicit val cabinWrites: Writes[Cabin] = (
    (JsPath \ "id").write[Long] and
      (JsPath \ "name").write[String] and
      (JsPath \ "description").write[String] and
      (JsPath \ "capacity").write[Int] and
      (JsPath \ "name").write[BigDecimal]
    )(unlift(Cabin.unapply))**/

  implicit val cabinFormat = Json.format[Cabin]

  def index = DBAction { implicit rs =>
    Ok(views.html.index("", CabinDAO.getAll(), cabinForm))
  }

  def deleteCabin(id: Long) = DBAction { implicit rs =>
    CabinDAO.deleteCabin(id)
    Redirect(routes.Application.index).flashing("success" -> "Cabin deleted!")
  }

  def editCabin(id: Long) = DBAction { implicit rs =>
    val existingCabin = CabinDAO.findById(id)
    Ok(views.html.index("Edit existing item", CabinDAO.getAll(), cabinForm.fill(existingCabin)))
  }

  val cabinForm = Form(
    mapping(
      "id" -> optional(longNumber),
      "name" -> nonEmptyText,
      "description" -> text,
      "capacity" -> number(min=0),
      "price" -> bigDecimal
    )(Cabin.apply)(Cabin.unapply)
  )

  def createCabin() = DBAction { implicit rs =>
    cabinForm.bindFromRequest.fold (
      formWithErrors => BadRequest(views.html.index("Something went wrong during cabin save!", CabinDAO.getAll(), cabinForm)),
      cabinData => {
        cabinData.id match {
          case Some(id) => CabinDAO.updateCabin(id, cabinData)
          case None => CabinDAO.createCabin(cabinData)
        }

        Redirect(routes.Application.index).flashing("success" -> "Cabin created!")
      }
    )
  }

  def javascriptRoutes = Action{ implicit request =>
    Ok(Routes.javascriptRouter("jsRoutes")(
      routes.javascript.EventController.events,
      routes.javascript.EventController.create
    )).as("text/javascript")

  }

}