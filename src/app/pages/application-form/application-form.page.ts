import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { errorMessage, fieldErrors } from '../../core/errors';
import {
  APPLICATION_STATUSES,
  SaveApplicationRequest,
  WORK_MODES,
} from '../../core/models';

const salaryRangeValidator: ValidatorFn = (group): ValidationErrors | null => {
  const min = group.get('salaryMin')?.value;
  const max = group.get('salaryMax')?.value;
  if (min != null && min !== '' && max != null && max !== '' && Number(max) < Number(min)) {
    return { salaryRange: true };
  }
  return null;
};

@Component({
  selector: 'app-application-form',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './application-form.page.html',
  styleUrl: './application-form.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationFormPage {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly statuses = APPLICATION_STATUSES.slice(0, 2); // new applications start as Wishlist or Applied
  protected readonly workModes = WORK_MODES;

  protected readonly id = this.route.snapshot.paramMap.get('id');
  protected readonly isEdit = !!this.id;
  protected readonly loading = signal(this.isEdit);
  protected readonly pending = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly serverFieldErrors = signal<Record<string, string>>({});

  protected readonly form = this.fb.nonNullable.group(
    {
      companyName: ['', [Validators.required, Validators.maxLength(150)]],
      position: ['', [Validators.required, Validators.maxLength(150)]],
      workMode: this.fb.nonNullable.control<'Onsite' | 'Hybrid' | 'Remote'>('Onsite'),
      location: ['', [Validators.maxLength(150)]],
      jobUrl: ['', [Validators.maxLength(2048), Validators.pattern(/^$|^https?:\/\/.+/i)]],
      salaryMin: [null as number | null, [Validators.min(0)]],
      salaryMax: [null as number | null, [Validators.min(0)]],
      currency: ['', [Validators.pattern(/^$|^[A-Za-z]{3}$/)]],
      status: this.fb.nonNullable.control<'Wishlist' | 'Applied'>('Applied'),
    },
    { validators: salaryRangeValidator },
  );

  constructor() {
    if (this.id) {
      this.api.getApplication(this.id).subscribe({
        next: (app) => {
          this.form.patchValue({
            companyName: app.companyName,
            position: app.position,
            workMode: app.workMode,
            location: app.location ?? '',
            jobUrl: app.jobUrl ?? '',
            salaryMin: app.salaryMin,
            salaryMax: app.salaryMax,
            currency: app.currency ?? '',
          });
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Could not load the application.');
        },
      });
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.pending.set(true);
    this.error.set(null);
    this.serverFieldErrors.set({});

    const value = this.form.getRawValue();
    const body: SaveApplicationRequest = {
      companyName: value.companyName.trim(),
      position: value.position.trim(),
      workMode: value.workMode,
      location: value.location.trim() || null,
      jobUrl: value.jobUrl.trim() || null,
      salaryMin: value.salaryMin ?? null,
      salaryMax: value.salaryMax ?? null,
      currency: value.currency.trim().toUpperCase() || null,
    };

    const request$ = this.isEdit
      ? this.api.updateApplication(this.id!, body)
      : this.api.createApplication({ ...body, status: value.status });

    request$.subscribe({
      next: (app) => void this.router.navigate(['/applications', app.id]),
      error: (err) => {
        this.pending.set(false);
        this.serverFieldErrors.set(fieldErrors(err));
        this.error.set(errorMessage(err, 'Could not save the application.'));
      },
    });
  }

  protected serverError(field: string): string | null {
    return this.serverFieldErrors()[field] ?? null;
  }

  protected invalid(control: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[control];
    return c.touched && c.invalid;
  }
}
