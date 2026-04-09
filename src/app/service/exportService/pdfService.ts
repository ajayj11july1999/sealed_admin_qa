import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


@Injectable()
export class PdfService {


  // exportToPDF(jsonData: any[], fileName: string) {
  //   const doc = new jsPDF();
  //   console.log(doc)
  //   autoTable(doc, {
  //     head: [Object.keys(jsonData[0])],
  //     body: jsonData.map(item => Object.values(item))
  //   });
  //   doc.save(`${fileName}.pdf`);
  // }


  downloadBase64File(contentBase64, fileName) {
    console.log(contentBase64)
    const linkSource = `data: application/pdf;base64,${contentBase64}`;
    const downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);

    downloadLink.href = linkSource;
    downloadLink.target = "_self";
    downloadLink.download = fileName;
    downloadLink.click();
  }
}