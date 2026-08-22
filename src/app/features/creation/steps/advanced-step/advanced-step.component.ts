import { Component, inject } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import { CreationStateService } from '../../../../services/creation-state.service';
import { BackLinkComponent } from '../../../../shared/components/back-link/back-link.component';
import { ToggleSwitchComponent } from '../../../../shared/components/toggle-switch/toggle-switch.component';

@Component({
  selector: 'app-advanced-step',
  standalone: true,
  imports: [LucideChevronRight, BackLinkComponent, ToggleSwitchComponent],
  templateUrl: './advanced-step.component.html'
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