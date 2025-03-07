// src/app/fixed-expenses/fixed-expense-list/fixed-expense-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FixedExpensesService } from 'src/app/_services/FixedExpenses/fixed-expenses.service';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/_services/Users/users.service';

@Component({
  selector: 'app-fixed-expense-list',
  templateUrl: './fixed-expense-list.component.html',
  styleUrls: ['./fixed-expense-list.component.css'],
})
export class FixedExpenseListComponent implements OnInit {
  expenses: any[] = [];
  isLoading: boolean = false;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  // Filtros y paginación
  filters: any = {
    page: 1,
    limit: 10,
    search: '',
    period: '',
    city: '',
    active: true,
  };

  totalItems: number = 0;
  totalPages: number = 0;

  // Opciones para el selector de período
  periodOptions = [
    { value: '', label: 'Todos los períodos' },
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'yearly', label: 'Anual' },
  ];

  constructor(
    private fixedExpensesService: FixedExpensesService,
    private router: Router,
    private authService: UsersService
  ) {}

  ngOnInit(): void {
    // Obtener ciudad del usuario si no es admin
    const currentUser = this.authService.getCurrentUserData();
    if (currentUser && currentUser.role !== 'admin') {
      this.filters.city = currentUser.city;
    }

    this.loadExpenses();
  }

  loadExpenses(): void {
    this.isLoading = true;
    this.fixedExpensesService.getFixedExpenses(this.filters).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.expenses = response.expenses;
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
        } else {
          this.showAlert('Error al cargar los gastos fijos', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error: ' + err.message, false);
      },
    });
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.loadExpenses();
  }

  onSearch(): void {
    this.filters.page = 1; // Resetear a primera página
    this.loadExpenses();
  }

  clearSearch(): void {
    this.filters.search = '';
    this.onSearch();
  }

  onPeriodChange(): void {
    this.filters.page = 1;
    this.loadExpenses();
  }

  createExpense(): void {
    this.router.navigate(['/fixed-expenses/new']);
  }

  viewExpense(id: string): void {
    this.router.navigate(['/fixed-expenses/details', id]);
  }

  editExpense(id: string): void {
    this.router.navigate(['/fixed-expenses/edit', id]);
  }

  // Formatear período para mostrar
  formatPeriod(period: string): string {
    const option = this.periodOptions.find((opt) => opt.value === period);
    return option ? option.label : period;
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
