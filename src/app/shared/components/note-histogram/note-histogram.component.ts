import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-note-histogram',
  standalone: true,
  templateUrl: './note-histogram.component.html',
  styleUrl: './note-histogram.component.css'
})
export class NoteHistogramComponent {
  readonly scale = input<number>(5);
  readonly distribution = input<number[]>([]);
  readonly average = input<number>(0);
  readonly totalVotes = input<number>(0);
  readonly color = input<string>('var(--c-note)');

  protected readonly values = computed(() => Array.from({ length: this.scale() }, (_, i) => i + 1));
  protected readonly maxCount = computed(() => Math.max(1, ...this.distribution()));
}