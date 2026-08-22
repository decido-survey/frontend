import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LucideChevronRight, LucideZap, LucideShare2, LucideBarChart2, LucideLock } from '@lucide/angular';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [LucideChevronRight, LucideZap, LucideShare2, LucideBarChart2, LucideLock, TopbarComponent, FooterComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  private readonly router = inject(Router);
  protected readonly currentYear = new Date().getFullYear();

  start(): void {
    this.router.navigate(['/create']);
  }
}