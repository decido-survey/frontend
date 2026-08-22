import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-option-row',
  standalone: true,
  template: `
    <div class="option-row">
      <div class="letter">{{ letter() }}</div>
      <input
        type="text"
        [value]="value()"
        [placeholder]="placeholder()"
        (input)="onInputChange($event)"
      />
      @if (removable()) {
        <div class="remove-opt" (click)="remove.emit()">×</div>
      }
    </div>
  `
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
