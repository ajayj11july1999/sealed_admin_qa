// // import { Injectable } from '@angular/core';

// // @Injectable({
// //   providedIn: 'root'
// // })
// // export class DownloadService {

// //   constructor() { }

// // }
// import { Injectable } from '@angular/core';
// import { ExportAsService, ExportAsConfig, SupportedExtensions } from 'ngx-export-as';
// import * as XLSX from 'xlsx';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// @Injectable({
//   providedIn: 'root'
// })
// export class DownloadService {

//   constructor(private exportAsService: ExportAsService) { }

//   downloadAs(type: SupportedExtensions, elementId: string) {
//     const config: ExportAsConfig = {
//       type: type, // the type you want to download
//       elementIdOrContent: elementId, // the id of html/table element
//     };

//     this.exportAsService.save(config, 'TableExport').subscribe(() => {
//       // Download started
//     });
//   }

//   exportToCSV(jsonData: any[], fileName: string) {
//     const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);
//     const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
//     XLSX.writeFile(workbook, `${fileName}.csv`);
//   }

//   exportToExcel(jsonData: any[], fileName: string) {
//     const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);
//     const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
//     XLSX.writeFile(workbook, `${fileName}.xlsx`);
//   }

//   exportToPDF(jsonData: any[], fileName: string) {
//     const doc = new jsPDF();
//     autoTable(doc, {
//       head: [Object.keys(jsonData[0])],
//       body: jsonData.map(item => Object.values(item))
//     });
//     doc.save(`${fileName}.pdf`);
//   }
// }
