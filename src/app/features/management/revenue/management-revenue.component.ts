import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
  PLATFORM_ID,
  ElementRef,
  ViewChild
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';
import { ManagementRevenueService, RevenueSummaryItem, RevenueFilter } from '../../../core/services/management-revenue.service';
import { CinemaService, CinemaDTO } from '../../../core/services/cinema.service';
import { ManagementMovieService } from '../../../core/services/management-movie.service';

@Component({
  selector: 'app-management-revenue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './management-revenue.component.html',
  styleUrls: ['./management-revenue.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementRevenueComponent implements OnInit, OnDestroy {
  protected readonly language = inject(LanguageService);
  private readonly revenueService = inject(ManagementRevenueService);
  private readonly cinemaService = inject(CinemaService);
  private readonly movieService = inject(ManagementMovieService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly t = this.language.t.bind(this.language);

  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  // Filter state
  fromDate = signal<string>(this.getDefaultFromDate());
  toDate = signal<string>(this.getDefaultToDate());
  groupBy = signal<'DAY' | 'WEEK' | 'MONTH'>('DAY');
  activeChartGroupBy = signal<'DAY' | 'WEEK' | 'MONTH'>('DAY');
  selectedCinemaId = signal<string | null>(null);
  selectedRoomId = signal<number | null>(null);
  selectedMovieId = signal<number | null>(null);

  // Data state
  summaryData = signal<RevenueSummaryItem[]>([]);
  isLoading = signal(false);
  isExporting = signal(false);
  hasError = signal(false);

  // Dropdown data
  cinemas = signal<CinemaDTO[]>([]);
  movies = signal<any[]>([]);

  // Chart reference
  private chartInstance: any = null;
  private pendingChartDraw = false;

  // Chart type toggle
  chartType = signal<'area' | 'bar'>('area');

  // Dropdown open states
  isCinemaDropdownOpen = signal(false);
  isMovieDropdownOpen = signal(false);

  // KPI computeds
  totalRevenue = computed(() =>
    this.summaryData().reduce((s, r) => s + (r.totalRevenue || 0), 0)
  );
  totalTicketRevenue = computed(() =>
    this.summaryData().reduce((s, r) => s + (r.ticketRevenue || 0), 0)
  );
  totalFoodRevenue = computed(() =>
    this.summaryData().reduce((s, r) => s + (r.foodRevenue || 0), 0)
  );
  totalTicketCount = computed(() =>
    this.summaryData().reduce((s, r) => s + (r.ticketCount || 0), 0)
  );

  constructor() {
    // effect() runs after Angular processes signal changes and updates the view
    // This ensures *ngIf has rendered the canvas before we try to draw
    effect(() => {
      const data = this.summaryData();
      const loading = this.isLoading();
      if (!loading && data.length > 0 && isPlatformBrowser(this.platformId)) {
        this.pendingChartDraw = true;
        // Force CD so *ngIf renders canvas, then attempt to draw
        this.cdr.detectChanges();
        this.attemptDrawChart();
      }
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDropdowns();
      this.search();
    }
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  private getDefaultFromDate(): string {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().split('T')[0];
  }

  private getDefaultToDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private loadDropdowns(): void {
    this.cinemaService.getAllCinemas().subscribe({
      next: (data) => {
        this.cinemas.set(data);
        this.cdr.markForCheck();
      },
      error: () => this.cinemas.set([])
    });

    this.movieService.getNowShowingMovies().subscribe({
      next: (res: any) => {
        const data = res?.data || res || [];
        this.movies.set(Array.isArray(data) ? data : []);
        this.cdr.markForCheck();
      },
      error: () => this.movies.set([])
    });
  }

  search(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    // Destroy existing chart instance to avoid canvas conflicts
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
    this.cdr.markForCheck();

    const filter: RevenueFilter = {
      fromDate: this.fromDate(),
      toDate: this.toDate(),
      groupBy: this.groupBy(),
      cinemaId: this.selectedCinemaId(),
      roomId: this.selectedRoomId(),
      movieId: this.selectedMovieId()
    };

    this.revenueService.getSummary(filter).subscribe({
      next: (res: any) => {
        const data: RevenueSummaryItem[] = res?.data || res || [];
        this.summaryData.set(Array.isArray(data) ? data : []);
        this.activeChartGroupBy.set(filter.groupBy || 'DAY');
        this.isLoading.set(false);
        // Force change detection so *ngIf renders canvas, then draw chart
        this.cdr.detectChanges();
        this.attemptDrawChart();
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
        this.summaryData.set([]);
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Try to draw chart; if canvas not yet in DOM (due to *ngIf), retry with exponential backoff.
   */
  private attemptDrawChart(retries = 6, delay = 60): void {
    this.pendingChartDraw = false;
    const canvas = this.chartCanvas?.nativeElement;
    if (!canvas) {
      if (retries > 0) {
        setTimeout(() => {
          this.cdr.detectChanges();
          this.attemptDrawChart(retries - 1, delay + 50);
        }, delay);
      }
      return;
    }
    this.drawChart(canvas);
  }

  exportExcel(): void {
    this.isExporting.set(true);
    const filter: RevenueFilter = {
      fromDate: this.fromDate(),
      toDate: this.toDate(),
      groupBy: this.activeChartGroupBy(),
      cinemaId: this.selectedCinemaId(),
      roomId: this.selectedRoomId(),
      movieId: this.selectedMovieId()
    };

    this.revenueService.exportExcel(filter).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bao-cao-doanh-thu-${this.fromDate()}-to-${this.toDate()}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.isExporting.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.isExporting.set(false);
        this.cdr.markForCheck();
        alert(this.t('management.unableToExportExcel'));
      }
    });
  }

  setGroupBy(g: 'DAY' | 'WEEK' | 'MONTH'): void {
    this.groupBy.set(g);
  }

  /** Safe null-aware handler for cinema select — avoids +$event returning NaN for "null" string */
  onCinemaChange(value: any): void {
    const parsed = (value === '' || value === 'null' || value == null) ? null : String(value);
    this.selectedCinemaId.set(parsed);
  }

  /** Safe null-aware handler for movie select */
  onMovieChange(value: any): void {
    const parsed = (value === '' || value === 'null' || value == null) ? null : Number(value);
    this.selectedMovieId.set(parsed !== null && isNaN(parsed) ? null : parsed);
  }

  getSelectedCinemaName(): string {
    const id = this.selectedCinemaId();
    const cinema = this.cinemas().find(c => String(c.code) === String(id));
    return cinema?.nameOfCinema ?? '';
  }

  getSelectedMovieName(): string {
    const id = this.selectedMovieId();
    const movie = this.movies().find(m => String(m.id) === String(id));
    return movie?.name ?? '';
  }

  isCinemaSelected(code: string | null): boolean {
    const current = this.selectedCinemaId(); // number | null
    if (code === null || code === '') return current === null;
    return current !== null && String(current) === String(code);
  }

  isMovieSelected(id: number | null): boolean {
    const current = this.selectedMovieId();
    if (id === null) return current === null;
    return current === id;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value || 0);
  }

  setChartType(type: 'area' | 'bar'): void {
    this.chartType.set(type);
    const canvas = this.chartCanvas?.nativeElement;
    if (canvas && this.summaryData().length > 0) {
      this.drawChart(canvas);
    }
  }

  private drawChart(canvas: HTMLCanvasElement): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const data = this.summaryData();
    if (!data.length) return;

    // Destroy previous instance to avoid "Canvas already in use" error
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    const labels = data.map(d => this.formatPeriodLabel(d.period));
    const totalRevenues = data.map(d => d.totalRevenue || 0);
    const ticketRevenues = data.map(d => d.ticketRevenue || 0);
    const foodRevenues = data.map(d => d.foodRevenue || 0);

    const ChartJS = (window as any)['Chart'];
    if (!ChartJS) {
      this.drawFallbackChart(canvas, data, labels);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isArea = this.chartType() === 'area';

    // Create gradient fills for area chart
    const gradientTotal = ctx.createLinearGradient(0, 0, 0, 340);
    gradientTotal.addColorStop(0, 'rgba(214, 47, 31, 0.35)');
    gradientTotal.addColorStop(0.5, 'rgba(214, 47, 31, 0.12)');
    gradientTotal.addColorStop(1, 'rgba(214, 47, 31, 0.01)');

    const gradientTicket = ctx.createLinearGradient(0, 0, 0, 340);
    gradientTicket.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
    gradientTicket.addColorStop(0.5, 'rgba(99, 102, 241, 0.15)');
    gradientTicket.addColorStop(1, 'rgba(99, 102, 241, 0.01)');

    const gradientFood = ctx.createLinearGradient(0, 0, 0, 340);
    gradientFood.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
    gradientFood.addColorStop(0.5, 'rgba(16, 185, 129, 0.12)');
    gradientFood.addColorStop(1, 'rgba(16, 185, 129, 0.01)');

    const commonLineProps = {
      type: 'line' as const,
      fill: true,
      tension: 0.45,
      pointRadius: 4,
      pointHoverRadius: 7,
      pointBorderWidth: 2,
      borderWidth: 2.5,
    };

    const datasets = isArea
      ? [
        {
          ...commonLineProps,
          label: 'Tổng doanh thu',
          data: totalRevenues,
          backgroundColor: gradientTotal,
          borderColor: '#e63946',
          pointBackgroundColor: '#fff',
          pointBorderColor: '#e63946',
          order: 1
        },
        {
          ...commonLineProps,
          label: 'Doanh thu vé',
          data: ticketRevenues,
          backgroundColor: gradientTicket,
          borderColor: '#6366f1',
          pointBackgroundColor: '#fff',
          pointBorderColor: '#6366f1',
          order: 2
        },
        {
          ...commonLineProps,
          label: 'Doanh thu F&B',
          data: foodRevenues,
          backgroundColor: gradientFood,
          borderColor: '#10b981',
          pointBackgroundColor: '#fff',
          pointBorderColor: '#10b981',
          order: 3
        }
      ]
      : [
        {
          label: 'Doanh thu vé',
          data: ticketRevenues,
          backgroundColor: 'rgba(99, 102, 241, 0.82)',
          borderColor: '#6366f1',
          borderWidth: 0,
          borderRadius: 6,
          borderSkipped: false,
          order: 1
        },
        {
          label: 'Doanh thu F&B',
          data: foodRevenues,
          backgroundColor: 'rgba(16, 185, 129, 0.82)',
          borderColor: '#10b981',
          borderWidth: 0,
          borderRadius: 6,
          borderSkipped: false,
          order: 2
        },
        {
          label: 'Tổng doanh thu',
          data: totalRevenues,
          type: 'line' as const,
          fill: false,
          tension: 0.45,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBorderWidth: 2,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#e63946',
          borderColor: '#e63946',
          borderWidth: 2.5,
          borderDash: [6, 3],
          order: 0
        }
      ];

    this.chartInstance = new ChartJS(ctx, {
      type: isArea ? 'line' : 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600, easing: 'easeInOutQuart' },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            titleColor: '#f8fafc',
            bodyColor: '#94a3b8',
            padding: { x: 14, y: 12 },
            cornerRadius: 10,
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            displayColors: true,
            boxWidth: 10,
            boxHeight: 10,
            boxPadding: 4,
            callbacks: {
              label: (context: any) => {
                const val = context.parsed.y;
                return `  ${context.dataset.label}: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: '#94a3b8',
              font: { size: 11, family: 'Inter, sans-serif' },
              maxRotation: 0
            }
          },
          y: {
            grid: { color: 'rgba(148,163,184,0.1)', lineWidth: 1 },
            border: { display: false, dash: [4, 4] },
            ticks: {
              color: '#94a3b8',
              font: { size: 11, family: 'Inter, sans-serif' },
              callback: (value: any) => {
                if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + 'T';
                if (value >= 1_000_000) return (value / 1_000_000).toFixed(0) + 'M';
                if (value >= 1_000) return (value / 1_000).toFixed(0) + 'K';
                return value;
              }
            }
          }
        }
      }
    });
  }

  private drawFallbackChart(canvas: HTMLCanvasElement, data: RevenueSummaryItem[], labels: string[]): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.parentElement?.clientWidth || 700;
    const H = 340;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    const PAD = { top: 24, right: 24, bottom: 44, left: 64 };
    const cW = W - PAD.left - PAD.right;
    const cH = H - PAD.top - PAD.bottom;

    ctx.clearRect(0, 0, W, H);

    const isArea = this.chartType() === 'area';
    const n = data.length;
    const maxVal = Math.max(...data.map(d => d.totalRevenue || 0), 1);

    const xOf = (i: number) => PAD.left + (i / (n - 1 || 1)) * cW;
    const yOf = (v: number) => PAD.top + cH - (v / maxVal) * cH;

    // --- Grid lines ---
    ctx.save();
    ctx.strokeStyle = 'rgba(148,163,184,0.15)';
    ctx.lineWidth = 1;
    const steps = 5;
    for (let s = 0; s <= steps; s++) {
      const y = PAD.top + (s / steps) * cH;
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(PAD.left + cW, y);
      ctx.stroke();

      // Y-axis labels
      const val = maxVal * (1 - s / steps);
      let label = '';
      if (val >= 1_000_000_000) label = (val / 1_000_000_000).toFixed(1) + 'T';
      else if (val >= 1_000_000) label = (val / 1_000_000).toFixed(0) + 'M';
      else if (val >= 1_000) label = (val / 1_000).toFixed(0) + 'K';
      else label = val.toFixed(0);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter,sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(label, PAD.left - 8, y + 4);
    }
    ctx.restore();

    if (isArea) {
      // ---- AREA CHART ----
      const series = [
        { vals: data.map(d => d.foodRevenue || 0), color: '#10b981', rgba0: 'rgba(16,185,129,0.35)', rgba1: 'rgba(16,185,129,0.02)' },
        { vals: data.map(d => d.ticketRevenue || 0), color: '#6366f1', rgba0: 'rgba(99,102,241,0.40)', rgba1: 'rgba(99,102,241,0.02)' },
        { vals: data.map(d => d.totalRevenue || 0), color: '#e63946', rgba0: 'rgba(230,57,70,0.30)', rgba1: 'rgba(230,57,70,0.02)' },
      ];

      const smoothPath = (pts: { x: number, y: number }[]) => {
        if (pts.length < 2) return;
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 0; i < pts.length - 1; i++) {
          const cp1x = pts[i].x + (pts[i + 1].x - pts[i].x) * 0.45;
          const cp1y = pts[i].y;
          const cp2x = pts[i + 1].x - (pts[i + 1].x - pts[i].x) * 0.45;
          const cp2y = pts[i + 1].y;
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, pts[i + 1].x, pts[i + 1].y);
        }
      };

      series.forEach(s => {
        const pts = n === 1
          ? [{ x: xOf(0), y: yOf(s.vals[0]) }]
          : data.map((_, i) => ({ x: xOf(i), y: yOf(s.vals[i]) }));

        // Gradient fill
        const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + cH);
        grad.addColorStop(0, s.rgba0);
        grad.addColorStop(1, s.rgba1);

        ctx.save();
        ctx.beginPath();
        smoothPath(pts);
        ctx.lineTo(pts[pts.length - 1].x, PAD.top + cH);
        ctx.lineTo(pts[0].x, PAD.top + cH);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();

        // Stroke line
        ctx.save();
        ctx.beginPath();
        smoothPath(pts);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();

        // Dots
        if (n <= 30) {
          pts.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.strokeStyle = s.color;
            ctx.lineWidth = 2;
            ctx.stroke();
          });
        }
      });

    } else {
      // ---- BAR CHART ----
      const barGap = 0.18;
      const groupW = cW / n;
      const barW = Math.max(Math.min(groupW * (1 - barGap) / 2, 28), 4);

      data.forEach((d, i) => {
        const cx = PAD.left + i * groupW + groupW / 2;
        const bx1 = cx - barW - 2;
        const bx2 = cx + 2;

        // Ticket bar
        const th = Math.max((d.ticketRevenue / maxVal) * cH, 2);
        const tGrad = ctx.createLinearGradient(0, PAD.top + cH - th, 0, PAD.top + cH);
        tGrad.addColorStop(0, 'rgba(99,102,241,0.9)');
        tGrad.addColorStop(1, 'rgba(99,102,241,0.6)');
        ctx.fillStyle = tGrad;
        roundRect(ctx, bx1, PAD.top + cH - th, barW, th, 4);

        // Food bar
        const fh = Math.max((d.foodRevenue / maxVal) * cH, 2);
        const fGrad = ctx.createLinearGradient(0, PAD.top + cH - fh, 0, PAD.top + cH);
        fGrad.addColorStop(0, 'rgba(16,185,129,0.9)');
        fGrad.addColorStop(1, 'rgba(16,185,129,0.6)');
        ctx.fillStyle = fGrad;
        roundRect(ctx, bx2, PAD.top + cH - fh, barW, fh, 4);
      });

      // Total line overlay (dashed)
      ctx.save();
      ctx.beginPath();
      const tPts = data.map((d, i) => ({ x: PAD.left + i * groupW + groupW / 2, y: yOf(d.totalRevenue || 0) }));
      tPts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = '#e63946';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.setLineDash([]);
      tPts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#e63946';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      ctx.restore();
    }

    // --- X-axis labels ---
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter,sans-serif';
    ctx.textAlign = 'center';
    const skip = Math.ceil(n / 12);
    labels.forEach((lbl, i) => {
      if (i % skip === 0 || i === n - 1) {
        const x = isArea ? xOf(i) : PAD.left + i * (cW / n) + (cW / n) / 2;
        ctx.fillText(lbl, x, PAD.top + cH + 18);
      }
    });

    // Helper function for rounded rectangles
    function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
      const radius = Math.min(r, w / 2, h / 2);
      c.beginPath();
      c.moveTo(x + radius, y);
      c.lineTo(x + w - radius, y);
      c.quadraticCurveTo(x + w, y, x + w, y + radius);
      c.lineTo(x + w, y + h);
      c.lineTo(x, y + h);
      c.lineTo(x, y + radius);
      c.quadraticCurveTo(x, y, x + radius, y);
      c.closePath();
      c.fill();
    }
  }


  private formatPeriodLabel(period: string): string {
    if (!period) return '';
    try {
      const clean = String(period).trim();

      // 1. Parse yyyy-MM-dd or yyyy/MM/dd (e.g. 2026-05-20)
      const dateMatch = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (dateMatch) {
        const year = dateMatch[1];
        const month = dateMatch[2].padStart(2, '0');
        const day = dateMatch[3].padStart(2, '0');
        if (this.activeChartGroupBy() === 'MONTH') return `${month}/${year}`;
        if (this.activeChartGroupBy() === 'WEEK') return `T${day}/${month}`;
        return `${day}/${month}`;
      }

      // 2. Parse yyyy-MM or MM/yyyy (e.g. 2026-05, 05/2026)
      const monthMatch = clean.match(/^(\d{4})[-/](\d{1,2})$/) || clean.match(/^(\d{1,2})[-/](\d{4})$/);
      if (monthMatch) {
        const isFirstYear = monthMatch[1].length === 4;
        const year = isFirstYear ? monthMatch[1] : monthMatch[2];
        const month = (isFirstYear ? monthMatch[2] : monthMatch[1]).padStart(2, '0');
        return `${month}/${year}`;
      }

      // 3. Fallback: standard Date parsing
      const d = new Date(clean.replace(' ', 'T'));
      if (!isNaN(d.getTime())) {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        if (this.activeChartGroupBy() === 'MONTH') return `${mm}/${yyyy}`;
        if (this.activeChartGroupBy() === 'WEEK') return `T${dd}/${mm}`;
        return `${dd}/${mm}`;
      }

      return period;
    } catch {
      return period;
    }
  }

  isEn(): boolean {
    return this.language.currentLanguage() === 'en';
  }
}
