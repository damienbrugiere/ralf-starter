import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <p class="ui-empty__title">{{ heading() }}</p>
    <p class="ui-empty__body"><ng-content select="[description]" /></p>
    <ng-content />
  `,
  host: { class: 'ui-empty' },
})
export class EmptyState {
  readonly heading = input.required<string>();
}
