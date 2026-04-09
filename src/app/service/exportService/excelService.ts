import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class ExcelService {

  constructor() { }

  // public exportAsExcelFile(json: any[], excelFileName: string): void {

  //   const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
  //   console.log('worksheet', worksheet);
  //   const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
  //   const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  //   //const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  //   this.saveAsExcelFile(excelBuffer, excelFileName);
  // }

  // private saveAsExcelFile(buffer: any, fileName: string): void {
  //   const data: Blob = new Blob([buffer], {
  //     type: EXCEL_TYPE
  //   });
  //   FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  // }


  downloadBase64ExcelFile(contentBase64, fileName) {
    // Convert Base64 to a Blob
    const byteCharacters = atob(contentBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Create download link
    const downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);

    // Set link attributes
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.target = "_self";
    downloadLink.download = fileName + ".xlsx"; // Assuming the file is in Excel format

    // Trigger download
    downloadLink.click();

    // Clean up
    document.body.removeChild(downloadLink);
  }
}