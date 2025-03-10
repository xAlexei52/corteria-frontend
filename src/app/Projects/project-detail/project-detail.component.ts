// src/app/modules/projects/pages/project-detail/project-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from 'src/app/_services/Projects/project.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css'],
})
export class ProjectDetailComponent implements OnInit {
  projectId: string = '';
  project: any = null;
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    if (this.projectId) {
      this.loadProject();
    } else {
      this.error = 'ID de proyecto no proporcionado';
    }
  }

  loadProject(): void {
    this.loading = true;
    this.error = null;

    this.projectService.getProjectById(this.projectId).subscribe({
      next: (project) => {
        this.project = project;
        this.loading = false;
      },
      error: (err) => {
        this.error = `Error al cargar el proyecto: ${err.message}`;
        this.loading = false;
      },
    });
  }

  editProject(): void {
    this.router.navigate(['/projects/edit', this.projectId]);
  }

  updateStatus(status: string): void {
    this.loading = true;
    this.error = null;

    this.projectService.updateProjectStatus(this.projectId, status).subscribe({
      next: (updatedProject) => {
        this.project = updatedProject;
        this.loading = false;
      },
      error: (err) => {
        this.error = `Error al actualizar el estado: ${err.message}`;
        this.loading = false;
      },
    });
  }

  viewFinancialSummary(): void {
    this.router.navigate(['/projects/financial', this.projectId]);
  }

  viewExpenses(): void {
    this.router.navigate(['/projects/expenses', this.projectId]);
  }

  viewIncomes(): void {
    this.router.navigate(['/projects/incomes', this.projectId]);
  }

  goBack(): void {
    this.router.navigate(['/projects/list']);
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

  formatDate(dateString: string): string {
    if (!dateString) return 'No especificada';

    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  calculateDaysLeft(): number | null {
    if (!this.project || !this.project.estimatedEndDate) {
      return null;
    }

    const estimatedEndDate = new Date(this.project.estimatedEndDate);
    const today = new Date();

    // Si el proyecto ya está completado o cancelado
    if (
      this.project.status === 'completed' ||
      this.project.status === 'cancelled'
    ) {
      return null;
    }

    const timeDiff = estimatedEndDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysLeft;
  }

  getDaysLeftText(): string {
    const daysLeft = this.calculateDaysLeft();

    if (daysLeft === null) {
      return this.project?.status === 'completed' ||
        this.project?.status === 'cancelled'
        ? 'Proyecto finalizado'
        : 'No especificado';
    }

    return daysLeft > 0 ? daysLeft.toString() : 'Vencido';
  }

  // Añadimos un método para determinar la clase de los días restantes
  getDaysLeftClass(): string {
    const daysLeft = this.calculateDaysLeft();

    if (daysLeft === null) {
      return 'bg-gray-100 text-gray-700';
    }

    if (daysLeft <= 0) {
      return 'bg-red-100 text-red-700';
    }

    if (daysLeft <= 7) {
      return 'bg-yellow-100 text-yellow-700';
    }

    return 'bg-green-100 text-green-700';
  }
}
