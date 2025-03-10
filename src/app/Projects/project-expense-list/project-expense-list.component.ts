// src/app/modules/projects/pages/project-expense-list/project-expense-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from 'src/app/_services/Projects/project.service';

@Component({
  selector: 'app-project-expense-list',
  templateUrl: './project-expense-list.component.html',
  styleUrls: ['./project-expense-list.component.css'],
})
export class ProjectExpenseListComponent implements OnInit {
  projectId: string = '';
  project: any = null;
  expenses: any[] = [];
  loading: boolean = false;
  error: string | null = null;

  // Variables para filtros
  filters: any = {
    search: '',
    category: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10,
  };

  // Variables para paginación
  pagination: any = {
    totalPages: 0,
    currentPage: 1,
    total: 0,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('projectId') || '';
    if (this.projectId) {
      this.loadProject();
      this.loadExpenses();
    } else {
      this.error = 'ID de proyecto no proporcionado';
    }
  }

  loadProject(): void {
    this.loading = true;
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (project) => {
        this.project = project;
        // No establecemos loading a false aquí porque también estamos cargando los gastos
      },
      error: (err) => {
        this.error = `Error al cargar el proyecto: ${err.message}`;
        this.loading = false;
      },
    });
  }

  loadExpenses(): void {
    this.loading = true;
    this.error = null;

    this.projectService.listExpenses(this.projectId, this.filters).subscribe({
      next: (response) => {
        this.expenses = response.expenses;
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (err) => {
        this.error = `Error al cargar los gastos: ${err.message}`;
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.filters.page = 1; // Resetear a la primera página al aplicar filtros
    this.loadExpenses();
  }

  resetFilters(): void {
    this.filters = {
      search: '',
      category: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 10,
    };
    this.loadExpenses();
  }

  changePage(page: number): void {
    if (
      page !== this.filters.page &&
      page > 0 &&
      page <= this.pagination.totalPages
    ) {
      this.filters.page = page;
      this.loadExpenses();
    }
  }

  createExpense(): void {
    this.router.navigate(['/projects/expenses/new', this.projectId]);
  }

  editExpense(expenseId: string): void {
    this.router.navigate(['/projects/expenses/edit', expenseId]);
  }

  deleteExpense(expenseId: string): void {
    if (
      confirm(
        '¿Estás seguro de querer eliminar este gasto? Esta acción no se puede deshacer.'
      )
    ) {
      this.loading = true;
      this.error = null;

      this.projectService.deleteExpense(expenseId).subscribe({
        next: () => {
          this.loadExpenses(); // Recargar la lista después de eliminar
        },
        error: (err) => {
          this.error = `Error al eliminar el gasto: ${err.message}`;
          this.loading = false;
        },
      });
    }
  }

  formatMoney(amount: number): string {
    return amount.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  }

  goBack(): void {
    this.router.navigate(['/projects/details', this.projectId]);
  }

  viewFinancialSummary(): void {
    this.router.navigate(['/projects/financial', this.projectId]);
  }
}
