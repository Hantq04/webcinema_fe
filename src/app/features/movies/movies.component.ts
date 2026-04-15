import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-movies',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <h1>Phim CineGo</h1>
      <p>Danh sách phim đang chiếu và sắp chiếu.</p>
    </section>
  `
})
export class MoviesComponent {}