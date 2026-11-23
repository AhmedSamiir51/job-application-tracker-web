import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthStore } from '../../core/auth.store';
import { errorMessage, fieldErrors } from '../../core/errors';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './auth.page.html',
  styleUrl: './auth.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthPage {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly mode = signal<'login' | 'register'>(
    this.route.snapshot.data['mode'] === 'register' ? 'register' : 'login',
  );
  protected readonly isRegister = computed(() => this.mode() === 'register');
  protected readonly pending = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly serverFieldErrors = signal<Record<string, string>>({});

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
    password: ['', [Validators.required]],
  });

  constructor() {
    // Password rules mirror the API's register validator.
    this.route.data.subscribe((data) => {
      this.mode.set(data['mode'] === 'register' ? 'register' : 'login');
      this.error.set(null);
      this.serverFieldErrors.set({});
      const fullName = this.form.controls.fullName;
      fullName.setValidators(this.isRegister() ? [Validators.required, Validators.maxLength(150)] : [Validators.maxLength(150)]);
      fullName.updateValueAndValidity();
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.pending.set(true);
    this.error.set(null);
    this.serverFieldErrors.set({});

    const { email, password, fullName } = this.form.getRawValue();
    const request$ = this.isRegister()
      ? this.api.register(email, fullName, password)
      : this.api.login(email, password);

    request$.subscribe({
      next: (response) => {
        this.auth.signIn(response);
        void this.router.navigate(['/']);
      },
      error: (err) => {
        this.pending.set(false);
        this.serverFieldErrors.set(fieldErrors(err));
        this.error.set(errorMessage(err, 'Could not sign you in. Please try again.'));
      },
    });
  }

  protected serverError(field: string): string | null {
    return this.serverFieldErrors()[field] ?? null;
  }
}
