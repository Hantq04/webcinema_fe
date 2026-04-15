import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-[#f5efd9] text-[#5e5a53]">
      <div class="border-y border-[rgba(54,54,54,0.65)] px-6 py-5">
        <div class="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
          <section>
            <h3 class="mb-3 text-lg font-bold text-[#5e5a53]">CineGo Việt Nam</h3>
            <ul class="space-y-2 text-[0.95rem] leading-6">
              <li>Giới thiệu</li>
              <li>Tiện ích Online</li>
              <li>Thẻ Quà Tặng</li>
              <li>Tuyển Dụng</li>
              <li>Liên Hệ Quảng Cáo CineGo</li>
              <li>Dành cho đối tác</li>
            </ul>
          </section>

          <section>
            <h3 class="mb-3 text-lg font-bold text-[#5e5a53]">Điều khoản sử dụng</h3>
            <ul class="space-y-2 text-[0.95rem] leading-6">
              <li>Điều Khoản Chung</li>
              <li>Điều Khoản Giao Dịch</li>
              <li>Chính Sách Thanh Toán</li>
              <li>Chính Sách Bảo Mật</li>
              <li>Những Quy Định Tại Rạp Phim</li>
              <li>Câu Hỏi Thường Gặp</li>
            </ul>
          </section>

          <section>
            <h3 class="mb-3 text-lg font-bold text-[#5e5a53]">Kết nối với chúng tôi</h3>
            <div class="flex flex-wrap gap-1.5 text-sm font-bold">
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" class="social-link">
                <img src="/social/facebook.png" alt="Facebook" class="social-icon" />
              </a>
              <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" class="social-link">
                <img src="/social/youtube.png" alt="YouTube" class="social-icon" />
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" class="social-link">
                <img src="/social/instagram.png" alt="Instagram" class="social-icon" />
              </a>
              <a href="https://zalo.me/" target="_blank" rel="noopener noreferrer" class="social-link">
                <img src="/social/zalo.png" alt="Zalo" class="social-icon" />
              </a>
            </div>
            <div class="mt-4">
              <a href="http://online.gov.vn/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center no-underline">
                <img src="/social/dathongbao.webp" alt="Đã thông báo Bộ Công Thương" class="h-18 w-auto" />
              </a>
            </div>
          </section>

          <section>
            <h3 class="mb-3 text-lg font-bold text-[#5e5a53]">Chăm sóc khách hàng</h3>
            <div class="space-y-2 text-[0.95rem] leading-6">
              <p>Hotline: 1900 0240</p>
              <p>Giờ làm việc: 8:00 - 22:00 (Tất cả các ngày bao gồm cả Lễ Tết)</p>
              <p>Email hỗ trợ: hoidap@cinego.vn</p>
            </div>
          </section>
        </div>
      </div>

      <div class="border-b border-[rgba(54,54,54,0.65)] px-6 py-5">
        <div class="mx-auto grid max-w-7xl gap-4 md:grid-cols-[auto_1fr] md:items-start">
          <div class="text-3xl font-black uppercase tracking-[-0.08em] text-[#808080]">CG</div>
          <div class="space-y-1 text-[0.95rem] leading-6">
            <h4 class="text-base font-bold uppercase text-[#5e5a53]">CÔNG TY TNHH CJ CINEGO VIỆT NAM</h4>
            <p>Giấy Chứng nhận đăng ký doanh nghiệp: 0979389909 đăng ký lần đầu ngày 15/04/2026, được cấp bởi Sở Kế hoạch và Đầu tư Thành phố Hà Nội</p>
            <p>Địa chỉ: Số 4, đường Quang Trung, phường Hà Đông, Thành phố Hà Nội, Việt Nam</p>
            <p>Đường dây nóng (Hotline): 1900 0240</p>
            <p>COPYRIGHT 2026 CJ CINEGO VIETNAM CO., LTD. ALL RIGHTS RESERVED</p>
          </div>
        </div>
      </div>

      <div class="footer-brick"></div>
    </footer>
  `,
  styles: `
    :host {
      display: block;
    }

    .social-link {
      display: inline-flex;
      padding: 0.05rem;
      text-decoration: none;
      transition: transform 120ms ease-out;
      transform-origin: center;
    }

    .social-link:hover {
      transform: scale(1.04);
    }

    .social-link:active {
      transform: scale(0.9);
    }

    .social-icon {
      display: block;
      height: 2.4rem;
      width: 2.4rem;
    }

    .footer-brick {
      height: 10rem;
      background-color: #d96d2c;
      background-image:
        linear-gradient(90deg, rgba(255,255,255,0.55) 0 2px, transparent 2px),
        linear-gradient(180deg, rgba(255,255,255,0.15), rgba(0,0,0,0.1)),
        repeating-linear-gradient(
          0deg,
          transparent 0 1.35rem,
          rgba(255,255,255,0.18) 1.35rem 1.45rem
        ),
        repeating-linear-gradient(
          90deg,
          #e77f31 0 6.4rem,
          #de7429 6.4rem 6.45rem,
          #c85f21 6.45rem 12.9rem
        );
      background-size: 6.45rem 1.45rem, 100% 100%, 100% 1.45rem, 100% 100%;
      background-position: 0 0, 0 0, 0 0, 0 0;
    }
  `
})
export class FooterComponent {}