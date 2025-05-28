// src/app/CompanyExpenses/expense-list/expense-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CompanyExpensesService } from 'src/app/_services/CompanyExpenses/company-expenses.service';
import { CityService } from 'src/app/_services/Cities/city.service';
import { AuthService } from 'src/app/_services/AuthService/authservice.service';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.css'],
})
export class ExpenseListComponent implements OnInit {
  expenses: any[] = [];
  cities: any[] = [];
  isLoading: boolean = false;
  totalItems: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  filterForm: FormGroup;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  // Categorías disponibles
  categories = [
    { value: 'utilities', label: 'Servicios Públicos' },
    { value: 'rent', label: 'Alquiler' },
    { value: 'salaries', label: 'Salarios' },
    { value: 'supplies', label: 'Suministros' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'taxes', label: 'Impuestos' },
    { value: 'insurance', label: 'Seguros' },
    { value: 'advertising', label: 'Publicidad' },
    { value: 'travel', label: 'Viajes' },
    { value: 'other', label: 'Otros' },
  ];

  constructor(
    private companyExpensesService: CompanyExpensesService,
    private cityService: CityService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      category: [''],
      cityId: [''],
      startDate: [''],
      endDate: [''],
      isBillable: [''], // NUEVO FILTRO AGREGADO
    });
  }

  ngOnInit(): void {
    this.loadCities();
    this.loadExpenses();
  }

  loadCities(): void {
    this.cityService.getCities().subscribe({
      next: (response) => {
        if (response.success) {
          this.cities = response.cities;
        }
      },
      error: (err) => {
        console.error('Error loading cities:', err);
      },
    });
  }

  loadExpenses(): void {
    this.isLoading = true;

    const filters = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      ...this.filterForm.value,
    };

    // Eliminar propiedades vacías
    Object.keys(filters).forEach((key) => {
      if (filters[key] === '' || filters[key] === null) {
        delete filters[key];
      }
    });

    this.companyExpensesService.getExpenses(filters).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.expenses = response.expenses;
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
          this.currentPage = response.pagination.currentPage;
          this.itemsPerPage = response.pagination.limit;
        } else {
          this.showAlert('Error al cargar los gastos', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar los gastos: ' + err.message, false);
      },
    });
  }

  // Cambiar de página
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadExpenses();
  }

  // Aplicar filtros
  applyFilters(): void {
    this.currentPage = 1; // Resetear a la primera página
    this.loadExpenses();
  }

  // Resetear filtros
  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      category: '',
      cityId: '',
      startDate: '',
      endDate: '',
      isBillable: '', // NUEVO CAMPO
    });
    this.currentPage = 1;
    this.loadExpenses();
  }

  // Navegar a la página de detalle del gasto
  viewExpenseDetails(id: string): void {
    this.router.navigate([`/company-expenses/details/${id}`]);
  }

  // Navegar a la página de edición del gasto
  editExpense(id: string): void {
    this.router.navigate([`/company-expenses/edit/${id}`]);
  }

  // Eliminar gasto
  deleteExpense(id: string): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      return;
    }

    this.companyExpensesService.deleteExpense(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.showAlert('Gasto eliminado correctamente', true);
          this.loadExpenses();
        } else {
          this.showAlert('Error al eliminar el gasto', false);
        }
      },
      error: (err) => {
        this.showAlert('Error al eliminar el gasto: ' + err.message, false);
      },
    });
  }

  // Descargar archivo adjunto
  downloadFile(expense: any): void {
    if (!expense.fileName) {
      this.showAlert('Este gasto no tiene archivo adjunto', false);
      return;
    }

    this.companyExpensesService.downloadFile(expense.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = expense.fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.showAlert('Error al descargar el archivo: ' + err.message, false);
      },
    });
  }

  // Crear nuevo gasto
  createNewExpense(): void {
    this.router.navigate(['/company-expenses/new']);
  }

  // Ver estadísticas
  viewStatistics(): void {
    this.router.navigate(['/company-expenses/statistics']);
  }

  // Formatear categoría
  formatCategory(category: string): string {
    const categoryObj = this.categories.find((cat) => cat.value === category);
    return categoryObj ? categoryObj.label : category;
  }

  // Formatear fecha
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  // Verificar si el usuario puede eliminar gastos
  canDelete(): boolean {
    return this.authService.isAdmin();
  }

  // Verificar si el usuario puede ver gastos de todas las ciudades
  canViewAllCities(): boolean {
    return this.authService.isAdmin();
  }

  // Convertir string a número
  parseFloat(value: string): number {
    return parseFloat(value) || 0;
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
