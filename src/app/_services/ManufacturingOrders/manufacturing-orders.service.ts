// manufacturing-orders.service.ts
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
export class ManufacturingOrdersService {
  private apiUrl = `${environment.apiBase}/manufacturing-orders`;

  constructor(private http: HttpClient) {}

  // Obtener listado de órdenes con filtros opcionales
  getManufacturingOrders(params?: any): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page);
      if (params.limit) httpParams = httpParams.set('limit', params.limit);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.city) httpParams = httpParams.set('city', params.city);
      if (params.startDate)
        httpParams = httpParams.set('startDate', params.startDate);
      if (params.endDate)
        httpParams = httpParams.set('endDate', params.endDate);
      if (params.productId)
        httpParams = httpParams.set('productId', params.productId);
      // Nuevo parámetro
      if (params.calculationStatus)
        httpParams = httpParams.set(
          'calculationStatus',
          params.calculationStatus
        );
    }

    return this.http
      .get<any>(this.apiUrl, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // Obtener una orden por ID
  getManufacturingOrderById(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Crear una nueva orden de manufactura
  createManufacturingOrder(orderData: any): Observable<any> {
    return this.http
      .post<any>(this.apiUrl, orderData)
      .pipe(catchError(this.handleError));
  }

  // Actualizar el estado de una orden
  updateOrderStatus(id: string, statusData: any): Observable<any> {
    return this.http
      .patch<any>(`${this.apiUrl}/${id}/status`, statusData)
      .pipe(catchError(this.handleError));
  }

  // Agregar gastos a una orden
  addOrderExpenses(id: string, expenses: any[]): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/${id}/expenses`, { expenses })
      .pipe(catchError(this.handleError));
  }

  // Agregar subproductos a una orden
  addOrderSubproducts(id: string, subproducts: any[]): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/${id}/subproducts`, { subproducts })
      .pipe(catchError(this.handleError));
  }

  // Calcular costos y rentabilidad de una orden
  calculateOrderCosts(id: string, calculationData: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/${id}/calculate`, calculationData)
      .pipe(catchError(this.handleError));
  }

  // Eliminar una orden
  deleteManufacturingOrder(id: string): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/${id}`)
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
