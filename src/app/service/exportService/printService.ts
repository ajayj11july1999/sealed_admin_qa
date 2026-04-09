import { Injectable } from '@angular/core';


@Injectable()
export class PrintService {


  // printTableData(data: any, name: any) {
  //   window.print();
  // }

  printElement(element: HTMLElement): void {
    const printContents = element?.outerHTML;
    const originalContents = document.body.innerHTML;

    if (printContents) {
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      location.reload(); // To reload the original page content after printing
    } else {
      console.error('Element content could not be found.');
    }
  }
}