import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-toggle-switch',
  standalone: true,
  templateUrl: './toggle-switch.component.html'
})
export class ToggleSwitchComponent {
  readonly checked = input<boolean>(false);
  readonly toggle = output<boolean>();
}
