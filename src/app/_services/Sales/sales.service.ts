// sales.service.ts
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private apiUrl = `${environment.apiBase}/sales`;

  constructor(private http: HttpClient) {}

  // Obtener listado de ventas con filtros opcionales
  getSales(params?: any): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page);
      if (params.limit) httpParams = httpParams.set('limit', params.limit);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.startDate)
        httpParams = httpParams.set('startDate', params.startDate);
      if (params.endDate)
        httpParams = httpParams.set('endDate', params.endDate);
      if (params.customerId)
        httpParams = httpParams.set('customerId', params.customerId);
      if (params.city) httpParams = httpParams.set('city', params.city);
    }

    return this.http
      .get<any>(this.apiUrl, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // Obtener una venta por ID
  getSaleById(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Crear una nueva venta
  createSale(saleData: any): Observable<any> {
    return this.http
      .post<any>(this.apiUrl, saleData)
      .pipe(catchError(this.handleError));
  }

  // Cancelar una venta
  cancelSale(id: string): Observable<any> {
    return this.http
      .patch<any>(`${this.apiUrl}/${id}/cancel`, {})
      .pipe(catchError(this.handleError));
  }

  // Registrar un pago para una venta
  registerPayment(saleId: string, paymentData: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/${saleId}/payments`, paymentData)
      .pipe(catchError(this.handleError));
  }

  // Obtener pagos de una venta
  getSalePayments(saleId: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/${saleId}/payments`)
      .pipe(catchError(this.handleError));
  }

  // Obtener estadísticas de ventas
  getSalesStats(params?: any): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.startDate)
        httpParams = httpParams.set('startDate', params.startDate);
      if (params.endDate)
        httpParams = httpParams.set('endDate', params.endDate);
      if (params.city) httpParams = httpParams.set('city', params.city);
    }

    return this.http
      .get<any>(`${this.apiUrl}/stats`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // Manejador de errores genérico
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // El backend devolvió un código de respuesta no exitoso
      errorMessage =
        error.error?.message ||
        `Código de error: ${error.status}, Mensaje: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
