export type SurveyTypeId = 'qcm' | 'duel' | 'note' | 'ouverte';

export interface QuestionType {
  id: SurveyTypeId;
  name: string;
  desc: string;
  color: string;
  palettes: string[];
}

export const QUESTION_TYPES: QuestionType[] = [
  { id: 'qcm', name: 'QCM', desc: '2 à 8 options au choix', color: '#FFC93C', palettes: ['#FFC93C', '#FFB020', '#F5A302'] },
  { id: 'duel', name: 'Duel', desc: '2 choix face à face', color: '#FF5A5F', palettes: ['#FF5A5F', '#FF3B41', '#E8434E'] },
  { id: 'note', name: 'Note', desc: 'Évaluation rapide', color: '#12B886', palettes: ['#12B886', '#0CA678', '#08A57C'] },
  { id: 'ouverte', name: 'Question ouverte', desc: 'Texte libre (avis, idées)', color: '#2EC4E0', palettes: ['#2EC4E0', '#17ABC7', '#4FCEE6'] }
];