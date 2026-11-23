import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import {
  APPLICATION_STATUSES,
  ApplicationStats,
  ApplicationStatus,
  ApplicationSummary,
} from '../../core/models';
import { StatusBadge } from '../../shared/status-badge';
import { StatusLabelPipe } from '../../shared/status';

interface PipelineRow {
  status: ApplicationStatus;
  count: number;
  share: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, StatusBadge, StatusLabelPipe],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly api = inject(ApiService);

  protected readonly stats = signal<ApplicationStats | null>(null);
  protected readonly recent = signal<ApplicationSummary[]>([]);
  protected readonly loading = signal(true);

  protected readonly pipeline = computed<PipelineRow[]>(() => {
    const stats = this.stats();
    if (!stats) return [];
    const max = Math.max(1, ...APPLICATION_STATUSES.map((s) => stats.byStatus[s] ?? 0));
    return APPLICATION_STATUSES.map((status) => {
      const count = stats.byStatus[status] ?? 0;
      return { status, count, share: count / max };
    });
  });

  constructor() {
    forkJoin({
      stats: this.api.getStats(),
      recent: this.api.listApplications({ sortBy: 'UpdatedAt', descending: true, pageSize: 5 }),
    }).subscribe({
      next: ({ stats, recent }) => {
        this.stats.set(stats);
        this.recent.set(recent.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected percent(rate: number): string {
    return `${Math.round(rate * 100)}%`;
  }

  protected formatDate(utc: string): string {
    return new Date(utc).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
