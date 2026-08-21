import { Component, signal } from '@angular/core';
import {
  LucideList,
  LucideSwords,
  LucideStar,
  LucideMessageSquare,
  LucideAlignLeft,
  LucideArrowLeft,
  LucideCheck,
  LucideChevronRight
} from '@lucide/angular';

export interface QuestionType {
  id: string;
  name: string;
  desc: string;
  color: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    LucideList,
    LucideSwords,
    LucideStar,
    LucideMessageSquare,
    LucideAlignLeft,
    LucideArrowLeft,
    LucideCheck,
    LucideChevronRight
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Decido Survey');
  protected selectedType = signal<string | null>(null);

  protected readonly questionTypes: QuestionType[] = [
    {
      id: 'qcm',
      name: 'QCM',
      desc: '2 à 6 options au choix',
      color: '#FFC93C'
    },
    {
      id: 'duel',
      name: 'Duel',
      desc: '2 choix face à face',
      color: '#FF5A5F'
    },
    {
      id: 'note',
      name: 'Note / 5',
      desc: 'Évaluation rapide',
      color: '#12B886'
    },
    {
      id: 'libre',
      name: 'Choix libre',
      desc: 'Réponse avec suggestions',
      color: '#7C5CFC'
    },
    {
      id: 'ouverte',
      name: 'Question ouverte',
      desc: 'Texte libre (avis, idées)',
      color: '#2EC4E0'
    }
  ];

  selectType(id: string) {
    this.selectedType.set(id);
  }
}
