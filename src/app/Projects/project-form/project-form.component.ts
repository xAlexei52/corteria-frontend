// src/app/modules/projects/pages/project-form/project-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from 'src/app/_services/Projects/project.service';

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.css'],
})
export class ProjectFormComponent implements OnInit {
  projectForm: FormGroup;
  projectId: string | null = null;
  isEditMode = false;
  loading = false;
  submitting = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      location: [''],
      startDate: [new Date().toISOString().split('T')[0]],
      estimatedEndDate: [''],
    });
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.projectId;

    if (this.isEditMode && this.projectId) {
      this.loadProject(this.projectId);
    }
  }

  loadProject(id: string): void {
    this.loading = true;
    this.error = null;

    this.projectService.getProjectById(id).subscribe({
      next: (project) => {
        // Formatear fechas para el formulario HTML
        if (project.startDate) {
          project.startDate = new Date(project.startDate)
            .toISOString()
            .split('T')[0];
        }
        if (project.estimatedEndDate) {
          project.estimatedEndDate = new Date(project.estimatedEndDate)
            .toISOString()
            .split('T')[0];
        }
        if (project.endDate) {
          project.endDate = new Date(project.endDate)
            .toISOString()
            .split('T')[0];
        }

        this.projectForm.patchValue(project);
        this.loading = false;
      },
      error: (err) => {
        this.error = `Error al cargar el proyecto: ${err.message}`;
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.markFormGroupTouched(this.projectForm);
      return;
    }

    this.submitting = true;
    this.error = null;

    const projectData = this.projectForm.value;

    if (this.isEditMode && this.projectId) {
      this.projectService.updateProject(this.projectId, projectData).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/projects/details', this.projectId]);
        },
        error: (err) => {
          this.error = `Error al actualizar el proyecto: ${err.message}`;
          this.submitting = false;
        },
      });
    } else {
      this.projectService.createProject(projectData).subscribe({
        next: (newProject) => {
          this.submitting = false;
          this.router.navigate(['/projects/details', newProject.id]);
        },
        error: (err) => {
          this.error = `Error al crear el proyecto: ${err.message}`;
          this.submitting = false;
        },
      });
    }
  }

  onCancel(): void {
    if (this.isEditMode && this.projectId) {
      this.router.navigate(['/projects/details', this.projectId]);
    } else {
      this.router.navigate(['/projects/list']);
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
