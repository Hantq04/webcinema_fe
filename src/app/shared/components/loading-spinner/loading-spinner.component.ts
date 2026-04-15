import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-loading-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="spinner" [attr.aria-label]="t('shared.loading')" role="status"></div>
  `,
  styles: `
    .spinner {
      aspect-ratio: 1;
      border: 0.25rem solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      width: 2rem;
    }
  `
})
  export class LoadingSpinnerComponent {
    protected readonly language = inject(LanguageService);
    protected readonly t = this.language.t.bind(this.language);
  }