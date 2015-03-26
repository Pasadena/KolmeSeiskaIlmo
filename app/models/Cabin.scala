package models

import play.api.db._
import play.api.db.slick.Config.driver.simple._
import play.api.Play.current
import play.api.db.DB
import play.api.libs.json._
import play.api.libs.functional.syntax._

/**
 * Created by spokos on 2/16/15.
 */
case class Cabin(id: Option[Long] = None, name: String, description: String, capacity: Int, price: BigDecimal)

object Cabin extends ((Option[Long], String, String, Int, BigDecimal) => Cabin){

  def getIdValue(id: Option[Long]): Long = {
    id match {
      case Some(cabinId) => cabinId
      case _ => -1
    }
  }
}

class Cabins(tag: Tag) extends Table[Cabin](tag, "CABIN") {
  def id = column[Option[Long]]("ID", O.PrimaryKey, O.AutoInc)
  def name = column[String]("NAME_")
  def description = column[String]("DESCRIPTION_")
  def capacity = column[Int]("CAPACITY")
  def price = column[BigDecimal]("PRICE")

  def * = (id, name, description, capacity, price) <> (Cabin.tupled, Cabin.unapply _)
}

object CabinDAO {

    val cabins = TableQuery[Cabins]

    def getAll()(implicit session:Session): List[Cabin] = {
      cabins.list
    }

    def createCabin(cabin:Cabin)(implicit session:Session) = {
      cabins returning cabins.map(_.id) += cabin
    }

    def updateCabin(id: Long, cabin:Cabin)(implicit session:Session) = {
      val toUpdateCabin = cabin.copy(cabin.id, cabin.name, cabin.description, cabin.capacity, cabin.price)
      cabins.filter(_.id === id).update(toUpdateCabin)
    }

    def deleteCabin(id: Long)(implicit session:Session): Unit = {
      val toDeleteObject = cabins.filter(_.id === id)
      toDeleteObject.delete
    }

    def findById(id: Long)(implicit session:Session): Cabin = {
      cabins.filter(_.id === id).firstOption match {
        case Some(item) => item
        case None => throw new IllegalArgumentException("No cabin with id " + id + " found!")
      }
    }

}





