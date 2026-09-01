import { Injectable, computed, signal, inject } from '@angular/core';
import { SurveyTypeId, QUESTION_TYPES } from '../models/question-type.model';
import { ThemeService } from './theme.service';
import { Survey, NoteScale } from '../models/survey.model';

export type WizardStep = 'home' | 'setup' | 'theme' | 'advanced' | 'publish';

export const STEPS_ORDER: WizardStep[] = ['home', 'setup', 'theme', 'advanced', 'publish'];

@Injectable({
  providedIn: 'root'
})
export class CreationStateService {
  private readonly themeService = inject(ThemeService);

  readonly currentStep = signal<WizardStep>('home');
  readonly selectedType = signal<SurveyTypeId | null>(null);
  readonly questionText = signal<string>('');
  readonly options = signal<string[]>(['', '']);
  readonly noteMin = signal<number>(1);
  readonly noteMax = signal<number>(5);
  readonly creatorPseudo = signal<string>('');
  readonly themeIdx = signal<number>(0);
  readonly isAdvOpen = signal<boolean>(false);
  readonly publicResults = signal<boolean>(false);
  readonly oneVotePerDevice = signal<boolean>(true);
  readonly duration = signal<'1h' | '24h' | '7d' | 'unlimited'>('24h');

  readonly noteScale = signal<NoteScale>(5);

  // Generated links on publish
  readonly shareLink = signal<string>('');
  readonly adminLink = signal<string>('');
  readonly responseToken = signal<string>('');
  readonly adminToken = signal<string>('');
  readonly editingSurveyId = signal<string | null>(null);
  readonly editingAdminToken = signal<string | null>(null);


  readonly currentStepIndex = computed(() => {
    return STEPS_ORDER.indexOf(this.currentStep());
  });

  readonly canContinueSetup = computed(() => {
    const q = this.questionText().trim();
    if (!q) return false;
    const type = this.selectedType();
    if (type !== 'ouverte' && type !== 'note') {
      const filled = this.options().filter((o) => o.trim().length > 0).length;
      if (filled < 2) return false;
    }
    return true;
  });

  selectType(type: SurveyTypeId): void {
    this.selectedType.set(type);
    if (type === 'duel') {
      this.options.set(['', '']);
    } else if (type === 'note') {
      this.options.set([]);
      this.noteScale.set(5);
    } else if (type === 'ouverte') {
      this.options.set([]);
    } else {
      if (this.options().length < 2) {
        this.options.set(['', '']);
      }
    }
    this.themeIdx.set(0);
    this.themeService.setAccentForTypeAndIndex(type, 0);
    this.goToStep('setup');
  }

  goToStep(step: WizardStep): void {
    this.currentStep.set(step);
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }

  addOption(): void {
    if (this.options().length < 8) {
      this.options.update((opts) => [...opts, '']);
    }
  }

  updateOption(index: number, val: string): void {
    this.options.update((opts) => {
      const updated = [...opts];
      updated[index] = val;
      return updated;
    });
  }

  removeOption(index: number): void {
    if (this.options().length > 2 && this.selectedType() !== 'duel') {
      this.options.update((opts) => opts.filter((_, i) => i !== index));
    }
  }

  setThemeIndex(idx: number): void {
    this.themeIdx.set(idx);
    const type = this.selectedType();
    if (type) {
      this.themeService.setAccentForTypeAndIndex(type, idx);
    }
  }


  get isEditing(): boolean {
    return this.editingSurveyId() !== null;
  }

  loadForEdit(survey: Survey, surveyId: string, adminToken: string): void {
    this.editingSurveyId.set(surveyId);
    this.editingAdminToken.set(adminToken);
    
    this.noteScale.set(survey.question.noteScale || 5);

    this.selectedType.set(survey.type);
    this.questionText.set(survey.question.text);

    const propTexts = (survey.question.propositions || []).map((p) => p.text);
    if (survey.type === 'note' || survey.type === 'ouverte') {
      this.options.set([]);
    } else {
      this.options.set(propTexts.length >= 2 ? propTexts : ['', '']);
    }

    this.creatorPseudo.set(survey.creatorPseudo || '');
    this.themeIdx.set(survey.style?.themeIdx || 0);
    this.publicResults.set(survey.settings?.resultsVisibility === 'public');
    this.oneVotePerDevice.set(survey.settings?.oneVotePerDevice ?? true);
    this.duration.set(survey.settings?.duration || '24h');

    this.themeService.setAccentForTypeAndIndex(survey.type, this.themeIdx());
    this.currentStep.set('setup');
  }

  reset(): void {
    this.currentStep.set('home');
    this.selectedType.set(null);
    this.questionText.set('');
    this.options.set(['', '']);
    this.creatorPseudo.set('');
    this.themeIdx.set(0);
    this.isAdvOpen.set(false);
    this.publicResults.set(false);
    this.oneVotePerDevice.set(true);
    this.duration.set('24h');
    this.shareLink.set('');
    this.adminLink.set('');
    this.responseToken.set('');
    this.adminToken.set('');
    this.themeService.setAccentColor('#7C5CFC');
    this.editingSurveyId.set(null);
    this.editingAdminToken.set(null);
    this.noteScale.set(5);

  }
}
