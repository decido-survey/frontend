import { Component } from '@angular/core';
import {
  LucideList,
  LucideSwords,
  LucideStar,
  LucideMessageSquare,
  LucideAlignLeft
} from '@lucide/angular';
import { QUESTION_TYPES } from '../../../models/question-type.model';
import { SurveyTypeId } from '../../../models/question-type.model';

@Component({
  selector: 'app-types-carousel',
  standalone: true,
  imports: [LucideList, LucideSwords, LucideStar, LucideMessageSquare, LucideAlignLeft],
  templateUrl: './types-carousel.component.html',
  styleUrls: ['./types-carousel.component.css']
})

export class TypesCarouselComponent {
  protected readonly questionTypes = QUESTION_TYPES;
 
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
 
