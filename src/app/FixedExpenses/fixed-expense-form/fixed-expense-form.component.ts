// src/app/fixed-expenses/fixed-expense-form/fixed-expense-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FixedExpensesService } from 'src/app/_services/FixedExpenses/fixed-expenses.service';
import { UsersService as AuthService } from 'src/app/_services/Users/users.service';

@Component({
  selector: 'app-fixed-expense-form',
  templateUrl: './fixed-expense-form.component.html',
  styleUrls: ['./fixed-expense-form.component.css'],
})
export class FixedExpenseFormComponent implements OnInit {
  expenseForm: FormGroup;
  isLoading: boolean = false;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;
  isEditMode: boolean = false;
  expenseId: string = '';

  // Opciones para el selector de período
  periodOptions = [
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'yearly', label: 'Anual' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private fixedExpensesService: FixedExpensesService,
    private authService: AuthService
  ) {
    this.expenseForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      amount: ['', [Validators.required, Validators.min(0)]],
      city: ['', [Validators.required]],
      period: ['monthly', [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Determinar si estamos en modo de edición
    this.route.params.subscribe((params) => {
      this.expenseId = params['id'];
      if (this.expenseId) {
        this.isEditMode = true;
        this.loadExpenseData();
      } else {
        // Si es un usuario no admin, precargar su ciudad
        const currentUser = this.authService.getCurrentUserData();
        if (currentUser && currentUser.role !== 'admin') {
          this.expenseForm.get('city')?.setValue(currentUser.city);
          this.expenseForm.get('city')?.disable(); // No permitir cambiar ciudad
        }
      }
    });
  }

  loadExpenseData(): void {
    this.isLoading = true;
    this.fixedExpensesService.getFixedExpenseById(this.expenseId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          // Precargar datos del formulario
          this.expenseForm.patchValue({
            name: response.expense.name,
            description: response.expense.description,
            amount: response.expense.amount,
            city: response.expense.city,
            period: response.expense.period,
          });

          const currentUser = this.authService.getCurrentUserData();
          if (currentUser && currentUser.role !== 'admin') {
            this.expenseForm.get('city')?.disable();
          }
        } else {
          this.showAlert('Error al cargar los datos del gasto fijo', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error: ' + err.message, false);
      },
    });
  }

  onSubmit(): void {
    if (this.expenseForm.invalid) {
      this.markFormGroupTouched(this.expenseForm);
      return;
    }

    this.isLoading = true;

    // Preparar datos a enviar
    const formData = { ...this.expenseForm.value };

    // Si el campo city está deshabilitado, asegurarse de incluirlo
    if (this.expenseForm.get('city')?.disabled) {
      formData.city = this.expenseForm.get('city')?.value;
    }

    if (this.isEditMode) {
      // Actualizar gasto existente
      this.fixedExpensesService
        .updateFixedExpense(this.expenseId, formData)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.success) {
              this.showAlert('Gasto fijo actualizado correctamente', true);
              setTimeout(() => {
                this.router.navigate([
                  '/fixed-expenses/details',
                  this.expenseId,
                ]);
              }, 2000);
            } else {
              this.showAlert('Error al actualizar el gasto fijo', false);
            }
          },
          error: (err) => {
            this.isLoading = false;
            this.showAlert('Error: ' + err.message, false);
          },
        });
    } else {
      // Crear nuevo gasto
      this.fixedExpensesService.createFixedExpense(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.showAlert('Gasto fijo creado correctamente', true);
            setTimeout(() => {
              this.router.navigate(['/fixed-expenses/list']);
            }, 2000);
          } else {
            this.showAlert('Error al crear el gasto fijo', false);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.showAlert('Error: ' + err.message, false);
        },
      });
    }
  }

  // Marcar todos los campos como tocados para mostrar validaciones
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Navegar de vuelta a la lista
  cancel(): void {
    if (this.isEditMode) {
      this.router.navigate(['/fixed-expenses/details', this.expenseId]);
    } else {
      this.router.navigate(['/fixed-expenses/list']);
    }
  }

  // Mostrar alerta
  private showAlert(message: string, isSuccess: boolean): void {
    this.alertMessage = message;
    this.isSuccess = isSuccess;
    this.isClosing = false;

    setTimeout(() => {
      this.isClosing = true;
      setTimeout(() => {
        this.alertMessage = '';
        this.isClosing = false;
      }, 300);
    }, 5000);
  }
}
