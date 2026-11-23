import { Pipe, PipeTransform } from '@angular/core';
import { ApplicationStatus, WorkMode } from '../core/models';

/** Human labels for pipeline statuses. */
@Pipe({ name: 'statusLabel' })
export class StatusLabelPipe implements PipeTransform {
  private static readonly labels: Record<ApplicationStatus, string> = {
    Wishlist: 'Wishlist',
    Applied: 'Applied',
    PhoneScreen: 'Phone screen',
    Interview: 'Interview',
    Offer: 'Offer',
    Accepted: 'Accepted',
    Rejected: 'Rejected',
    Withdrawn: 'Withdrawn',
  };

  transform(status: ApplicationStatus): string {
    return StatusLabelPipe.labels[status] ?? status;
  }
}

@Pipe({ name: 'workModeLabel' })
export class WorkModeLabelPipe implements PipeTransform {
  transform(mode: WorkMode): string {
    return mode === 'Onsite' ? 'On-site' : mode;
  }
}
