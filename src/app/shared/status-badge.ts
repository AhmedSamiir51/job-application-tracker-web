import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ApplicationStatus } from '../core/models';
import { StatusLabelPipe } from './status';

/** Colored pill showing an application's pipeline status. */
@Component({
  selector: 'app-status-badge',
  imports: [StatusLabelPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [attr.data-status]="status()">{{ status() | statusLabel }}</span>`,
  styles: `
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      white-space: nowrap;
      background: var(--badge-bg, #e2e8f0);
      color: var(--badge-fg, #334155);
    }
    .badge[data-status='Wishlist'] { --badge-bg: #e2e8f0; --badge-fg: #475569; }
    .badge[data-status='Applied'] { --badge-bg: #dbeafe; --badge-fg: #1d4ed8; }
    .badge[data-status='PhoneScreen'] { --badge-bg: #e0e7ff; --badge-fg: #4338ca; }
    .badge[data-status='Interview'] { --badge-bg: #fef3c7; --badge-fg: #b45309; }
    .badge[data-status='Offer'] { --badge-bg: #d1fae5; --badge-fg: #047857; }
    .badge[data-status='Accepted'] { --badge-bg: #bbf7d0; --badge-fg: #15803d; }
    .badge[data-status='Rejected'] { --badge-bg: #fee2e2; --badge-fg: #b91c1c; }
    .badge[data-status='Withdrawn'] { --badge-bg: #f1f5f9; --badge-fg: #64748b; }
  `,
})
export class StatusBadge {
  readonly status = input.required<ApplicationStatus>();
}
