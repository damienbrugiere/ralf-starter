import { Component, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-badge',
  template: '<ng-content />',
  host: { class: 'ui-badge', '[attr.data-tone]': 'tone()' },
})
export class Badge {
  readonly tone = input<BadgeTone>('neutral');
}
