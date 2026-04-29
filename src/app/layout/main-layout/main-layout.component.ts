import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { ChatbotComponent } from '../../features/chatbot/chatbot.component';

@Component({
  selector: 'app-main-layout',
  imports: [HeaderComponent, FooterComponent, RouterOutlet, ChatbotComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-header></app-header>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
    <app-chatbot></app-chatbot>
  `,
  styles: `:host { display: block; min-height: 100dvh; } .main-content { min-height: calc(100dvh - 14rem); }`
})
export class MainLayoutComponent {}