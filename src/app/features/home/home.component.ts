import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-[#f6f0df] pb-10 pt-5">
      <div class="mx-auto mb-4 grid max-w-7xl gap-3 px-4 grid-cols-4 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
        <a href="#" class="flex min-h-28 flex-col items-center justify-center gap-1 rounded-xl border border-[rgba(97,72,46,0.18)] bg-[rgba(255,255,255,0.55)] px-4 py-4 text-center no-underline text-[#201b16] shadow-sm">
          <span class="text-[1.55rem]">🎬</span>
          <strong class="text-sm uppercase">Rạp CineGo</strong>
          <small class="text-xs font-bold text-[#6f5c49]">Hệ thống rạp</small>
        </a>

        <a href="#" class="flex min-h-28 flex-col items-center justify-center gap-1 rounded-xl border border-[rgba(97,72,46,0.18)] bg-[rgba(255,255,255,0.55)] px-4 py-4 text-center no-underline text-[#201b16] shadow-sm">
          <span class="text-[1.55rem]">🍿</span>
          <strong class="text-sm uppercase">Now Showing</strong>
          <small class="text-xs font-bold text-[#6f5c49]">Phim đang chiếu</small>
        </a>

        <a href="#" class="flex min-h-28 flex-col items-center justify-center gap-1 rounded-xl border border-[rgba(97,72,46,0.18)] bg-[rgba(255,255,255,0.55)] px-4 py-4 text-center no-underline text-[#201b16] shadow-sm">
          <span class="text-[1.55rem]">⭐</span>
          <strong class="text-sm uppercase">CineGo Special</strong>
          <small class="text-xs font-bold text-[#6f5c49]">Đặc trưng CineGo</small>
        </a>

        <a href="#" class="flex min-h-28 flex-col items-center justify-center gap-1 rounded-xl border border-[rgba(97,72,46,0.18)] bg-[rgba(255,255,255,0.55)] px-4 py-4 text-center no-underline text-[#201b16] shadow-sm">
          <span class="text-[1.55rem]">🎟️</span>
          <strong class="text-sm uppercase">Register Now</strong>
          <small class="text-xs font-bold text-[#6f5c49]">Đăng ký ngay</small>
        </a>
      </div>

      <div class="mx-auto mb-4 grid max-w-7xl gap-4 px-4 grid-cols-[1.1fr_0.9fr] max-[900px]:grid-cols-1">
        <article class="relative min-h-112 overflow-hidden rounded-2xl border border-[rgba(97,72,46,0.18)] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.6),transparent_40%),linear-gradient(135deg,rgba(255,226,155,0.92),rgba(255,255,255,0.82)),linear-gradient(180deg,#7fd6ff,#fff0c5)]">
          <div class="flex h-full flex-col justify-center gap-3 p-8 max-[640px]:p-5">
            <p class="text-xs font-extrabold uppercase tracking-[0.2em] text-[#8f5c1d]">Ưu đãi CineGo</p>
            <h1 class="m-0 max-w-120 text-[clamp(2rem,4vw,4.75rem)] font-black uppercase leading-[0.95] text-[#201b16]">Đồng giá 79.000đ cho khách hàng thành viên</h1>
            <p class="m-0 max-w-120 text-base leading-7 text-[#201b16]">Xem phim tại CineGo với mức giá dễ tiếp cận, hiển thị lịch chiếu nhanh và đặt vé gọn hơn.</p>
            <a href="#" class="inline-flex self-start rounded-full bg-[#d62f1f] px-4 py-3 font-extrabold uppercase text-white no-underline">Xem ngay</a>
          </div>
        </article>

        <article class="relative min-h-112 overflow-hidden rounded-2xl border border-[rgba(97,72,46,0.18)] bg-[linear-gradient(180deg,rgba(10,9,8,0.45),rgba(10,9,8,0.75)),radial-gradient(circle_at_70%_20%,rgba(255,206,138,0.18),transparent_32%),linear-gradient(135deg,#140d0a,#462214_58%,#100b09)]">
          <div class="flex h-full flex-col justify-center gap-3 p-8 max-[640px]:p-5">
            <p class="text-xs font-extrabold uppercase tracking-[0.2em] text-[#f6ead8]">Phim nổi bật</p>
            <h2 class="m-0 text-[clamp(2.4rem,5vw,4.5rem)] font-black uppercase leading-[0.95] text-[#efc38f]">Xác ướp</h2>
            <p class="m-0 max-w-120 text-base leading-7 text-[#f6ead8]">Poster dạng carousel như ảnh tham chiếu, thiết kế đậm chất rạp chiếu phim cổ điển.</p>
          </div>
        </article>
      </div>

      <section class="mx-auto mt-2 max-w-7xl px-4">
        <div class="mb-3 flex items-baseline justify-between max-[640px]:flex-col max-[640px]:gap-1">
          <p class="m-0 text-[1.15rem] font-extrabold uppercase">Danh mục CineGo</p>
          <span class="text-sm font-bold text-[#6f5c49]">Phim, rạp, thành viên, cultureplex</span>
        </div>

        <div class="grid gap-3 grid-cols-3 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
          <article class="min-h-36 rounded-xl border border-[rgba(97,72,46,0.16)] bg-[rgba(255,249,238,0.9)] p-4">
            <h3 class="mb-2 mt-0 uppercase">Phim đang chiếu</h3>
            <p class="m-0 text-[#6f5c49]">Khám phá những suất chiếu mới nhất.</p>
          </article>
          <article class="min-h-36 rounded-xl border border-[rgba(97,72,46,0.16)] bg-[rgba(255,249,238,0.9)] p-4">
            <h3 class="mb-2 mt-0 uppercase">Phim sắp chiếu</h3>
            <p class="m-0 text-[#6f5c49]">Theo dõi lịch ra mắt và trailer mới.</p>
          </article>
          <article class="min-h-36 rounded-xl border border-[rgba(97,72,46,0.16)] bg-[rgba(255,249,238,0.9)] p-4">
            <h3 class="mb-2 mt-0 uppercase">Rạp CineGo</h3>
            <p class="m-0 text-[#6f5c49]">Danh sách rạp theo khu vực, dễ chọn nhanh.</p>
          </article>
        </div>
      </section>
    </section>
  `
})
export class HomeComponent {}