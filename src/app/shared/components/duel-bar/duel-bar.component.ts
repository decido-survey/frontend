import { Component, input } from '@angular/core';

@Component({
  selector: 'app-duel-bar',
  standalone: true,
  templateUrl: './duel-bar.component.html',
  styleUrl: './duel-bar.component.css'
})
export class DuelBarComponent {
  readonly leftLabel = input<string>('');
  readonly leftCount = input<number>(0);
  readonly leftPct = input<number>(0);
  readonly rightLabel = input<string>('');
  readonly rightCount = input<number>(0);
  readonly rightPct = input<number>(0);
  readonly color = input<string>('var(--c-duel)');
}