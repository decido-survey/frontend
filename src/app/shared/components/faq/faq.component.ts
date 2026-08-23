import { Component, signal } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';

interface FaqItem {
  q: string;
  a: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [LucideChevronDown],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent {
  protected readonly openIndex = signal<number | null>(0);

  protected readonly items: FaqItem[] = [
    {
      q: 'Faut-il créer un compte pour faire un sondage ?',
      a: 'Non. Tu peux créer et partager un sondage sans inscription. Un lien admin, généré à la publication, te permet de le gérer ensuite depuis ton navigateur.'
    },
    {
      q: 'Qui peut voir les résultats ?',
      a: "Par défaut, les résultats sont privés — visibles uniquement avec ton lien admin. Tu peux les rendre publics dans les réglages avancés au moment de la création."
    },
    {
      q: 'Combien de temps un sondage reste actif ?',
      a: 'Tu choisis la durée à la création : 1 heure, 24 heures, 7 jours, ou illimité.'
    },
    {
      q: 'Puis-je empêcher les votes multiples ?',
      a: 'Oui, l\'option "un vote par appareil" est activée par défaut. Tu peux la désactiver si tu préfères laisser voter librement.'
    },
    {
      q: "C'est vraiment gratuit ?",
      a: 'Oui, la création et le partage de sondages sont entièrement gratuits, sans limite de nombre.'
    }
  ];

  toggle(index: number): void {
    this.openIndex.set(this.openIndex() === index ? null : index);
  }
}