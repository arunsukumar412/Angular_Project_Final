import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mathAbs'
})
export class MathAbsPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
