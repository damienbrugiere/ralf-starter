import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  template: '<ng-content />',
  host: { class: 'ui-card', '[attr.data-interactive]': 'interactive()' },
})
export class Card {
  readonly interactive = input(false);
}
