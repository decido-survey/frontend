import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-back-link',
  standalone: true,
  templateUrl: './back-link.component.html'
})
export class BackLinkComponent {
  readonly label = input<string>('retour');
  readonly clickBack = output<void>();
}
