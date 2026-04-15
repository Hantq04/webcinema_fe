import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="spinner" aria-label="Loading" role="status"></div>
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
export class LoadingSpinnerComponent {}