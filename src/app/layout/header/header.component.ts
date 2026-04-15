import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="border-b-4 border-[#d62f1f] bg-[#f6f0df] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 max-[900px]:flex-col">
        <div class="rounded-full bg-[#d9f5d3] px-3 py-1 text-sm font-bold whitespace-nowrap text-[#1f6a2f]">Zalopay</div>
        <div class="flex flex-col items-center gap-1 text-center">
          <strong class="text-[1.1rem] font-black uppercase tracking-[0.12em] text-[#d62f1f]">CineGo</strong>
          <span class="text-sm text-[#6d5b46]">Ưu đãi vé xem phim - đặt nhanh, xem nhanh</span>
        </div>
        <div class="rounded-full bg-[#d62f1f] px-3 py-1 text-sm font-bold whitespace-nowrap text-[#fff6ec]">Giá rẻ độc quyền</div>
      </div>

      <div class="border-t-4 border-dotted border-[#d62f1f]">
        <div class="mx-auto flex max-w-7xl items-center justify-end gap-5 px-4 py-2 max-[900px]:flex-wrap max-[900px]:justify-center">
          <a routerLink="/movies" class="text-sm font-semibold uppercase text-[#5a4a39] no-underline">Tin mới &amp; ưu đãi</a>
          <a routerLink="/booking" class="text-sm font-semibold uppercase text-[#5a4a39] no-underline">Vé của tôi</a>
          <a routerLink="/auth" class="text-sm font-semibold uppercase text-[#5a4a39] no-underline">Đăng nhập / đăng ký</a>
          <span class="inline-flex gap-1">
            <button type="button" class="rounded-md bg-[#d62f1f] px-2 py-1 text-[0.78rem] font-bold text-white">VN</button>
            <button type="button" class="rounded-md bg-[#9d907d] px-2 py-1 text-[0.78rem] font-bold text-white">EN</button>
          </span>
        </div>
      </div>

      <div class="border-y border-[rgba(81,60,35,0.65)]">
        <div class="mx-auto max-w-7xl px-4 pt-4 pb-2">
          <div class="flex items-center justify-between gap-4 max-[900px]:flex-col">
            <a routerLink="/" class="logo-link" aria-label="CineGo home">
              <span class="logo-text">CINEGO</span>
            </a>
            <a routerLink="/booking" class="rotate-[-8deg] rounded-[0.45rem] bg-linear-to-b from-[#ff5a3c] to-[#d62f1f] px-4 py-3 font-extrabold uppercase text-white shadow-[0_0.55rem_1rem_rgba(214,47,31,0.25)] no-underline">Mua vé ngay</a>
          </div>

          <nav aria-label="Main navigation" class="grid grid-cols-4 gap-1 pt-3 pb-3 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
            <a routerLink="/movies" class="flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-3 text-center font-extrabold uppercase text-[#231b14] no-underline border-b-[3px] border-[#d62f1f]">
              <span class="text-[0.95rem] tracking-[0.02em]">Phim</span>
              <small class="text-[0.72rem] font-bold text-[#7f6c57]">Now showing</small>
            </a>

            <a routerLink="/movies" class="flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-3 text-center font-extrabold uppercase text-[#231b14] no-underline">
              <span class="text-[0.95rem] tracking-[0.02em]">Rạp CineGo</span>
              <small class="text-[0.72rem] font-bold text-[#7f6c57]">Rạp chiếu</small>
            </a>

            <a routerLink="/auth" class="flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-3 text-center font-extrabold uppercase text-[#231b14] no-underline">
              <span class="text-[0.95rem] tracking-[0.02em]">Thành viên</span>
              <small class="text-[0.72rem] font-bold text-[#7f6c57]">Tài khoản</small>
            </a>

            <a routerLink="/admin" class="flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-3 text-center font-extrabold uppercase text-[#231b14] no-underline">
              <span class="text-[0.95rem] tracking-[0.02em]">Cultureplex</span>
              <small class="text-[0.72rem] font-bold text-[#7f6c57]">Góc CineGo</small>
            </a>
          </nav>
        </div>
      </div>
    </header>
  `,
  styles: `
    :host {
      display: block;
    }

    .logo-link {
      display: inline-flex;
      text-decoration: none;
    }

    .logo-text {
      color: #d62f1f;
      display: inline-block;
      font-size: clamp(2.4rem, 5vw, 4.5rem);
      font-weight: 900;
      letter-spacing: -0.08em;
      line-height: 1;
      text-transform: uppercase;
    }
  `
})
export class HeaderComponent {}