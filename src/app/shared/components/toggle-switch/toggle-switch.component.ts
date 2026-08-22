import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-toggle-switch',
  standalone: true,
  template: `
    <div
      class="toggle"
      [class.on]="checked()"
      (click)="toggle.emit(!checked())"
    >
      <div class="toggle-dot"></div>
    </div>
  `
})
export class ToggleSwitchComponent {
  readonly checked = input<boolean>(false);
  readonly toggle = output<boolean>();
}
