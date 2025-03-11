// customers.service.ts
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
export class CustomersService {
  private apiUrl = `${environment.apiBase}/customers`;

  constructor(private http: HttpClient) {}

  // Obtener listado de clientes con filtros opcionales
  getCustomers(params?: any): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page);
      if (params.limit) httpParams = httpParams.set('limit', params.limit);
      if (params.city) httpParams = httpParams.set('city', params.city);
      if (params.hasDebt !== undefined)
        httpParams = httpParams.set('hasDebt', params.hasDebt);
      if (params.search) httpParams = httpParams.set('search', params.search);
    }

    return this.http
      .get<any>(this.apiUrl, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // Obtener un cliente por ID
  getCustomerById(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Crear un nuevo cliente
  createCustomer(customerData: any): Observable<any> {
    return this.http
      .post<any>(this.apiUrl, customerData)
      .pipe(catchError(this.handleError));
  }

  // Actualizar un cliente existente
  updateCustomer(id: string, customerData: any): Observable<any> {
    return this.http
      .put<any>(`${this.apiUrl}/${id}`, customerData)
      .pipe(catchError(this.handleError));
  }

  // Agregar un documento a un cliente
  addCustomerDocument(
    customerId: string,
    documentFile: File,
    description: string
  ): Observable<any> {
    const formData = new FormData();
    formData.append('document', documentFile);
    formData.append('description', description);

    return this.http
      .post<any>(`${this.apiUrl}/${customerId}/documents`, formData)
      .pipe(catchError(this.handleError));
  }

  // Eliminar un documento de un cliente
  deleteCustomerDocument(
    customerId: string,
    documentId: string
  ): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/${customerId}/documents/${documentId}`)
      .pipe(catchError(this.handleError));
  }

  // Obtener las ventas de un cliente
  getCustomerSales(customerId: string, params?: any): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page);
      if (params.limit) httpParams = httpParams.set('limit', params.limit);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.startDate)
        httpParams = httpParams.set('startDate', params.startDate);
      if (params.endDate)
        httpParams = httpParams.set('endDate', params.endDate);
    }

    return this.http
      .get<any>(`${this.apiUrl}/${customerId}/sales`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // Obtener resumen financiero de un cliente
  getCustomerFinancialSummary(customerId: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/${customerId}/financial-summary`)
      .pipe(catchError(this.handleError));
  }

  // Verificar deuda de un cliente
  checkCustomerDebt(customerId: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/${customerId}/check-debt`)
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
