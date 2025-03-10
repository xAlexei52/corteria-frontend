// src/app/_services/projects/project.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = `${environment.apiBase}/projects`;

  constructor(private http: HttpClient) {}

  /**
   * Crea un nuevo proyecto
   * @param projectData Datos del proyecto
   */
  createProject(projectData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, projectData).pipe(
      map((response) => {
        if (response.success) {
          return response.project;
        }
        throw new Error('Error creando el proyecto');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene un proyecto por ID
   * @param id ID del proyecto
   */
  getProjectById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        if (response.success) {
          return response.project;
        }
        throw new Error('Error obteniendo el proyecto');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Lista todos los proyectos con filtros opcionales
   * @param filters Filtros para la búsqueda
   */
  listProjects(filters: any = {}): Observable<any> {
    // Construir query string con los filtros
    const queryParams = Object.keys(filters)
      .filter((key) => filters[key] !== undefined && filters[key] !== null)
      .map((key) => `${key}=${filters[key]}`)
      .join('&');

    const url = queryParams ? `${this.apiUrl}?${queryParams}` : this.apiUrl;

    return this.http.get<any>(url).pipe(
      map((response) => {
        if (response.success) {
          return response;
        }
        throw new Error('Error obteniendo la lista de proyectos');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza un proyecto
   * @param id ID del proyecto
   * @param projectData Datos actualizados del proyecto
   */
  updateProject(id: string, projectData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, projectData).pipe(
      map((response) => {
        if (response.success) {
          return response.project;
        }
        throw new Error('Error actualizando el proyecto');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Cambia el estado de un proyecto
   * @param id ID del proyecto
   * @param status Nuevo estado del proyecto
   */
  updateProjectStatus(id: string, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      map((response) => {
        if (response.success) {
          return response.project;
        }
        throw new Error('Error actualizando el estado del proyecto');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene el resumen financiero de un proyecto
   * @param id ID del proyecto
   * @param filters Filtros de fecha opcionales
   */
  getProjectFinancialSummary(id: string, filters: any = {}): Observable<any> {
    // Construir query string con los filtros
    const queryParams = Object.keys(filters)
      .filter((key) => filters[key] !== undefined && filters[key] !== null)
      .map((key) => `${key}=${filters[key]}`)
      .join('&');

    const url = queryParams
      ? `${this.apiUrl}/${id}/financial-summary?${queryParams}`
      : `${this.apiUrl}/${id}/financial-summary`;

    return this.http.get<any>(url).pipe(
      map((response) => {
        if (response.success) {
          return response.summary;
        }
        throw new Error('Error obteniendo el resumen financiero del proyecto');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Crea un nuevo gasto para un proyecto
   * @param projectId ID del proyecto
   * @param expenseData Datos del gasto
   */
  createExpense(projectId: string, expenseData: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/${projectId}/expenses`, expenseData)
      .pipe(
        map((response) => {
          if (response.success) {
            return response.expense;
          }
          throw new Error('Error creando el gasto');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene un gasto por ID
   * @param id ID del gasto
   */
  getExpenseById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/expenses/${id}`).pipe(
      map((response) => {
        if (response.success) {
          return response.expense;
        }
        throw new Error('Error obteniendo el gasto');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Lista gastos de un proyecto con filtros opcionales
   * @param projectId ID del proyecto
   * @param filters Filtros para la búsqueda
   */
  listExpenses(projectId: string, filters: any = {}): Observable<any> {
    // Construir query string con los filtros
    const queryParams = Object.keys(filters)
      .filter((key) => filters[key] !== undefined && filters[key] !== null)
      .map((key) => `${key}=${filters[key]}`)
      .join('&');

    const url = queryParams
      ? `${this.apiUrl}/${projectId}/expenses?${queryParams}`
      : `${this.apiUrl}/${projectId}/expenses`;

    return this.http.get<any>(url).pipe(
      map((response) => {
        if (response.success) {
          return response;
        }
        throw new Error('Error obteniendo la lista de gastos');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza un gasto
   * @param id ID del gasto
   * @param expenseData Datos actualizados del gasto
   */
  updateExpense(id: string, expenseData: any): Observable<any> {
    return this.http
      .put<any>(`${this.apiUrl}/expenses/${id}`, expenseData)
      .pipe(
        map((response) => {
          if (response.success) {
            return response.expense;
          }
          throw new Error('Error actualizando el gasto');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Elimina un gasto
   * @param id ID del gasto
   */
  deleteExpense(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/expenses/${id}`).pipe(
      map((response) => {
        if (response.success) {
          return true;
        }
        throw new Error('Error eliminando el gasto');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Crea un nuevo ingreso para un proyecto
   * @param projectId ID del proyecto
   * @param incomeData Datos del ingreso
   */
  createIncome(projectId: string, incomeData: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/${projectId}/incomes`, incomeData)
      .pipe(
        map((response) => {
          if (response.success) {
            return response.income;
          }
          throw new Error('Error creando el ingreso');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene un ingreso por ID
   * @param id ID del ingreso
   */
  getIncomeById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/incomes/${id}`).pipe(
      map((response) => {
        if (response.success) {
          return response.income;
        }
        throw new Error('Error obteniendo el ingreso');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Lista ingresos de un proyecto con filtros opcionales
   * @param projectId ID del proyecto
   * @param filters Filtros para la búsqueda
   */
  listIncomes(projectId: string, filters: any = {}): Observable<any> {
    // Construir query string con los filtros
    const queryParams = Object.keys(filters)
      .filter((key) => filters[key] !== undefined && filters[key] !== null)
      .map((key) => `${key}=${filters[key]}`)
      .join('&');

    const url = queryParams
      ? `${this.apiUrl}/${projectId}/incomes?${queryParams}`
      : `${this.apiUrl}/${projectId}/incomes`;

    return this.http.get<any>(url).pipe(
      map((response) => {
        if (response.success) {
          return response;
        }
        throw new Error('Error obteniendo la lista de ingresos');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza un ingreso
   * @param id ID del ingreso
   * @param incomeData Datos actualizados del ingreso
   */
  updateIncome(id: string, incomeData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/incomes/${id}`, incomeData).pipe(
      map((response) => {
        if (response.success) {
          return response.income;
        }
        throw new Error('Error actualizando el ingreso');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Elimina un ingreso
   * @param id ID del ingreso
   */
  deleteIncome(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/incomes/${id}`).pipe(
      map((response) => {
        if (response.success) {
          return true;
        }
        throw new Error('Error eliminando el ingreso');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Maneja errores de las peticiones HTTP
   */
  private handleError(error: any) {
    let errorMessage = 'Ha ocurrido un error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMessage =
        error.error?.message ||
        `Código de error: ${error.status}, Mensaje: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
