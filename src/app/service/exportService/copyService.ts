import { Injectable } from '@angular/core';


@Injectable()
export class CopyService {
  CopyTableData() { }

  async copyTableText(tableSelector: string): Promise<void> {
    const table = document.querySelector(tableSelector);
    let textToCopy = '';

    if (table) {
      const rows = table.querySelectorAll('tr');
      rows.forEach((row) => {
        const cells = row.querySelectorAll('th, td');
        const rowText = Array.from(cells)
          .map((cell) => cell.textContent?.trim())
          .join('\t');
        textToCopy += rowText + '\n';
      });

      try {
        await navigator.clipboard.writeText(textToCopy);
        alert('Table text copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  }
}