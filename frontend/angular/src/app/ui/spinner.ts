import { Component } from '@angular/core';

@Component({
  selector: 'app-spinner',
  template: '<span class="ui-spinner__dot" aria-hidden="true"></span><span><ng-content /></span>',
  host: { class: 'ui-spinner', role: 'status' },
})
export class Spinner {}
