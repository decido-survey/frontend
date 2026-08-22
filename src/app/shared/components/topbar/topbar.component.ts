import { Component, input } from '@angular/core';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header class="topbar">
      <div class="brand">déci<span>d</span>o</div>
      @if (showDots()) {
        <div class="dots">
          @for (stepIndex of [0, 1, 2, 3, 4]; track stepIndex) {
            <div
              class="dot"
              [class.done]="stepIndex < activeStepIndex()"
              [class.active]="stepIndex === activeStepIndex()"
            ></div>
          }
        </div>
      }
    </header>
  `
})
export class TopbarComponent {
  readonly activeStepIndex = input<number>(0);
  readonly showDots = input<boolean>(true);
}
