// src/app/modules/projects/pages/project-list/project-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from 'src/app/_services/Projects/project.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
})
export class ProjectListComponent implements OnInit {
  projects: any[] = [];
  loading: boolean = false;
  error: string | null = null;

  // Variables para filtros
  filters: any = {
    search: '',
    status: '',
    page: 1,
    limit: 10,
  };

  // Variables para paginación
  pagination: any = {
    totalPages: 0,
    currentPage: 1,
    total: 0,
  };

  constructor(private projectService: ProjectService, private router: Router) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.error = null;

    this.projectService.listProjects(this.filters).subscribe({
      next: (response) => {
        this.projects = response.projects;
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.filters.page = 1; // Resetear a la primera página al aplicar filtros
    this.loadProjects();
  }

  resetFilters(): void {
    this.filters = {
      search: '',
      status: '',
      page: 1,
      limit: 10,
    };
    this.loadProjects();
  }

  changePage(page: number): void {
    if (
      page !== this.filters.page &&
      page > 0 &&
      page <= this.pagination.totalPages
    ) {
      this.filters.page = page;
      this.loadProjects();
    }
  }

  viewProjectDetails(projectId: string): void {
    this.router.navigate(['/projects/details', projectId]);
  }

  editProject(projectId: string): void {
    this.router.navigate(['/projects/edit', projectId]);
  }

  viewFinancialSummary(projectId: string): void {
    this.router.navigate(['/projects/financial', projectId]);
  }

  viewExpenses(projectId: string): void {
    this.router.navigate(['/projects/expenses', projectId]);
  }

  viewIncomes(projectId: string): void {
    this.router.navigate(['/projects/incomes', projectId]);
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
}
