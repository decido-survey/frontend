import { Injectable, signal } from '@angular/core';
import { QUESTION_TYPES, SurveyTypeId } from '../models/question-type.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly currentAccent = signal<string>('#7C5CFC');

  setAccentColor(colorHex: string): void {
    this.currentAccent.set(colorHex);
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--accent', colorHex);
    }
  }

  setAccentForTypeAndIndex(typeId: SurveyTypeId, themeIdx: number): string {
    const qType = QUESTION_TYPES.find((t) => t.id === typeId);
    if (!qType || !qType.palettes.length) {
      this.setAccentColor('#7C5CFC');
      return '#7C5CFC';
    }
    const color = qType.palettes[themeIdx % qType.palettes.length];
    this.setAccentColor(color);
    return color;
  }
}
