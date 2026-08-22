import { Component, input } from '@angular/core';

@Component({
  selector: 'app-topbar',
  standalone: true,
  templateUrl: './topbar.component.html'
})
export class TopbarComponent {
  readonly activeStepIndex = input<number>(0);
  readonly showDots = input<boolean>(true);
}
