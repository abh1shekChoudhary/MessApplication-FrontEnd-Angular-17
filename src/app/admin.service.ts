import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface MealPrice {
  mealType: string;   // "BREAKFAST" | "LUNCH" | "DINNER"
  priceInr: number;
}

export interface WeeklyMenuItem {
  id: number;
  dayOfWeek: string;
  mealType: string;
  name: string;
  description: string;
}

export interface BulkUploadResult {
  successCount: number;
  failureCount: number;
  errors: string[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Prices ──────────────────────────────────────────────────────────────
  getPrices(): Observable<MealPrice[]> {
    return this.http.get<MealPrice[]>(`${this.base}/prices`);
  }

  updatePrice(mealType: string, priceInr: number): Observable<MealPrice> {
    return this.http.put<MealPrice>(`${this.base}/prices/${mealType}`, { mealType, priceInr });
  }

  // ── Menu ────────────────────────────────────────────────────────────────
  getFullMenu(): Observable<WeeklyMenuItem[]> {
    return this.http.get<WeeklyMenuItem[]>(`${this.base}/menu`);
  }

  updateMenuItem(day: string, mealType: string, name: string, description: string): Observable<WeeklyMenuItem> {
    return this.http.put<WeeklyMenuItem>(`${this.base}/menu/${day}/${mealType}`, { name, description });
  }

  // ── Bulk Upload ─────────────────────────────────────────────────────────
  bulkUpload(file: File): Observable<BulkUploadResult> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<BulkUploadResult>(`${this.base}/students/bulk`, form);
  }
}
