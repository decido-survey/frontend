import { Component, input } from '@angular/core';

@Component({
  selector: 'app-result-bar',
  standalone: true,
  template: `
    <div class="bar-row">
      <div class="bar-label">
        <span>{{ label() }}</span>
        <span class="count">{{ votesCount() }} {{ votesCount() > 1 ? 'votes' : 'vote' }} ({{ percentage() }}%)</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" [style.width.%]="percentage()"></div>
      </div>
    </div>
  `
})
export class ResultBarComponent {
  readonly label = input<string>('');
  readonly votesCount = input<number>(0);
  readonly percentage = input<number>(0);
}
