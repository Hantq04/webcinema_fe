import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-auth',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <h1>Tài khoản CineGo</h1>
      <p>Đăng nhập, đăng ký và quản lý thành viên.</p>
    </section>
  `
})
export class AuthComponent {}