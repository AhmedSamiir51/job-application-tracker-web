import { HttpErrorResponse } from '@angular/common/http';
import { ProblemDetails } from './models';

/** Turns an API error (RFC 7807 ProblemDetails) into one readable message. */
export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof HttpErrorResponse) {
    const problem = error.error as ProblemDetails | undefined;
    if (problem?.errors) {
      const messages = Object.values(problem.errors).flat();
      if (messages.length) return messages.join(' ');
    }
    if (problem?.detail) return problem.detail;
    if (problem?.title && problem.status !== 500) return problem.title;
    if (error.status === 0) return 'Cannot reach the server. Check your connection and try again.';
    if (error.status === 401) return 'Invalid email or password.';
    if (error.status === 429) return 'Too many attempts. Please wait a moment and try again.';
  }
  return fallback;
}

/** Field-level validation errors from a 400 ValidationProblemDetails. */
export function fieldErrors(error: unknown): Record<string, string> {
  if (error instanceof HttpErrorResponse && error.status === 400) {
    const problem = error.error as ProblemDetails | undefined;
    if (problem?.errors) {
      return Object.fromEntries(
        Object.entries(problem.errors).map(([key, messages]) => [key.toLowerCase(), messages.join(' ')]),
      );
    }
  }
  return {};
}
