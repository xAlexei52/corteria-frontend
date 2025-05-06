// src/app/_services/Inventory/inventory.service.ts

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
export class InventoryService {
  private apiUrl = `${environment.apiBase}/inventory`;

  constructor(private http: HttpClient) {}

  // Obtener listado de inventario con filtros opcionales
  getInventory(params?: any): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.warehouseId)
        httpParams = httpParams.set('warehouseId', params.warehouseId);
      if (params.itemType)
        httpParams = httpParams.set('itemType', params.itemType);
      if (params.itemId) httpParams = httpParams.set('itemId', params.itemId);
      if (params.city) httpParams = httpParams.set('city', params.city);
      if (params.page) httpParams = httpParams.set('page', params.page);
      if (params.limit) httpParams = httpParams.set('limit', params.limit);
    }

    return this.http
      .get<any>(this.apiUrl, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // Obtener resumen de inventario de productos por ciudad
  getProductInventorySummary(city: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/products/summary/${city}`)
      .pipe(catchError(this.handleError));
  }

  // Transferir inventario entre almacenes
  transferInventory(transferData: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/transfer`, transferData)
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
