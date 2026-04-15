import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <h1>Quản trị CineGo</h1>
      <p>Cấu hình rạp, phim, khuyến mãi và báo cáo.</p>
    </section>
  `
})
export class AdminComponent {}