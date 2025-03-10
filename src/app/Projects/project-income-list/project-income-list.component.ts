// src/app/modules/projects/pages/project-income-list/project-income-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from 'src/app/_services/Projects/project.service';

@Component({
  selector: 'app-project-income-list',
  templateUrl: './project-income-list.component.html',
  styleUrls: ['./project-income-list.component.css'],
})
export class ProjectIncomeListComponent implements OnInit {
  projectId: string = '';
  project: any = null;
  incomes: any[] = [];
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
      this.loadIncomes();
    } else {
      this.error = 'ID de proyecto no proporcionado';
    }
  }

  loadProject(): void {
    this.loading = true;
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (project) => {
        this.project = project;
        // No establecemos loading a false aquí porque también estamos cargando los ingresos
      },
      error: (err) => {
        this.error = `Error al cargar el proyecto: ${err.message}`;
        this.loading = false;
      },
    });
  }

  loadIncomes(): void {
    this.loading = true;
    this.error = null;

    this.projectService.listIncomes(this.projectId, this.filters).subscribe({
      next: (response) => {
        this.incomes = response.incomes;
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (err) => {
        this.error = `Error al cargar los ingresos: ${err.message}`;
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.filters.page = 1; // Resetear a la primera página al aplicar filtros
    this.loadIncomes();
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
    this.loadIncomes();
  }

  changePage(page: number): void {
    if (
      page !== this.filters.page &&
      page > 0 &&
      page <= this.pagination.totalPages
    ) {
      this.filters.page = page;
      this.loadIncomes();
    }
  }

  createIncome(): void {
    this.router.navigate(['/projects/incomes/new', this.projectId]);
  }

  editIncome(incomeId: string): void {
    this.router.navigate(['/projects/incomes/edit', incomeId]);
  }

  deleteIncome(incomeId: string): void {
    if (
      confirm(
        '¿Estás seguro de querer eliminar este ingreso? Esta acción no se puede deshacer.'
      )
    ) {
      this.loading = true;
      this.error = null;

      this.projectService.deleteIncome(incomeId).subscribe({
        next: () => {
          this.loadIncomes(); // Recargar la lista después de eliminar
        },
        error: (err) => {
          this.error = `Error al eliminar el ingreso: ${err.message}`;
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
