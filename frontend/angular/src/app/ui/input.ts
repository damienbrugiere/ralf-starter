import { Directive } from '@angular/core';

@Directive({
  selector: 'input[appInput], textarea[appInput]',
  host: { class: 'ui-input' },
})
export class Input {}
