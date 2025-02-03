import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customCurrency'
})
export class CustomCurrencyPipe implements PipeTransform {
  transform(value: number): string {
    if (value == null) return '';

    // Ensure the value is a number
    value = Number(value);

    // Format the number with a comma as the thousands separator and a dot as the decimal separator
    const formattedValue = value
      .toFixed(2) // Ensure two decimal places
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') // Add comma as thousands separator
      .replace(/,(\d{2})$/, '.$1'); // Replace last comma before decimal with a dot

    return `${formattedValue} XAF`;
  }
}
