package util

import java.io.{FileOutputStream, File}

import models.{Event, RegistrationWithPersons}
import org.apache.poi.ss.usermodel.{BorderStyle, Font, CellStyle}
import org.apache.poi.ss.util.CellRangeAddress
import org.apache.poi.xssf.usermodel.{XSSFCellStyle, XSSFRow, XSSFSheet, XSSFWorkbook}
import play.api.Logger

/**
  * Created by spokos on 1/29/16.
  */
object ExcelUtils {

  val REGISTRATION_DATA_COLUMNS = 13

  def generateExcelFronRegisteredPersons(registrations: Seq[RegistrationWithPersons], event: Event, logger: Logger): File = {
      try {
        val file = new File(s"Henkilöyhteenveto ${event.name}.xlsx")
        val fileOut = new FileOutputStream(file);
        val workbook = new XSSFWorkbook()
        val summarySheet = workbook.createSheet("Yhteenveto")

        val nextAvailableRowAfterHeader = generateHeader(summarySheet, workbook, 1)
        generatePersonRows(summarySheet, workbook, registrations, nextAvailableRowAfterHeader, logger)

        resizeColumnsToContent(summarySheet)

        workbook.write(fileOut)
        fileOut.close()
        file
    } catch {
        case e:Exception => {
            logger.error("Unknown error happened excel generation: " +e)
            null
        }
    }
  }

  private def resizeColumnsToContent(worksheet: XSSFSheet) = {
    0 to REGISTRATION_DATA_COLUMNS foreach(columnIndex => worksheet.autoSizeColumn(columnIndex))
  }

  private def generateHeader(sheet: XSSFSheet, workBook: XSSFWorkbook, nextAvailableRow: Int): Int = {
    val headerRow = sheet.createRow(nextAvailableRow)
    val headerCell = headerRow.createCell(0)
    headerCell.setCellValue("Ilmoittautumisten yhteenveto")
    headerCell.setCellStyle(this.creteBoldFontStyle(workBook, 14))
    sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 3))
    nextAvailableRow +1
  }

  private def generatePersonRows(sheet: XSSFSheet, workBook: XSSFWorkbook, registrations: Seq[RegistrationWithPersons], nextAvailableRow: Int, logger: Logger): Unit = {
    var nextRow = generateTableHeader(sheet, workBook, nextAvailableRow +1)
    var cabinIndex = 1
    registrations foreach {registration =>
        try {
            nextRow = createRegistrationRows(sheet, workBook, registration, nextRow, cabinIndex)
            cabinIndex += 1
        } catch {
            case e:Exception => {
                logger.debug("Failing registration" +registration)
                logger.error("Unknown error happened excel row generation: " +e)
            }
        }
    }
  }

  private def generateTableHeader(sheet: XSSFSheet, workBook: XSSFWorkbook, nextAvailableRow: Int): Int = {
    var headerCellPosition = 0
    val tableHeadersRow = sheet.createRow(nextAvailableRow)
    val columnHeaders = Array("Hyttinumero", "Luokka", "Club One numero", "Sukunimi", "Etunimi", "Sähköpostiosoite", "Syntymäaika (pp.kk.yyyy)",
    "Sukupuoli (M/F)", "Kansalaisuus", "Illallinen 1.", "Illallinen 2.", "Aamiainen", "Lounas")

    val columnHeaderStyle = this.createBorderedCellStyle(workBook, true)
    columnHeaders foreach { columnName =>
      val columnHeaderCell = tableHeadersRow.createCell(headerCellPosition)
      columnHeaderCell.setCellStyle(columnHeaderStyle)
      columnHeaderCell.setCellValue(columnName)
      headerCellPosition += 1
    }
    nextAvailableRow +1
  }

  private def createRegistrationRows(sheet: XSSFSheet, workBook: XSSFWorkbook, registration: RegistrationWithPersons, nextAvailableRow: Int, registrationIndex: Int): Int = {
    val dataStyle = this.createBorderedCellStyle(workBook)
    var currentRow = nextAvailableRow
    registration.persons foreach { person =>
      val personRow = sheet.createRow(currentRow)

      this.createRegistrationDataCell(personRow, 0, registrationIndex.toString, dataStyle)
      this.createRegistrationDataCell(personRow, 1, registration.cabin.name, dataStyle)
      this.createRegistrationDataCell(personRow, 2, person.clubNumber, dataStyle)
      this.createRegistrationDataCell(personRow, 3, person.lastName, dataStyle)
      this.createRegistrationDataCell(personRow, 4, person.firstName, dataStyle)
      this.createRegistrationDataCell(personRow, 5, person.email, dataStyle)
      this.createRegistrationDataCell(personRow, 6, person.dateOfBirth, dataStyle)
      this.createRegistrationDataCell(personRow, 7, "", dataStyle)
      this.createRegistrationDataCell(personRow, 8, person.nationality.getOrElse(""), dataStyle)
      this.createRegistrationDataCell(personRow, 9, if(person.selectedDining == 0) "1" else "0", dataStyle)
      this.createRegistrationDataCell(personRow, 10, if(person.selectedDining == 1) "1" else "0", dataStyle)
      this.createRegistrationDataCell(personRow, 11, if(person.selectedDining == 2) "1" else "0", dataStyle)
      this.createRegistrationDataCell(personRow, 12, if(person.selectedDining == 3) "1" else "0", dataStyle)
      currentRow += 1
    }
    nextAvailableRow +registration.persons.size
  }

  private def createRegistrationDataCell(row: XSSFRow, cellIndex: Int, value: String, cellStyle: CellStyle) = {
    val cell = row.createCell(cellIndex)
    cell.setCellStyle(cellStyle)
    cell.setCellValue(value)

  }

  private def creteBoldFontStyle(workBook: XSSFWorkbook, fontHeight: Int = 10): XSSFCellStyle = {
    val headerStyle = workBook.createCellStyle()
    val boldFont = workBook.createFont()
    boldFont.setBoldweight(Font.BOLDWEIGHT_BOLD)
    boldFont.setFontHeightInPoints(fontHeight.toShort)
    headerStyle.setFont(boldFont)
    headerStyle
  }

  private def createBorderedCellStyle(workbook: XSSFWorkbook, includeHeaderStyles: Boolean = false): CellStyle = {
    var borderedStyle = workbook.createCellStyle()
    if(includeHeaderStyles) {
      borderedStyle = this.creteBoldFontStyle(workbook)
    }

    val borderStyle = BorderStyle.THIN;
    borderedStyle.setBorderBottom(borderStyle)
    borderedStyle.setBorderLeft(borderStyle)
    borderedStyle.setBorderRight(borderStyle)
    borderedStyle.setBorderTop(borderStyle)
    borderedStyle
  }

}
