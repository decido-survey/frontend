import { Component, computed, signal } from '@angular/core';import {
  LucideList,
  LucideSwords,
  LucideStar,
  LucideMessageSquare,
  LucideAlignLeft
} from '@lucide/angular';

import { QUESTION_TYPES, QuestionType, SurveyTypeId } from '../../../models/question-type.model';

interface CarouselItem extends QuestionType {
  uid: string;
}


@Component({
  selector: 'app-types-carousel',
  standalone: true,
  imports: [LucideList, LucideSwords, LucideStar, LucideMessageSquare, LucideAlignLeft],
  templateUrl: './types-carousel.component.html',
  styleUrls: ['./types-carousel.component.css']
})


export class TypesCarouselComponent {
  protected readonly questionTypes = QUESTION_TYPES;
 
  // Le jeu de cartes est dupliqué une fois : l'animation translate de 0 à -50%,
  // ce qui correspond exactement à la largeur d'un jeu -> boucle invisible.
  protected readonly carouselItems = computed<CarouselItem[]>(() => [
    ...this.questionTypes.map((t, i) => ({ ...t, uid: `${t.id}-a-${i}` })),
    ...this.questionTypes.map((t, i) => ({ ...t, uid: `${t.id}-b-${i}` }))
  ]);
 
  protected readonly isPaused = signal(false);
 
  pause(): void {
    this.isPaused.set(true);
  }
 
  resume(): void {
    this.isPaused.set(false);
  }
 
  private readonly longDescriptions: Record<SurveyTypeId, string> = {
    qcm: "Propose de 2 à 8 options et laisse chacun choisir sa préférée. Idéal pour trancher entre plusieurs choix concrets, du resto du midi au nom d'un projet.",
    duel: "Deux options s'affrontent, un seul choix possible. Le format le plus rapide pour départager deux idées, deux camps ou deux envies.",
    note: 'Chacun attribue une note de 1 à 5 étoiles. Parfait pour mesurer la satisfaction ou l\'enthousiasme général autour d\'une idée.',
    libre: "Ajoute autant d'options que tu veux, sans limite fixe. Utile quand la liste des choix peut s'allonger au fil des propositions.",
    ouverte: 'Chacun répond avec ses propres mots, sans options prédéfinies. Idéal pour récolter des avis, des idées ou des suggestions libres.'
  };
 
  longDescription(typeId: SurveyTypeId): string {
    return this.longDescriptions[typeId];
  }
}
