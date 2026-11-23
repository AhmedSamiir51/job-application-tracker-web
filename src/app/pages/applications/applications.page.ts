import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ApiService, ListApplicationsFilter } from '../../core/api.service';
import {
  APPLICATION_STATUSES,
  ApplicationSortBy,
  ApplicationStatus,
  ApplicationSummary,
  PagedResult,
  WORK_MODES,
  WorkMode,
} from '../../core/models';
import { StatusBadge } from '../../shared/status-badge';
import { WorkModeLabelPipe } from '../../shared/status';

@Component({
  selector: 'app-applications',
  imports: [RouterLink, StatusBadge, WorkModeLabelPipe],
  templateUrl: './applications.page.html',
  styleUrl: './applications.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationsPage implements OnDestroy {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  protected readonly statuses = APPLICATION_STATUSES;
  protected readonly workModes = WORK_MODES;

  protected readonly result = signal<PagedResult<ApplicationSummary> | null>(null);
  protected readonly loading = signal(true);

  protected readonly search = signal('');
  protected readonly status = signal<ApplicationStatus | null>(null);
  protected readonly workMode = signal<WorkMode | null>(null);
  protected readonly sortBy = signal<ApplicationSortBy>('CreatedAt');
  protected readonly descending = signal(true);
  protected readonly page = signal(1);
  protected readonly pageSize = 10;

  protected readonly hasFilters = computed(
    () => !!this.search().trim() || !!this.status() || !!this.workMode(),
  );

  private readonly searchInput$ = new Subject<string>();

  constructor() {
    const initial = this.route.snapshot.queryParams['status'];
    if (APPLICATION_STATUSES.includes(initial)) this.status.set(initial as ApplicationStatus);

    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => {
        this.search.set(value);
        this.page.set(1);
        this.load();
      });

    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onSearch(value: string): void {
    this.searchInput$.next(value);
  }

  protected setStatus(value: string): void {
    this.status.set(value ? (value as ApplicationStatus) : null);
    this.page.set(1);
    this.load();
  }

  protected setWorkMode(value: string): void {
    this.workMode.set(value ? (value as WorkMode) : null);
    this.page.set(1);
    this.load();
  }

  protected setSort(value: string): void {
    const [sortBy, dir] = value.split(':');
    this.sortBy.set(sortBy as ApplicationSortBy);
    this.descending.set(dir === 'desc');
    this.page.set(1);
    this.load();
  }

  protected goToPage(page: number): void {
    this.page.set(page);
    this.load();
  }

  protected clearFilters(): void {
    this.search.set('');
    this.status.set(null);
    this.workMode.set(null);
    this.page.set(1);
    void this.router.navigate([], { queryParams: {} });
    this.load();
  }

  protected formatDate(utc: string | null): string {
    if (!utc) return '—';
    return new Date(utc).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  protected pages(totalPages: number): number[] {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  private load(): void {
    this.loading.set(true);
    const filter: ListApplicationsFilter = {
      status: this.status(),
      workMode: this.workMode(),
      search: this.search(),
      sortBy: this.sortBy(),
      descending: this.descending(),
      page: this.page(),
      pageSize: this.pageSize,
    };
    this.api.listApplications(filter).subscribe({
      next: (result) => {
        this.result.set(result);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
