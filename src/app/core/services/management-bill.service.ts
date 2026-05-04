import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiService } from './api.service';
import { BillDTO, BillHoldResponse } from '../models/bill.model';

@Injectable({
  providedIn: 'root'
})
export class ManagementBillService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);

  createBill(payload: BillDTO): Observable<BillHoldResponse> {
    return this.http.post<any>(this.apiService.apiUrl('/api/v1/bill/create'), payload).pipe(
      map(response => response.data as BillHoldResponse)
    );
  }

  updateBill(payload: BillDTO): Observable<any> {
    return this.http.put<any>(this.apiService.apiUrl('/api/v1/bill/update'), payload);
  }

  cancelBill(tradingCode: string): Observable<any> {
    return this.http.delete<any>(this.apiService.apiUrl(`/api/v1/bill/cancel?tradingCode=${tradingCode}`));
  }

  deleteBill(tradingCode: string): Observable<any> {
    return this.http.delete<any>(this.apiService.apiUrl(`/api/v1/bill/delete?tradingCode=${tradingCode}`));
  }

  submitPayment(code: string): Observable<string> {
    return this.http.post(this.apiService.apiUrl(`/api/v1/bill/payment/submit-payment?code=${code}`), {}, { responseType: 'text' });
  }

  getVnPayPaymentUrl(): Observable<any> {
    // If needed directly
    return this.http.get<any>(this.apiService.apiUrl('/api/v1/bill/payment/vnPay-payment'));
  }

  getAllStatus(): Observable<any[]> {
    return this.http.get<any>(this.apiService.apiUrl('/api/v1/bill/status/get-all-status')).pipe(
      map(response => response.data || []),
      catchError(() => of([]))
    );
  }

  deleteTicket(id: string | number): Observable<any> {
    return this.http.delete<any>(this.apiService.apiUrl(`/api/v1/bill/ticket/delete?id=${id}`));
  }

  deleteFood(id: string | number): Observable<any> {
    return this.http.delete<any>(this.apiService.apiUrl(`/api/v1/bill/food/delete?id=${id}`));
  }
}
