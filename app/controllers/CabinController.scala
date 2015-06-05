package controllers

import models.{CabinDAO, Cabin}
import play.api.db.slick.DBAction
import play.api.libs.json.Json
import play.api.mvc.Controller
import play.api.db.slick._


/**
 * Created by spokos on 6/1/15.
 */
object CabinController extends Controller {

  def cabinIndex = DBAction { implicit rs =>
    Ok(views.html.admin.cabins())
  }

  def fetchCabins() = DBAction { implicit rs =>
    Ok(Json.toJson(CabinDAO.getAll()))
  }

  def fetchCabin(id: Long) = DBAction { implicit rs =>
    Ok(Json.toJson(CabinDAO.findById(id)))
  }

  def createCabin() = DBAction(parse json) { implicit rs =>
    val jsResult = rs.body.validate[Cabin]
    jsResult match {
      case cabinOption => cabinOption.asOpt match {
        case Some(cabin) => CabinDAO.createCabin(cabin) match {
          case Some(id) => Ok(Json.obj("status" -> "Ok", "message" -> "Cabin succesfully saved!", "cabin" -> Json.toJson(CabinDAO.findById(id))))
          case None => BadRequest(Json.obj("status" -> "KO", "message" -> "Unexpected error happened during cabin save!"))
        }
        case None => BadRequest(Json.obj("status" -> "KO", "message" -> "Unexpected error happened during request parsing!"))
      }
    }
  }

  def deleteCabin(id: Long) = DBAction { implicit rs =>
    (CabinDAO.deleteCabin(id) == 1) match {
      case true => Ok(Json.obj("status" -> "Ok", "message" -> "Cabin succesfully deleted"))
      case false => BadRequest(Json.obj("status" -> "KO", "message" -> "Unexpected error happened while deleteting cabin!"))
    }
  }

  def updateCabin(id: Long) = DBAction(parse json) { implicit rs =>
    val jsResult = rs.body.validate[Cabin]
    jsResult match {
      case cabinData => cabinData.asOpt match {
        case Some(cabin) =>
          CabinDAO.updateCabin(cabin)
          Ok(Json.obj("status" -> "Ok", "message" -> "Cabin succesfully updated!", "cabin" -> Json.toJson(CabinDAO.findById(id))))
        case None => BadRequest(Json.obj("status" -> "KO", "message" -> "Unexpected error happened cabin event update!"))
      }
    }
  }


}
