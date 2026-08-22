import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-back-link',
  standalone: true,
  template: `
    <div class="back-link" (click)="clickBack.emit()">
      <span>← {{ label() }}</span>
    </div>
  `
})
export class BackLinkComponent {
  readonly label = input<string>('retour');
  readonly clickBack = output<void>();
}
