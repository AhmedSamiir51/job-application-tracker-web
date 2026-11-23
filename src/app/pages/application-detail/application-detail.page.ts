import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { errorMessage } from '../../core/errors';
import { ApplicationDetails, ApplicationStatus } from '../../core/models';
import { StatusBadge } from '../../shared/status-badge';
import { StatusLabelPipe, WorkModeLabelPipe } from '../../shared/status';

@Component({
  selector: 'app-application-detail',
  imports: [RouterLink, ReactiveFormsModule, StatusBadge, StatusLabelPipe, WorkModeLabelPipe],
  templateUrl: './application-detail.page.html',
  styleUrl: './application-detail.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationDetailPage {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id')!;

  protected readonly app = signal<ApplicationDetails | null>(null);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly pendingTransition = signal<ApplicationStatus | null>(null);
  protected readonly transitionError = signal<string | null>(null);
  protected readonly confirmingDelete = signal(false);
  protected readonly deleting = signal(false);

  protected readonly noteForm = this.fb.nonNullable.group({
    text: ['', [Validators.required, Validators.maxLength(2000)]],
  });
  protected readonly noteError = signal<string | null>(null);
  protected readonly notePending = signal(false);

  protected readonly salary = computed(() => {
    const app = this.app();
    if (!app || (app.salaryMin == null && app.salaryMax == null)) return null;
    const currency = app.currency ?? '';
    const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (app.salaryMin != null && app.salaryMax != null) return `${currency} ${fmt(app.salaryMin)} – ${fmt(app.salaryMax)}`.trim();
    return `${currency} ${fmt((app.salaryMin ?? app.salaryMax)!)}`.trim();
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.api.getApplication(this.id).subscribe({
      next: (app) => {
        this.app.set(app);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 404) this.notFound.set(true);
        else this.error.set(errorMessage(err));
      },
    });
  }

  protected changeStatus(status: ApplicationStatus, commentInput: HTMLTextAreaElement): void {
    this.pendingTransition.set(status);
    this.transitionError.set(null);
    this.api.changeStatus(this.id, status, commentInput.value.trim() || null).subscribe({
      next: (app) => {
        this.app.set(app);
        this.pendingTransition.set(null);
        commentInput.value = '';
      },
      error: (err) => {
        this.pendingTransition.set(null);
        this.transitionError.set(errorMessage(err, 'Could not change the status.'));
      },
    });
  }

  protected addNote(): void {
    if (this.noteForm.invalid) {
      this.noteForm.markAllAsTouched();
      return;
    }
    this.notePending.set(true);
    this.noteError.set(null);
    this.api.addNote(this.id, this.noteForm.getRawValue().text.trim()).subscribe({
      next: () => {
        this.notePending.set(false);
        this.noteForm.reset();
        this.load();
      },
      error: (err) => {
        this.notePending.set(false);
        this.noteError.set(errorMessage(err, 'Could not add the note.'));
      },
    });
  }

  protected delete(): void {
    this.deleting.set(true);
    this.api.deleteApplication(this.id).subscribe({
      next: () => void this.router.navigate(['/applications']),
      error: (err) => {
        this.deleting.set(false);
        this.confirmingDelete.set(false);
        this.error.set(errorMessage(err, 'Could not delete the application.'));
      },
    });
  }

  protected formatDateTime(utc: string): string {
    return new Date(utc).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  protected formatDate(utc: string | null): string {
    if (!utc) return '—';
    return new Date(utc).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
