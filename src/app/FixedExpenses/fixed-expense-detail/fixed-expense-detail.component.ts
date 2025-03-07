// src/app/fixed-expenses/fixed-expense-detail/fixed-expense-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FixedExpensesService } from 'src/app/_services/FixedExpenses/fixed-expenses.service';
import { UsersService as AuthService } from 'src/app/_services/Users/users.service';

@Component({
  selector: 'app-fixed-expense-detail',
  templateUrl: './fixed-expense-detail.component.html',
  styleUrls: ['./fixed-expense-detail.component.css'],
})
export class FixedExpenseDetailComponent implements OnInit {
  expenseId: string = '';
  expense: any = null;
  isLoading: boolean = false;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  // Para modal de confirmación de eliminación
  showDeleteModal: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fixedExpensesService: FixedExpensesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.expenseId = params['id'];
      if (this.expenseId) {
        this.loadExpenseData();
      } else {
        this.router.navigate(['/fixed-expenses/list']);
      }
    });
  }

  loadExpenseData(): void {
    this.isLoading = true;
    this.fixedExpensesService.getFixedExpenseById(this.expenseId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.expense = response.expense;
        } else {
          this.showAlert('Error al cargar la información del gasto', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error: ' + err.message, false);
      },
    });
  }

  // Formatear período para mostrar
  formatPeriod(period: string): string {
    switch (period) {
      case 'daily':
        return 'Diario';
      case 'weekly':
        return 'Semanal';
      case 'monthly':
        return 'Mensual';
      case 'yearly':
        return 'Anual';
      default:
        return period;
    }
  }

  // Ir a edición
  editExpense(): void {
    this.router.navigate(['/fixed-expenses/edit', this.expenseId]);
  }

  // Regresar a la lista
  goBack(): void {
    this.router.navigate(['/fixed-expenses/list']);
  }

  // Abrir modal de confirmación para eliminar
  confirmDelete(): void {
    this.showDeleteModal = true;
  }

  // Cancelar eliminación
  cancelDelete(): void {
    this.showDeleteModal = false;
  }

  // Eliminar gasto fijo
  deleteExpense(): void {
    this.isLoading = true;
    this.fixedExpensesService.deleteFixedExpense(this.expenseId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showDeleteModal = false;
        if (response.success) {
          this.showAlert('Gasto fijo eliminado correctamente', true);
          setTimeout(() => {
            this.router.navigate(['/fixed-expenses/list']);
          }, 2000);
        } else {
          this.showAlert('Error al eliminar el gasto fijo', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showDeleteModal = false;
        this.showAlert('Error: ' + err.message, false);
      },
    });
  }

  // Verificar si el usuario tiene permiso para editar
  canEdit(): boolean {
    const currentUser = this.authService.getCurrentUserData();
    if (!currentUser) return false;

    // Admin puede editar todo
    if (currentUser.role === 'admin') return true;

    // Usuarios no admin solo pueden editar gastos de su ciudad
    return currentUser.city === this.expense?.city;
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
