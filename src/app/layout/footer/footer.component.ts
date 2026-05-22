import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-[#f5efd9] text-[#5e5a53]">
      <div class="border-t-2 border-black px-6 py-4">
        <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 opacity-90 transition-all duration-300">
          <span class="text-[0.95rem] font-black text-[#8a8a8a] tracking-tight">4DX</span>
          <span class="text-[#8a8a8a] opacity-30 text-xs">|</span>
          <span class="text-[0.95rem] font-black text-[#0097ce] tracking-tighter">IMAX</span>
          <span class="text-[0.85rem] font-black text-[#f4821f] tracking-tight">STARIUM</span>
          <span class="text-[0.85rem] font-black text-[#333] tracking-tighter uppercase">Gold Class</span>
          <span class="text-[#8a8a8a] opacity-30 text-xs">|</span>
          <span class="text-[0.85rem] font-serif font-bold text-black italic tracking-wide">L'AMOUR</span>
          <span class="text-[#8a8a8a] opacity-30 text-xs">|</span>
          <span class="text-[0.85rem] font-black text-[#ff4d8d] tracking-tighter uppercase">Sweetbox</span>
          <span class="text-[#8a8a8a] opacity-30 text-xs">|</span>
          <span class="text-[0.85rem] font-black text-[#e71a0f] tracking-tight uppercase">Premium Cinema</span>
          <span class="text-[#8a8a8a] opacity-30 text-xs">|</span>
          <span class="text-[0.95rem] font-black text-[#8a8a8a] tracking-tight">SCREENX</span>
          <span class="text-[0.85rem] font-bold text-[#4a3b2b] uppercase">Cine & Forêt</span>
          <span class="text-[#8a8a8a] opacity-30 text-xs">|</span>
          <span class="text-[0.85rem] font-bold text-black uppercase">Cine & Living Room</span>
          <span class="text-[0.85rem] font-bold text-black uppercase underline decoration-1">Cine & Suite</span>
        </div>
      </div>

      <div class="border-y-2 border-black px-6 py-5">
        <div class="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
          <section>
            <h3 class="mb-3 text-lg font-bold text-[#5e5a53]">{{ t('footer.companyName') }}</h3>
            <ul class="space-y-2 text-[0.95rem] leading-6">
              <li class="cursor-pointer" (click)="onDevelop()">{{ t('footer.intro') }}</li>
              <li class="cursor-pointer" (click)="onDevelop()">{{ t('footer.onlineUtilities') }}</li>
              <li class="cursor-pointer" (click)="onDevelop()">{{ t('footer.giftCard') }}</li>
              <li class="cursor-pointer" (click)="onDevelop()">{{ t('footer.careers') }}</li>
              <li class="cursor-pointer" (click)="onDevelop()">{{ t('footer.advertisingContact') }}</li>
              <li class="cursor-pointer" (click)="onDevelop()">{{ t('footer.partners') }}</li>
            </ul>
          </section>

          <section>
            <h3 class="mb-3 text-lg font-bold text-[#5e5a53]">{{ t('footer.termsOfUse') }}</h3>
            <ul class="space-y-2 text-[0.95rem] leading-6">
              <li class="cursor-pointer" (click)="onDevelop()">{{ t('footer.generalTerms') }}</li>
              <li class="cursor-pointer" (click)="onDevelop()">{{ t('footer.transactionTerms') }}</li>
              <li class="cursor-pointer" (click)="onDevelop()">{{ t('footer.paymentPolicy') }}</li>
              <li class="cursor-pointer" (click)="onDevelop()">{{ t('footer.privacyPolicy') }}</li>
              <li class="cursor-pointer" (click)="onDevelop()">{{ t('footer.cinemaRules') }}</li>
              <li class="cursor-pointer" (click)="onDevelop()">{{ t('footer.faq') }}</li>
            </ul>
          </section>

          <section>
            <h3 class="mb-3 text-lg font-bold text-[#5e5a53]">{{ t('footer.connectWithUs') }}</h3>
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
            <h3 class="mb-3 text-lg font-bold text-[#5e5a53]">{{ t('footer.customerCare') }}</h3>
            <div class="space-y-2 text-[0.95rem] leading-6">
              <p>{{ t('footer.hotlineLabel') }}</p>
              <p>{{ t('footer.workingHours') }}</p>
              <p>{{ t('footer.supportEmail') }}</p>
            </div>
          </section>
        </div>
      </div>

      <div class="px-6 py-5">
        <div class="mx-auto grid max-w-7xl gap-4 md:grid-cols-[auto_1fr] md:items-start">
          <div class="text-3xl font-black uppercase tracking-[-0.08em] text-[#808080]">CG</div>
          <div class="space-y-1 text-[0.95rem] leading-6">
            <h4 class="text-base font-bold uppercase text-[#5e5a53]">{{ t('footer.legalName') }}</h4>
            <p>{{ t('footer.businessCertificate') }}</p>
            <p>{{ t('footer.address') }}</p>
            <p>{{ t('footer.hotline') }}</p>
            <p>{{ t('footer.copyright') }}</p>
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
      height: 120px;
      background: url('/brick-wall.jpg') repeat-x center bottom;
      background-size: auto 100%;
    }


  `
})
export class FooterComponent {
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t.bind(this.language);
  protected onDevelop(): void {
    alert(this.t('account.devMessage'));
  }
}