import { Component, input } from '@angular/core';

@Component({
  selector: 'app-result-bar',
  standalone: true,
  templateUrl: './result-bar.component.html'
})
export class ResultBarComponent {
  readonly label = input<string>('');
  readonly votesCount = input<number>(0);
  readonly percentage = input<number>(0);
}