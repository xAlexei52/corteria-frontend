// src/app/CompanyExpenses/expense-statistics/expense-statistics.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CompanyExpensesService } from 'src/app/_services/CompanyExpenses/company-expenses.service';
import { CityService } from 'src/app/_services/Cities/city.service';
import { AuthService } from 'src/app/_services/AuthService/authservice.service';

@Component({
  selector: 'app-expense-statistics',
  templateUrl: './expense-statistics.component.html',
  styleUrls: ['./expense-statistics.component.css'],
})
export class ExpenseStatisticsComponent implements OnInit {
  statistics: any = null;
  cities: any[] = [];
  isLoading: boolean = false;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  filterForm: FormGroup;

  // Categorías para traducción y colores
  categories = [
    { value: 'utilities', label: 'Servicios Públicos', color: 'bg-blue-500' },
    { value: 'rent', label: 'Alquiler', color: 'bg-purple-500' },
    { value: 'salaries', label: 'Salarios', color: 'bg-green-500' },
    { value: 'supplies', label: 'Suministros', color: 'bg-yellow-500' },
    { value: 'maintenance', label: 'Mantenimiento', color: 'bg-orange-500' },
    { value: 'taxes', label: 'Impuestos', color: 'bg-red-500' },
    { value: 'insurance', label: 'Seguros', color: 'bg-indigo-500' },
    { value: 'advertising', label: 'Publicidad', color: 'bg-pink-500' },
    { value: 'travel', label: 'Viajes', color: 'bg-teal-500' },
    { value: 'other', label: 'Otros', color: 'bg-gray-500' },
  ];

  constructor(
    private companyExpensesService: CompanyExpensesService,
    private cityService: CityService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    // Configurar filtros por defecto: últimos 3 meses
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);

    this.filterForm = this.fb.group({
      startDate: [startDate.toISOString().split('T')[0]],
      endDate: [endDate.toISOString().split('T')[0]],
      cityId: [''],
    });
  }

  ngOnInit(): void {
    this.loadCities();
    this.setDefaultCity();
    this.loadStatistics();
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

  setDefaultCity(): void {
    // Si no es admin, establecer la ciudad del usuario
    if (!this.authService.isAdmin()) {
      const userCity = this.authService.getUserCity();
      if (userCity) {
        this.filterForm.patchValue({ cityId: userCity });
      }
    }
  }

  loadStatistics(): void {
    this.isLoading = true;

    const filters = {
      ...this.filterForm.value,
    };

    // Eliminar propiedades vacías
    Object.keys(filters).forEach((key) => {
      if (filters[key] === '' || filters[key] === null) {
        delete filters[key];
      }
    });

    this.companyExpensesService.getStatistics(filters).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.statistics = response.statistics;
        } else {
          this.showAlert('Error al cargar las estadísticas', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert(
          'Error al cargar las estadísticas: ' + err.message,
          false
        );
      },
    });
  }

  // Aplicar filtros
  applyFilters(): void {
    this.loadStatistics();
  }

  // Resetear filtros
  resetFilters(): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);

    this.filterForm.reset({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      cityId: this.authService.isAdmin() ? '' : this.authService.getUserCity(),
    });
    this.loadStatistics();
  }

  // Navegar a la lista de gastos
  goToExpenseList(): void {
    this.router.navigate(['/company-expenses/list']);
  }

  // Navegar a crear nuevo gasto
  createNewExpense(): void {
    this.router.navigate(['/company-expenses/new']);
  }

  // Formatear categoría
  formatCategory(category: string): string {
    const categoryObj = this.categories.find((cat) => cat.value === category);
    return categoryObj ? categoryObj.label : category;
  }

  // Obtener color de categoría
  getCategoryColor(category: string): string {
    const categoryObj = this.categories.find((cat) => cat.value === category);
    return categoryObj ? categoryObj.color : 'bg-gray-500';
  }

  // Calcular porcentaje para las barras de categorías
  getCategoryPercentage(amount: number): number {
    if (!this.statistics?.total?.amount || this.statistics.total.amount === 0) {
      return 0;
    }
    return (amount / this.statistics.total.amount) * 100;
  }

  // Formatear mes para mostrar
  formatMonth(monthString: string): string {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
    });
  }

  // Obtener el máximo valor de los meses para normalizar las barras
  getMaxMonthAmount(): number {
    if (!this.statistics?.byMonth) return 0;
    return Math.max(
      ...this.statistics.byMonth.map((month: any) => month.amount)
    );
  }

  // Calcular porcentaje para barras de meses
  getMonthPercentage(amount: number): number {
    const max = this.getMaxMonthAmount();
    if (max === 0) return 0;
    return (amount / max) * 100;
  }

  // Formatear números grandes
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(0);
  }

  // Verificar si el usuario puede ver gastos de todas las ciudades
  canViewAllCities(): boolean {
    return this.authService.isAdmin();
  }

  // Obtener el rango de fechas seleccionado
  getDateRange(): string {
    const startDate = new Date(
      this.filterForm.get('startDate')?.value
    ).toLocaleDateString('es-ES');
    const endDate = new Date(
      this.filterForm.get('endDate')?.value
    ).toLocaleDateString('es-ES');
    return `${startDate} - ${endDate}`;
  }

  // Convertir string a número
  parseFloat(value: string | number): number {
    return parseFloat(value.toString()) || 0;
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
