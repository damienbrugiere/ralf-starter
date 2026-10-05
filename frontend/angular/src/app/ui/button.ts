import { Directive, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'warm' | 'secondary' | 'ghost';

@Directive({
  selector: 'button[appButton], a[appButton]',
  host: { class: 'ui-btn', '[attr.data-variant]': 'variant()' },
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
}
