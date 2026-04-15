import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-booking',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <h1>Đặt vé CineGo</h1>
      <p>Chọn suất chiếu, ghế ngồi và thanh toán nhanh.</p>
    </section>
  `
})
export class BookingComponent {}