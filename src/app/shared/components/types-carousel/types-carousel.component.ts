import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import {
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


export class TypesCarouselComponent implements AfterViewInit {
  @ViewChild('track', { static: true }) private readonly trackRef!: ElementRef<HTMLDivElement>;
 
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
 
  protected readonly questionTypes = QUESTION_TYPES;
 
  // Le jeu de cartes est dupliqué une fois : la position boucle de 0 à -largeurUnJeu,
  // ce qui permet un défilement infini sans à-coup, dans les deux sens.
  protected readonly carouselItems = computed<CarouselItem[]>(() => [
    ...this.questionTypes.map((t, i) => ({ ...t, uid: `${t.id}-a-${i}` })),
    ...this.questionTypes.map((t, i) => ({ ...t, uid: `${t.id}-b-${i}` }))
  ]);
 
  protected readonly isDragging = signal(false);
 
  private readonly AUTO_SPEED_PX_PER_SEC = 40;
 
  private offsetX = 0;
  private setWidth = 0;
  private isPaused = false;
  private dragging = false;
  private dragStartX = 0;
  private dragStartOffset = 0;
  private lastTimestamp: number | null = null;
  private rafId: number | null = null;
  private resizeObserver?: ResizeObserver;
 
  ngAfterViewInit(): void {
    this.measureSetWidth();
 
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.measureSetWidth());
      this.resizeObserver.observe(this.trackRef.nativeElement);
    }
 
    this.ngZone.runOutsideAngular(() => {
      this.rafId = requestAnimationFrame((ts) => this.loop(ts));
    });
 
    this.destroyRef.onDestroy(() => {
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
      }
      this.resizeObserver?.disconnect();
    });
  }
 
  private measureSetWidth(): void {
    // Le track contient 2 jeux identiques : la moitié de sa largeur = un jeu complet.
    this.setWidth = this.trackRef.nativeElement.scrollWidth / 2;
  }
 
  private loop(timestamp: number): void {
    if (this.lastTimestamp === null) {
      this.lastTimestamp = timestamp;
    }
    const deltaSeconds = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
 
    if (!this.isPaused && !this.dragging && this.setWidth > 0) {
      this.offsetX -= this.AUTO_SPEED_PX_PER_SEC * deltaSeconds;
      this.wrapOffset();
      this.applyTransform();
    }
 
    this.rafId = requestAnimationFrame((ts) => this.loop(ts));
  }
 
  private wrapOffset(): void {
    if (this.setWidth <= 0) return;
    while (this.offsetX <= -this.setWidth) {
      this.offsetX += this.setWidth;
    }
    while (this.offsetX > 0) {
      this.offsetX -= this.setWidth;
    }
  }
 
  private applyTransform(): void {
    this.trackRef.nativeElement.style.transform = `translateX(${this.offsetX}px)`;
  }
 
  protected onPointerEnter(): void {
    this.isPaused = true;
  }
 
  protected onPointerLeave(): void {
    if (!this.dragging) {
      this.isPaused = false;
    }
  }
 
  protected onPointerDown(event: PointerEvent): void {
    this.dragging = true;
    this.isDragging.set(true);
    this.isPaused = true;
    this.dragStartX = event.clientX;
    this.dragStartOffset = this.offsetX;
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
  }
 
  protected onPointerMove(event: PointerEvent): void {
    if (!this.dragging) return;
    const delta = event.clientX - this.dragStartX;
    this.offsetX = this.dragStartOffset + delta;
    this.wrapOffset();
    this.applyTransform();
  }
 
  protected onPointerUp(event: PointerEvent): void {
    if (!this.dragging) return;
    this.dragging = false;
    this.isDragging.set(false);
    this.isPaused = false;
    try {
      (event.target as HTMLElement).releasePointerCapture?.(event.pointerId);
    } catch {
      // pointer capture already released, safe to ignore
    }
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
