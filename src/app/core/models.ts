/** Mirrors the API contract of the Job Application Tracker API. */

export type ApplicationStatus =
  | 'Wishlist'
  | 'Applied'
  | 'PhoneScreen'
  | 'Interview'
  | 'Offer'
  | 'Accepted'
  | 'Rejected'
  | 'Withdrawn';

export type WorkMode = 'Onsite' | 'Hybrid' | 'Remote';

export type ApplicationSortBy = 'CreatedAt' | 'UpdatedAt' | 'AppliedAt' | 'Company' | 'Status';

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'Wishlist',
  'Applied',
  'PhoneScreen',
  'Interview',
  'Offer',
  'Accepted',
  'Rejected',
  'Withdrawn',
];

export const WORK_MODES: WorkMode[] = ['Onsite', 'Hybrid', 'Remote'];

export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresAtUtc: string;
  user: User;
}

export interface ApplicationSummary {
  id: string;
  companyName: string;
  position: string;
  location: string | null;
  workMode: WorkMode;
  status: ApplicationStatus;
  appliedAtUtc: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface Note {
  id: string;
  text: string;
  createdAtUtc: string;
}

export interface StatusChange {
  from: ApplicationStatus | null;
  to: ApplicationStatus;
  comment: string | null;
  changedAtUtc: string;
}

export interface ApplicationDetails {
  id: string;
  companyName: string;
  position: string;
  location: string | null;
  workMode: WorkMode;
  jobUrl: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  status: ApplicationStatus;
  allowedTransitions: ApplicationStatus[];
  appliedAtUtc: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
  notes: Note[];
  history: StatusChange[];
}

export interface ApplicationStats {
  total: number;
  active: number;
  offers: number;
  responseRate: number;
  byStatus: Partial<Record<ApplicationStatus, number>>;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface SaveApplicationRequest {
  companyName: string;
  position: string;
  workMode: WorkMode;
  location: string | null;
  jobUrl: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  status?: ApplicationStatus;
}

/** ASP.NET Core ProblemDetails / ValidationProblemDetails. */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
}
