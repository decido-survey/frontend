import { Component, inject } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import { CreationStateService } from '../../../../services/creation-state.service';
import { BackLinkComponent } from '../../../../shared/components/back-link/back-link.component';
import { ToggleSwitchComponent } from '../../../../shared/components/toggle-switch/toggle-switch.component';

@Component({
  selector: 'app-advanced-step',
  standalone: true,
  imports: [LucideChevronRight, BackLinkComponent, ToggleSwitchComponent],
  template: `
    <app-back-link label="retour" (clickBack)="state.goToStep('theme')" />

    <h1>Réglages</h1>
    <div class="sub">Facultatif — tout fonctionne très bien sans y toucher</div>

    <!-- Accordion Toggle Header -->
    <div class="accordion-head" (click)="toggleAccordion()">
      <span>Plus d'options</span>
      <span>{{ state.isAdvOpen() ? '−' : '+' }}</span>
    </div>

    @if (state.isAdvOpen()) {
      <div class="accordion-body">
        <div class="opt-row">
          <div>
            <div>Résultats publics</div>
            <div class="opt-row-desc">visibles par tout le monde</div>
          </div>
          <app-toggle-switch
            [checked]="state.publicResults()"
            (toggle)="state.publicResults.set($event)"
          />
        </div>

        <div class="opt-row">
          <div>
            <div>Un vote par appareil</div>
            <div class="opt-row-desc">évite les votes multiples</div>
          </div>
          <app-toggle-switch
            [checked]="state.oneVotePerDevice()"
            (toggle)="state.oneVotePerDevice.set($event)"
          />
        </div>

        <div style="margin-top: 6px;">
          <div class="opt-row-desc" style="margin-bottom: 4px;">Durée de vie</div>
          <div class="chip-row">
            @for (dur of durations; track dur.id) {
              <div
                class="chip"
                [class.active]="state.duration() === dur.id"
                (click)="state.duration.set(dur.id)"
              >
                {{ dur.label }}
              </div>
            }
          </div>
        </div>
      </div>
    }

    <div class="btn-row" style="margin-top: auto;">
      <button class="btn btn-primary btn-block" (click)="publish()">
        <span>Continuer</span>
        <svg lucideChevronRight class="w-4 h-4 stroke-[2.5]"></svg>
      </button>
    </div>
  `
})
export class AdvancedStepComponent {
  protected readonly state = inject(CreationStateService);

  protected readonly durations: { id: '1h' | '24h' | '7d' | 'unlimited'; label: string }[] = [
    { id: '1h', label: '1h' },
    { id: '24h', label: '24h' },
    { id: '7d', label: '7 jours' },
    { id: 'unlimited', label: 'Illimité' }
  ];

  toggleAccordion(): void {
    this.state.isAdvOpen.update((v) => !v);
  }

  publish(): void {
    this.state.goToStep('publish');
  }
}
