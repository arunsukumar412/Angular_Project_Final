import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'paginate' })
export class PaginatePipe implements PipeTransform {
  transform(array: any[], args: { itemsPerPage: number, currentPage: number }): any[] {
    if (!array || !args) return [];
    const start = (args.currentPage - 1) * args.itemsPerPage;
    return array.slice(start, start + args.itemsPerPage);
  }
}