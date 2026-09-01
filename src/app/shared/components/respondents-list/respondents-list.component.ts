import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RespondentDisplayItem } from '../../../models/survey.model';

@Component({
  selector: 'app-respondents-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './respondents-list.component.html',
  styleUrl: './respondents-list.component.css'
})
export class RespondentsListComponent {
  readonly title = input<string>('Répondants');
  readonly items = input<RespondentDisplayItem[]>([]);
  readonly total = input<number>(0);
  readonly loading = input<boolean>(false);
  readonly loadingMore = input<boolean>(false);
  readonly hasMore = input<boolean>(false);
  readonly emptyLabel = input<string>("Aucune réponse pour l'instant.");
  readonly accent = input<string>('var(--accent)');

  readonly loadMore = output<void>();

  protected displayName(pseudo: string | null | undefined): string {
    return pseudo && pseudo.trim() ? pseudo : 'Anonyme';
  }

  protected isAnonymous(pseudo: string | null | undefined): boolean {
    return !pseudo || !pseudo.trim();
  }
}