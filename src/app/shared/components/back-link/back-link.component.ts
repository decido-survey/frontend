import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-back-link',
  standalone: true,
  templateUrl: './back-link.component.html'
})
export class BackLinkComponent {
  readonly label = input<string>('retour');
  readonly clickBack = output<void>();

  /** Index de l'étape courante (0-based). Si null, les dots ne s'affichent pas. */
  readonly stepIndex = input<number | null>(null);
  /** Nombre total d'étapes. */
  readonly totalSteps = input<number>(5);

  protected get dotsArray(): number[] {
    const total = this.totalSteps();
    return Array.from({ length: total }, (_, i) => i);
  }
}
