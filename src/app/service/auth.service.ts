// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {

//   constructor() { }

// }

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { from as fromPromise } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authorization: any;
  userId: any;

  public loggedIn: BehaviorSubject<boolean>;
  jwtHelper: any;

  constructor(private router: Router, private http: HttpClient) {
    this.loggedIn = new BehaviorSubject<boolean>(false);
  }

  //login api

  getAuthHeaders() {
    // Normalize token so we don't send Bearer twice
    const rawToken = (sessionStorage.getItem('tokenA') || '').toString().trim();
    const token = rawToken.replace(/^Bearer\s+/i, '');
    const rawUserId = localStorage.getItem('useridA') || '';
    let userId = '';
    try { userId = rawUserId ? JSON.parse(rawUserId) : ''; } catch { userId = rawUserId.trim(); }

    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (userId) {
      headers.userId = userId;
    }

    return headers;
  }

  /** get authenticat state */
  public isAuthenticated(): boolean {
    const token = sessionStorage.getItem('tokenA');
    if (token == null || !token.toString().trim()) {
      return false;
    }
    // If JWT token expiry check is required and JwtHelperService is available
    try {
      const parsed = token.toString().replace(/^Bearer\s+/i, '');
      const jwt: any = JSON.parse(atob(parsed.split('.')[1]));
      const exp = jwt.exp;
      if (exp && Math.floor(Date.now() / 1000) > exp) {
        return false;
      }
    } catch (e) {
      // not JWT, cannot validate. Assume valid as long as non-empty
    }
    return true;
  }

  public isTokenExpired(): boolean {
    const token = (sessionStorage.getItem('tokenA') || '').toString().replace(/^Bearer\s+/i, '');
    if (!token) return true;

    try {
      const jwt: any = JSON.parse(atob(token.split('.')[1]));
      const exp = jwt.exp;
      return exp ? Math.floor(Date.now() / 1000) >= exp : false;
    } catch (e) {
      return false;
    }
  }

  /** Login  */
  postLogin(url: string, pbody: any): Observable<any> {
    url = environment?.baseUrl + url;
    return this.http.post(url, pbody).pipe(map((res) => res));
  }
  getGuestAuthApiData(url: string): Observable<any> {
    const token = sessionStorage.getItem('tokenA') || '';
    const rawUserId = localStorage.getItem('useridA') || '';
    let userId = '';
    try { userId = rawUserId ? JSON.parse(rawUserId) : ''; } catch { userId = rawUserId; }

    url = environment?.baseUrl + url;
    const options = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        userId: userId,
      },
    };

    return this.http.get<any>(url, options).pipe(
      tap(() => console.log('GET API called:', url)),
      catchError(this.handleError('getGuestAuthApiData', []))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (err: any): Observable<T> => {
      console.error(`${operation} error:`, err);

      if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
        console.warn('Unauthorized/Forbidden detected, clearing storage and redirecting to login.');
        sessionStorage.clear();
        localStorage.clear();
        this.router.navigate(['/login']);
      }

      return throwError(() => err);
    };
  }
  guestAuthGetapi(url: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getGuestAuthApiData(url).subscribe(
        (res) => {
          resolve(res);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  // guestpost(url: string, pbody: any): Observable<any> {
  //   url = environment?.baseUrl + url;
  //   return this.http.post(url, pbody).pipe(map((res) => res));
  // }

  guestpost(url: string, body: any): Observable<any> {
    const token = sessionStorage.getItem('tokenA') || '';
    const rawUserId = localStorage.getItem('useridA') || '';
    let userId = '';
    try { userId = rawUserId ? JSON.parse(rawUserId) : ''; } catch { userId = rawUserId; }

    url = environment.baseUrl + url;

    const options = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        userId: userId,
      },
    };

    return this.http.post<any>(url, body, options).pipe(
      tap(() => console.log('POST API called')),
      catchError(this.handleError('guestpost', []))
    );
  }

  // postGuestAuthApiData(url: string, body: any): Observable<any> {
  //   this.authorization = sessionStorage.getItem('tokenA')
  //     ? sessionStorage.getItem('tokenA')
  //     : '';
  //   this.userId = localStorage.getItem('useridA')
  //     ? JSON.parse(localStorage.getItem('useridA') || '')
  //     : '';
  //   console.log(this.authorization);
  //   url = environment?.baseUrl + url;
  //   const options = {
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: this.authorization,
  //       userId: this.userId,
  //     },
  //   };
  //   return this.http.post<any>(url, body, options).pipe(
  //     tap((_) => console.log('test')),
  //     catchError(this.handleError('err', []))
  //   );
  // }
  postGuestAuthApiData(url: string, body: any): Observable<any> {
    const token = sessionStorage.getItem('tokenA') || '';
    const rawUserId = localStorage.getItem('useridA') || '';
    let userId = '';
    try { userId = rawUserId ? JSON.parse(rawUserId) : ''; } catch { userId = rawUserId; }

    url = environment.baseUrl + url;

    const options = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        userId: userId,
      },
    };

    return this.http.post<any>(url, body, options).pipe(
      tap(() => console.log('POST API called')),
      catchError(this.handleError('postGuestAuthApiData', []))
    );
  }

  putGuestAuthApiData(url: string, body: any): Observable<any> {
    const token = sessionStorage.getItem('tokenA') || '';
    const rawUserId = localStorage.getItem('useridA') || '';
    const userId = rawUserId ? JSON.parse(rawUserId) : '';

    url = environment?.baseUrl + url;
    const options = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        userId: userId,
      },
    };
    return this.http.put<any>(url, body, options).pipe(
      tap(() => console.log('PUT API called')),
      catchError(this.handleError('putGuestAuthApiData', []))
    );
  }

  deleteGuestAuthApiData(url: string): Observable<any> {
    const token = sessionStorage.getItem('tokenA') || '';
    const rawUserId = localStorage.getItem('useridA') || '';
    let userId = '';
    try { userId = rawUserId ? JSON.parse(rawUserId) : ''; } catch { userId = rawUserId; }

    url = environment?.baseUrl + url;
    const options = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        userId: userId,
      },
    };

    return this.http.delete<any>(url, options).pipe(
      tap(() => console.log('DELETE API called')),
      catchError(this.handleError('deleteGuestAuthApiData', []))
    );
  }
}
