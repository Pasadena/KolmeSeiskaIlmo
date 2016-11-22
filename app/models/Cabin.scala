package models

import javax.inject.Inject

import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import slick.driver.JdbcProfile

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import play.api.libs.json._
import slick.driver.PostgresDriver.api._


/**
 * Created by spokos on 2/16/15.
 */
case class Cabin(id: Option[Long] = None, name: String, description: String, capacity: Int, price: BigDecimal)

object Cabin extends ((Option[Long], String, String, Int, BigDecimal) => Cabin){

  implicit val cabinFormat = Json.format[Cabin]

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

  def * = (id, name, description, capacity, price) <> (Cabin.tupled, Cabin.unapply)

  def maybe = (id, name.?, description.?, capacity.?, price.?).<>[Option[Cabin], (Option[Long], Option[String], Option[String], Option[Int], Option[BigDecimal])](
      { cabin =>
        cabin match {
          case (Some(id), Some(name), Some(description), Some(capacity), Some(price)) => Some(Cabin.apply(Some(id), name, description, capacity, price))
          case _ => None
        }
      },
      { cabin => None
      })
}

class CabinDAO @Inject()(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[JdbcProfile] {

  val cabins = TableQuery[Cabins]

  def getCabinTable(): TableQuery[Cabins] = cabins

  def getAll(): Future[Seq[Cabin]] = {
    db.run(cabins.result)
  }

  def createCabin(cabin:Cabin): Future[Cabin] = {
    val insertQuery = cabins returning cabins.map(_.id) into ((cabin, id) => cabin.copy(id = id))
    val action = insertQuery += cabin
    db.run(action)
  }

  def updateCabin(cabin:Cabin): Future[Cabin] = db.run {
    cabins.filter(_.id === cabin.id.get).update(cabin).map {
      case _ => cabin
    }
  }

  def deleteCabin(id: Long) = {
    db.run( cabins.filter(_.id === id).delete)
  }


  def findById(id: Long): Future[Cabin] = {
    db.run( cabins.filter(_.id === id).result.headOption.map { res:Option[Cabin] =>
      res match {
        case Some(item) => item
        case None => throw new IllegalArgumentException("No cabin with id " + id + " found!")
      }
    })
  }

  def findByIdList(idList: List[Long]): Future[Seq[Cabin]] = {
    db.run( cabins.filter(cabin => cabin.id inSet idList).result )
  }

}





