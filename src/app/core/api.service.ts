import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApplicationDetails,
  ApplicationSortBy,
  ApplicationStats,
  ApplicationStatus,
  ApplicationSummary,
  AuthResponse,
  Note,
  PagedResult,
  SaveApplicationRequest,
  WorkMode,
} from './models';

export interface ListApplicationsFilter {
  status?: ApplicationStatus | null;
  workMode?: WorkMode | null;
  search?: string | null;
  sortBy?: ApplicationSortBy;
  descending?: boolean;
  page?: number;
  pageSize?: number;
}

/** Typed client for the Job Application Tracker API. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  register(email: string, fullName: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/api/auth/register`, { email, fullName, password });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/api/auth/login`, { email, password });
  }

  listApplications(filter: ListApplicationsFilter = {}): Observable<PagedResult<ApplicationSummary>> {
    let params = new HttpParams()
      .set('sortBy', filter.sortBy ?? 'CreatedAt')
      .set('descending', filter.descending ?? true)
      .set('page', filter.page ?? 1)
      .set('pageSize', filter.pageSize ?? 20);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.workMode) params = params.set('workMode', filter.workMode);
    if (filter.search?.trim()) params = params.set('search', filter.search.trim());
    return this.http.get<PagedResult<ApplicationSummary>>(`${this.base}/api/applications`, { params });
  }

  getStats(): Observable<ApplicationStats> {
    return this.http.get<ApplicationStats>(`${this.base}/api/applications/stats`);
  }

  getApplication(id: string): Observable<ApplicationDetails> {
    return this.http.get<ApplicationDetails>(`${this.base}/api/applications/${id}`);
  }

  createApplication(body: SaveApplicationRequest): Observable<ApplicationDetails> {
    return this.http.post<ApplicationDetails>(`${this.base}/api/applications`, body);
  }

  updateApplication(id: string, body: SaveApplicationRequest): Observable<ApplicationDetails> {
    return this.http.put<ApplicationDetails>(`${this.base}/api/applications/${id}`, body);
  }

  changeStatus(id: string, status: ApplicationStatus, comment: string | null): Observable<ApplicationDetails> {
    return this.http.post<ApplicationDetails>(`${this.base}/api/applications/${id}/status`, { status, comment });
  }

  addNote(id: string, text: string): Observable<Note> {
    return this.http.post<Note>(`${this.base}/api/applications/${id}/notes`, { text });
  }

  deleteApplication(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/applications/${id}`);
  }
}
