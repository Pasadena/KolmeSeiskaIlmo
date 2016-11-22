package models

import org.scalatest.mock.MockitoSugar
import org.scalatestplus.play.PlaySpec
import play.api.db.slick.DatabaseConfigProvider
import slick.lifted.TableQuery

/**
  * Created by spokos on 18/11/16.
  */
class RegistrationDaoSpec extends PlaySpec with MockitoSugar {

  "EventDAO#createEventAndCabins" should {
    "save event and cabins" in {
      val mockConfig = mock[DatabaseConfigProvider]
      val mockedEventsTable = mock[TableQuery[Events]]
      val mockedEventCabins = mock[TableQuery[EventCabins]]

      val testDao = new EventDAO()(mockConfig) {
        override val eventCabins = mockedEventCabins
        override val events = mockedEventsTable
      }

}
