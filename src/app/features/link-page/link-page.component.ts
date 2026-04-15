import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-link-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="flex min-h-[60vh] items-center justify-center bg-white px-6 py-12 text-[#111827]">
      <h1 class="text-3xl font-bold tracking-tight">{{ label }}</h1>
    </main>
  `
})
export class LinkPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly language = inject(LanguageService);
  protected readonly t = this.language.t.bind(this.language);

  readonly label = this.route.snapshot.paramMap.get('name') ?? this.t('shared.website');
}