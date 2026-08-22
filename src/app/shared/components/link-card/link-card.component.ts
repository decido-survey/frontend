import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-link-card',
  standalone: true,
  template: `
    <div class="link-card" [class.admin]="isAdmin()">
      <div class="link-label">{{ label() }}</div>
      <div class="link-value-row">
        <div class="link-value">{{ url() }}</div>
        <button
          class="copy-btn"
          [class.copied]="copied()"
          (click)="copyToClipboard()"
        >
          {{ copied() ? 'copié !' : 'copier' }}
        </button>
      </div>
      @if (note()) {
        <div class="link-note">{{ note() }}</div>
      }
    </div>
  `
})
export class LinkCardComponent {
  readonly label = input<string>('Lien');
  readonly url = input<string>('');
  readonly isAdmin = input<boolean>(false);
  readonly note = input<string | null>(null);

  protected readonly copied = signal<boolean>(false);

  copyToClipboard(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.url()).then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      });
    } else {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }
}
