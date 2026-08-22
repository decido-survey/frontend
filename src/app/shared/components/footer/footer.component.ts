import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideMail, LucidePhone } from '@lucide/angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, LucideMail, LucidePhone],
  templateUrl: './footer.component.html',

})
export class FooterComponent {}