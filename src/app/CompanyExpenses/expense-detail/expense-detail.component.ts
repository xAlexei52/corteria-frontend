// src/app/CompanyExpenses/expense-detail/expense-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyExpensesService } from 'src/app/_services/CompanyExpenses/company-expenses.service';
import { AuthService } from 'src/app/_services/AuthService/authservice.service';

@Component({
  selector: 'app-expense-detail',
  templateUrl: './expense-detail.component.html',
  styleUrls: ['./expense-detail.component.css'],
})
export class ExpenseDetailComponent implements OnInit {
  expenseId: string = '';
  expense: any = null;
  isLoading: boolean = false;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  // Categorías para traducción
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
    private route: ActivatedRoute,
    private router: Router,
    private companyExpensesService: CompanyExpensesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.expenseId = params['id'];
      if (this.expenseId) {
        this.loadExpenseData();
      } else {
        this.router.navigate(['/company-expenses/list']);
      }
    });
  }

  loadExpenseData(): void {
    this.isLoading = true;
    this.companyExpensesService.getExpenseById(this.expenseId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.expense = response.expense;
        } else {
          this.showAlert('Error al cargar los datos del gasto', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar los datos: ' + err.message, false);
        // Si hay error de permisos, regresar a la lista
        if (
          err.message.includes('403') ||
          err.message.includes('No tienes permiso')
        ) {
          setTimeout(() => {
            this.router.navigate(['/company-expenses/list']);
          }, 2000);
        }
      },
    });
  }

  // Ir a editar el gasto
  editExpense(): void {
    this.router.navigate(['/company-expenses/edit', this.expenseId]);
  }

  // Eliminar gasto
  deleteExpense(): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      return;
    }

    this.companyExpensesService.deleteExpense(this.expenseId).subscribe({
      next: (response) => {
        if (response.success) {
          this.showAlert('Gasto eliminado correctamente', true);
          setTimeout(() => {
            this.router.navigate(['/company-expenses/list']);
          }, 2000);
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
  downloadFile(): void {
    if (!this.expense?.fileName) {
      this.showAlert('Este gasto no tiene archivo adjunto', false);
      return;
    }

    this.companyExpensesService.downloadFile(this.expenseId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.expense.fileName;
        link.click();
        window.URL.revokeObjectURL(url);
        this.showAlert('Archivo descargado correctamente', true);
      },
      error: (err) => {
        this.showAlert('Error al descargar el archivo: ' + err.message, false);
      },
    });
  }

  // Volver a la lista de gastos
  goBack(): void {
    this.router.navigate(['/company-expenses/list']);
  }

  // Formatear categoría
  formatCategory(category: string): string {
    const categoryObj = this.categories.find((cat) => cat.value === category);
    return categoryObj ? categoryObj.label : category;
  }

  // Formatear fecha
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Formatear fecha y hora
  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Verificar si el usuario puede eliminar gastos
  canDelete(): boolean {
    return this.authService.isAdmin();
  }

  // Verificar si el usuario puede editar este gasto
  canEdit(): boolean {
    if (this.authService.isAdmin()) {
      return true;
    }

    // Los usuarios pueden editar gastos de su propia ciudad
    const userCity = this.authService.getUserCity();
    return this.expense?.cityId === userCity;
  }

  // Verificar si se debe mostrar información de ciudad
  shouldShowCity(): boolean {
    return this.authService.isAdmin() || this.authService.isManager();
  }

  // Obtener clase de color para la categoría
  getCategoryClass(category: string): string {
    const colorMap: { [key: string]: string } = {
      utilities: 'bg-blue-100 text-blue-800',
      rent: 'bg-purple-100 text-purple-800',
      salaries: 'bg-green-100 text-green-800',
      supplies: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-orange-100 text-orange-800',
      taxes: 'bg-red-100 text-red-800',
      insurance: 'bg-indigo-100 text-indigo-800',
      advertising: 'bg-pink-100 text-pink-800',
      travel: 'bg-teal-100 text-teal-800',
      other: 'bg-gray-100 text-gray-800',
    };

    return colorMap[category] || 'bg-gray-100 text-gray-800';
  }

  // Obtener icono para el tipo de archivo
  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) {
      return '📄'; // PDF
    } else if (fileType.includes('image')) {
      return '🖼️'; // Imagen
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return '📝'; // Word
    }
    return '📎'; // Genérico
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
