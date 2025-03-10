// src/app/modules/projects/pages/project-income-form/project-income-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from 'src/app/_services/Projects/project.service';

@Component({
  selector: 'app-project-income-form',
  templateUrl: './project-income-form.component.html',
  styleUrls: ['./project-income-form.component.css'],
})
export class ProjectIncomeFormComponent implements OnInit {
  incomeForm: FormGroup;
  projectId: string = '';
  incomeId: string | null = null;
  isEditMode = false;
  project: any = null;
  loading = false;
  submitting = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.incomeForm = this.fb.group({
      description: ['', [Validators.required, Validators.maxLength(200)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      category: [''],
      notes: [''],
    });
  }

  ngOnInit(): void {
    // Determinar si estamos en modo de edición o creación
    this.incomeId = this.route.snapshot.paramMap.get('id');
    this.projectId = this.route.snapshot.paramMap.get('projectId') || '';
    this.isEditMode = !!this.incomeId;

    if (this.isEditMode && this.incomeId) {
      this.loadIncome(this.incomeId);
    } else if (this.projectId) {
      this.loadProject(this.projectId);
    } else {
      this.error = 'ID de proyecto no proporcionado';
    }
  }

  loadProject(id: string): void {
    this.loading = true;
    this.error = null;

    this.projectService.getProjectById(id).subscribe({
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

  loadIncome(id: string): void {
    this.loading = true;
    this.error = null;

    this.projectService.getIncomeById(id).subscribe({
      next: (income) => {
        // Guardar el ID del proyecto para la navegación de regreso
        this.projectId = income.projectId;
        this.loadProject(income.projectId);

        // Formatear la fecha para el campo de fecha
        if (income.date) {
          income.date = new Date(income.date).toISOString().split('T')[0];
        }

        this.incomeForm.patchValue(income);
        this.loading = false;
      },
      error: (err) => {
        this.error = `Error al cargar el ingreso: ${err.message}`;
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.incomeForm.invalid) {
      this.markFormGroupTouched(this.incomeForm);
      return;
    }

    this.submitting = true;
    this.error = null;

    const incomeData = this.incomeForm.value;

    if (this.isEditMode && this.incomeId) {
      this.projectService.updateIncome(this.incomeId, incomeData).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/projects/incomes', this.projectId]);
        },
        error: (err) => {
          this.error = `Error al actualizar el ingreso: ${err.message}`;
          this.submitting = false;
        },
      });
    } else {
      this.projectService.createIncome(this.projectId, incomeData).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/projects/incomes', this.projectId]);
        },
        error: (err) => {
          this.error = `Error al crear el ingreso: ${err.message}`;
          this.submitting = false;
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/projects/incomes', this.projectId]);
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

  // Función auxiliar para marcar todos los campos como tocados
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
