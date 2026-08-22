import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-option-row',
  standalone: true,
  templateUrl: './option-row.component.html'
})
export class OptionRowComponent {
  readonly letter = input<string>('A');
  readonly value = input<string>('');
  readonly placeholder = input<string>('Option');
  readonly removable = input<boolean>(true);

  readonly valueChange = output<string>();
  readonly remove = output<void>();

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }
}
