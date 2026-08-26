import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavRailComponent } from './shared/components/nav-rail/nav-rail.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavRailComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}