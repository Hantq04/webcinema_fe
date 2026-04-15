import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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

  readonly label = this.route.snapshot.paramMap.get('name') ?? 'Website';
}