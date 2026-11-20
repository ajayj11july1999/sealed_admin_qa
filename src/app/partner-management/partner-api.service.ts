import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  B2bCustomer,
  CostPreview,
  CreatePartnerPayload,
  GeoPoint,
  IssuedCredentials,
  Partner,
  PartnerCostRow,
  PartnerStatus,
  PartnerUser,
  Rate,
} from './partner.models';

/**
 * Talks to sealed_partner_api's admin surface.
 *
 * No auth code here on purpose: the panel's AuthInterceptor already sends the
 * admin's login token (sessionStorage.tokenA) on every request, and
 * sealed_partner_api accepts that same token after confirming the user is an
 * admin or subadmin. A valid login without that role gets 403, not 401, so the
 * interceptor never logs anyone out because of this screen.
 */
@Injectable({ providedIn: 'root' })
export class PartnerApiService {
  private readonly base = environment.partnerApiUrl;

  constructor(private http: HttpClient) {}

  listPartners(): Observable<Partner[]> {
    return this.http.get<Partner[]>(`${this.base}partners`);
  }

  getPartner(keyId: string): Observable<Partner> {
    return this.http.get<Partner>(`${this.base}partners/${encodeURIComponent(keyId)}`);
  }

  createPartner(payload: CreatePartnerPayload): Observable<IssuedCredentials> {
    return this.http.post<IssuedCredentials>(`${this.base}partners`, payload);
  }

  setPartnerStatus(keyId: string, status: PartnerStatus): Observable<Partner> {
    return this.http.patch<Partner>(`${this.base}partners/${encodeURIComponent(keyId)}`, { status });
  }

  listCosts(keyId: string): Observable<PartnerCostRow[]> {
    return this.http.get<PartnerCostRow[]>(`${this.base}partners/${encodeURIComponent(keyId)}/costs`);
  }

  setCost(keyId: string, vehicleId: string, rate: Rate): Observable<PartnerCostRow> {
    return this.http.put<PartnerCostRow>(`${this.base}partners/${encodeURIComponent(keyId)}/costs/${encodeURIComponent(vehicleId)}`, rate);
  }

  removeCost(keyId: string, vehicleId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}partners/${encodeURIComponent(keyId)}/costs/${encodeURIComponent(vehicleId)}`);
  }

  previewCost(keyId: string, pickup: GeoPoint, drops: GeoPoint[]): Observable<CostPreview> {
    return this.http.post<CostPreview>(`${this.base}partners/${encodeURIComponent(keyId)}/costs/preview`, {
      pickupAddress: [pickup],
      dropAddress: drops,
    });
  }

  listUsers(keyId: string): Observable<PartnerUser[]> {
    return this.http.get<PartnerUser[]>(`${this.base}partners/${encodeURIComponent(keyId)}/users`);
  }

  createUser(keyId: string, payload: { email: string; name?: string; password: string }): Observable<PartnerUser> {
    return this.http.post<PartnerUser>(`${this.base}partners/${encodeURIComponent(keyId)}/users`, payload);
  }

  setUserStatus(keyId: string, userId: string, status: 'active' | 'disabled'): Observable<PartnerUser> {
    return this.http.patch<PartnerUser>(this.userUrl(keyId, userId), { status });
  }

  setUserPassword(keyId: string, userId: string, password: string): Observable<void> {
    return this.http.put<void>(`${this.userUrl(keyId, userId)}/password`, { password });
  }

  private userUrl(keyId: string, userId: string): string {
    return `${this.base}partners/${encodeURIComponent(keyId)}/users/${encodeURIComponent(userId)}`;
  }

  /** Verified S2B customers from sealed_new_b — the accounts a partner's orders can belong to. */
  listB2bCustomers(): Observable<B2bCustomer[]> {
    return this.http
      .get<{ data?: B2bCustomer[] }>(`${environment.baseUrl}main/users/b2bCust/list?userType=masteragent,normaluser`)
      .pipe(map(res => (Array.isArray(res?.data) ? res.data : [])));
  }
}

/** One readable line for a toast, from whatever HttpClient handed back. */
export function partnerApiError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return `Can't reach the partner API at ${environment.partnerApiUrl}. Check that sealed_partner_api is running and allows this panel's origin.`;
    }
    const body = error.error;
    if (body && typeof body === 'object' && typeof body.message === 'string') {
      const detail = Array.isArray(body.data?.details) ? body.data.details[0] : null;
      return detail?.field && detail?.issue ? `${body.message} — ${detail.field}: ${detail.issue}` : body.message;
    }
    if (error.status === 403) {
      return 'Only Sealed admins can manage partners.';
    }
    return error.message || 'Request failed';
  }
  return error instanceof Error ? error.message : 'Request failed';
}

/** A random password the admin can hand to the partner (16 chars, no look-alikes). */
export function generatePassword(length = 16): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => alphabet[b % alphabet.length]).join('');
}

export function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  document.body.removeChild(area);
  return Promise.resolve();
}
