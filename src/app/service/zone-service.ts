import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class ZoneService {
  private baseUrl = environment.baseUrl; // http://localhost:3000

  constructor(private http: HttpClient) {}

  // CREATE ZONE
  createZone(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/zones`,
      payload
    );
  }

  // GET ALL ZONES
  getZones(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.baseUrl}/zones`
    );
  }

  // UPDATE ZONE
  updateZone(id: string, payload: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.baseUrl}/zones/${id}`,
      payload
    );
  }

  // DELETE ZONE
  deleteZone(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.baseUrl}/zones/${id}`
    );
  }

  // FIND ZONE BY LAT/LNG
  findZone(lat: number, lng: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/zones/find?lat=${lat}&lng=${lng}`
    );
  }
}
