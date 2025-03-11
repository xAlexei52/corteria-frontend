// src/app/modules/projects/pages/project-financial/project-financial.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from 'src/app/_services/Projects/project.service';

@Component({
  selector: 'app-project-financial',
  templateUrl: './project-financial.component.html',
  styleUrls: ['./project-financial.component.css'],
})
export class ProjectFinancialComponent implements OnInit {
  projectId: string = '';
  project: any = null;
  summary: any = null;
  loading: boolean = false;
  error: string | null = null;

  // Para filtros de fecha
  dateFilters = {
    startDate: '',
    endDate: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    if (this.projectId) {
      this.loadProject();
      this.loadFinancialSummary();
    } else {
      this.error = 'ID de proyecto no proporcionado';
    }
  }

  loadProject(): void {
    this.loading = true;
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (project) => {
        this.project = project;
        // No establecemos loading a false aquí porque también estamos cargando el resumen financiero
      },
      error: (err) => {
        this.error = `Error al cargar el proyecto: ${err.message}`;
        this.loading = false;
      },
    });
  }

  loadFinancialSummary(): void {
    this.loading = true;
    this.error = null;

    this.projectService
      .getProjectFinancialSummary(this.projectId, this.dateFilters)
      .subscribe({
        next: (summary) => {
          this.summary = summary;
          this.loading = false;
        },
        error: (err) => {
          this.error = `Error al cargar el resumen financiero: ${err.message}`;
          this.loading = false;
        },
      });
  }

  applyFilters(): void {
    this.loadFinancialSummary();
  }

  resetFilters(): void {
    this.dateFilters = {
      startDate: '',
      endDate: '',
    };
    this.loadFinancialSummary();
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

  formatMoney(amount: number): string {
    return amount.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'No especificada';

    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  viewExpenses(): void {
    this.router.navigate(['/projects/expenses', this.projectId]);
  }

  viewIncomes(): void {
    this.router.navigate(['/projects/incomes', this.projectId]);
  }

  goBack(): void {
    this.router.navigate(['/projects/details', this.projectId]);
  }
}
