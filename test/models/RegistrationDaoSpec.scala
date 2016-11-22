package models

import org.scalatest._
import org.scalatest.mock.MockitoSugar
import org.scalatestplus.play._

import org.mockito.Mockito._
import play.api.db.slick.DatabaseConfigProvider
import slick.driver.PostgresDriver.api._

/**
  * Created by spokos on 03/11/16.
  */
class RegistrationDaoSpec extends PlaySpec with MockitoSugar {

  "RegistrationDAO#doesEventHaveRoomForSelectedRegistration" should {
    "return true when event has available cabins" in {
      val mockConfig = mock[DatabaseConfigProvider]
      val mockedRegistrationPersonTable = mock[TableQuery[RegisteredPersons]]
      val mockedEventCabins = mock[TableQuery[EventCabins]]
      val mockedRegistrations = mock[TableQuery[Registrations]]

      when(mockedEventCabins.filter(any[Long])) thenReturn Seq(EventCabin(Some(1), Some(1), 1, 4))
      when(mockedRegistrations.filter(any[Long])) thenReturn (Seq(Registration(Some(1), 1, 1, None)))

      val testCabinDao = new CabinDAO(mockConfig)
      val testDao = new RegistrationDAO(testCabinDao)(mockConfig) {
        override val registeredPersons = mockedRegistrationPersonTable
        override val eventCabins = mockedEventCabins
        override val registrations = mockedRegistrations
      }

      val result = testDao.doesEventHaveRoomForSelectedRegistration(Registration(Some(1), 1, 1, None))
      result mustBe true
    }
  }

}
