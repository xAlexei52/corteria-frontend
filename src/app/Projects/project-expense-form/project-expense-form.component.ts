// src/app/modules/projects/pages/project-expense-form/project-expense-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from 'src/app/_services/Projects/project.service';

@Component({
  selector: 'app-project-expense-form',
  templateUrl: './project-expense-form.component.html',
  styleUrls: ['./project-expense-form.component.css'],
})
export class ProjectExpenseFormComponent implements OnInit {
  expenseForm: FormGroup;
  projectId: string = '';
  expenseId: string | null = null;
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
    this.expenseForm = this.fb.group({
      description: ['', [Validators.required, Validators.maxLength(200)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      category: [''],
      notes: [''],
    });
  }

  ngOnInit(): void {
    // Determinar si estamos en modo de edición o creación
    this.expenseId = this.route.snapshot.paramMap.get('id');
    this.projectId = this.route.snapshot.paramMap.get('projectId') || '';
    this.isEditMode = !!this.expenseId;

    if (this.isEditMode && this.expenseId) {
      this.loadExpense(this.expenseId);
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

  loadExpense(id: string): void {
    this.loading = true;
    this.error = null;

    this.projectService.getExpenseById(id).subscribe({
      next: (expense) => {
        // Guardar el ID del proyecto para la navegación de regreso
        this.projectId = expense.projectId;
        this.loadProject(expense.projectId);

        // Formatear la fecha para el campo de fecha
        if (expense.date) {
          expense.date = new Date(expense.date).toISOString().split('T')[0];
        }

        this.expenseForm.patchValue(expense);
        this.loading = false;
      },
      error: (err) => {
        this.error = `Error al cargar el gasto: ${err.message}`;
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.expenseForm.invalid) {
      this.markFormGroupTouched(this.expenseForm);
      return;
    }

    this.submitting = true;
    this.error = null;

    const expenseData = this.expenseForm.value;

    if (this.isEditMode && this.expenseId) {
      this.projectService.updateExpense(this.expenseId, expenseData).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/projects/expenses', this.projectId]);
        },
        error: (err) => {
          this.error = `Error al actualizar el gasto: ${err.message}`;
          this.submitting = false;
        },
      });
    } else {
      this.projectService.createExpense(this.projectId, expenseData).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/projects/expenses', this.projectId]);
        },
        error: (err) => {
          this.error = `Error al crear el gasto: ${err.message}`;
          this.submitting = false;
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/projects/expenses', this.projectId]);
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
