import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-[#f5efd9] text-[#5e5a53]">
      <div class="border-y border-[rgba(54,54,54,1)] px-6 py-5">
        <div class="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
          <section>
            <h3 class="mb-3 text-lg font-bold text-[#5e5a53]">{{ t('footer.companyName') }}</h3>
            <ul class="space-y-2 text-[0.95rem] leading-6">
              <li>{{ t('footer.intro') }}</li>
              <li>{{ t('footer.onlineUtilities') }}</li>
              <li>{{ t('footer.giftCard') }}</li>
              <li>{{ t('footer.careers') }}</li>
              <li>{{ t('footer.advertisingContact') }}</li>
              <li>{{ t('footer.partners') }}</li>
            </ul>
          </section>

          <section>
            <h3 class="mb-3 text-lg font-bold text-[#5e5a53]">{{ t('footer.termsOfUse') }}</h3>
            <ul class="space-y-2 text-[0.95rem] leading-6">
              <li>{{ t('footer.generalTerms') }}</li>
              <li>{{ t('footer.transactionTerms') }}</li>
              <li>{{ t('footer.paymentPolicy') }}</li>
              <li>{{ t('footer.privacyPolicy') }}</li>
              <li>{{ t('footer.cinemaRules') }}</li>
              <li>{{ t('footer.faq') }}</li>
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

      <div class="border-b border-[rgba(54,54,54,1)] px-6 py-5">
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
export class FooterComponent {
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t.bind(this.language);
}