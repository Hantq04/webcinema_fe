import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { CinemaService } from '../../core/services/cinema.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-cinema-site',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="cinema-site-page">
      <div class="cinema-site-container">
        <div class="cinema-site-panel">
          <h1 class="cinema-site-title">CINEGO CINEMAS</h1>
          
          <div class="locations-grid">
            @for (city of cities(); track city) {
              <button 
                class="location-btn" 
                [class.active]="selectedCity() === city"
                (click)="selectCity(city)">
                {{ city }}
              </button>
            }
          </div>

          @if (selectedCity()) {
            <div class="theaters-section">
              <div class="theaters-grid">
                @for (theater of theaters(); track theater) {
                  <div class="theater-item">{{ theater }}</div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .cinema-site-page {
      background: #fdfaf0;
      padding: 4rem 1rem;
      min-height: 85vh;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    .cinema-site-container {
      width: 100%;
      max-width: 1000px;
    }
    .cinema-site-panel {
      background: #333333;
      border: 1px solid #444;
      position: relative;
      padding: 4rem 5rem;
      color: #ccc;
      box-shadow: 0 15px 35px rgba(0,0,0,0.5);
      border-radius: 4px;
    }
    /* Inner Decorative Frame */
    .cinema-site-panel::before {
      content: '';
      position: absolute;
      top: 15px;
      left: 15px;
      right: 15px;
      bottom: 15px;
      border: 1px solid #555;
      border-radius: 8px;
      pointer-events: none;
    }
    .cinema-site-panel::after {
      content: '';
      position: absolute;
      top: 18px;
      left: 18px;
      right: 18px;
      bottom: 18px;
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 6px;
      pointer-events: none;
    }
    .cinema-site-title {
      text-align: center;
      font-size: 3.8rem;
      font-weight: 900;
      color: #666;
      margin-bottom: 3.5rem;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      /* Beveled Glossy Effect */
      text-shadow: 1px 1px 0px #777, 
                   2px 2px 0px #555, 
                   3px 3px 0px #444, 
                   0 0 10px rgba(0,0,0,0.5);
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));
    }
    .locations-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.8rem 1rem;
      border-bottom: 1px solid #555;
      padding-bottom: 2.5rem;
      margin-bottom: 2.5rem;
      position: relative;
      z-index: 2;
    }
    .location-btn {
      background: none;
      border: none;
      color: #ccc;
      text-align: left;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      padding: 0;
      transition: color 0.2s;
      white-space: nowrap;
    }
    .location-btn:hover {
      color: #fff;
    }
    .location-btn.active {
      color: #e71a0f;
    }
    .theaters-section {
      animation: fadeIn 0.5s ease-out;
      position: relative;
      z-index: 2;
    }
    .theaters-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.8rem 1rem;
    }
    .theater-item {
      font-size: 0.8rem;
      color: #999;
      font-weight: 600;
      transition: color 0.2s;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 900px) {
      .locations-grid { grid-template-columns: repeat(3, 1fr); }
      .theaters-grid { grid-template-columns: repeat(2, 1fr); }
      .cinema-site-panel { padding: 3rem 2rem; }
      .cinema-site-title { font-size: 2.8rem; }
    }
    @media (max-width: 600px) {
      .locations-grid { grid-template-columns: repeat(2, 1fr); }
      .theaters-grid { grid-template-columns: 1fr; }
    }
  `
})
export class CinemaSiteComponent {
  private readonly cinemaService = inject(CinemaService);
  private readonly title = inject(Title);
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t.bind(this.language);

  protected readonly cities = signal<string[]>([]);
  protected readonly selectedCity = signal<string | null>(null);
  protected readonly theaters = signal<string[]>([]);

  constructor() {
    this.title.setTitle('Site');
    this.cinemaService.getAllAddresses().subscribe(cities => {
      this.cities.set(cities);
    });
  }

  protected selectCity(city: string): void {
    this.selectedCity.set(city);
    this.cinemaService.getCinemasByAddress(city).subscribe(theaters => {
      this.theaters.set(theaters);
    });
  }
}
