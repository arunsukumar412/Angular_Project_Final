import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true, // Use standalone for compatibility with standalone components
})
export class FilterPipe implements PipeTransform {
  /**
   * Transforms the input array by filtering it based on the provided filter criteria.
   * @param items The array to filter (e.g., availableFields).
   * @param filter An object containing key-value pairs to filter by (e.g., {selected: true}).
   * @returns A new array containing only the items that match the filter criteria.
   */
  transform(items: any[], filter: any): any[] {
    // Check if the input items or filter are null/undefined to avoid errors
    if (!items || !filter) {
      return items || []; // Return the original items if they exist, otherwise an empty array
    }

    // Filter the items array based on the filter object
    return items.filter(item => {
      // Iterate over each key-value pair in the filter object
      return Object.keys(filter).every(key => {
        // Check if the item has the property and if it matches the filter value
        // Handle both strict equality and string-based partial matching for flexibility
        if (item[key] && typeof item[key] === 'string' && typeof filter[key] === 'string') {
          // Case-insensitive partial match for string values
          return item[key].toLowerCase().includes(filter[key].toLowerCase());
        }
        // Strict equality check for non-string values
        return item[key] === filter[key];
      });
    });
  }
}