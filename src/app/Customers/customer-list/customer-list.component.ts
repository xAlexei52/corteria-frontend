// customer-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomersService } from 'src/app/_services/Customers/customers.service';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css'],
})
export class CustomerListComponent implements OnInit {
  customers: any[] = [];
  isLoading: boolean = false;
  totalItems: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  filterForm: FormGroup;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  constructor(
    private customersService: CustomersService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      city: [''],
      hasDebt: [''],
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
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

    this.customersService.getCustomers(filters).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.customers = response.customers;
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
          this.currentPage = response.pagination.currentPage;
          this.itemsPerPage = response.pagination.limit;
        } else {
          this.showAlert('Error al cargar los clientes', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar los clientes: ' + err.message, false);
      },
    });
  }

  // Cambiar de página
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadCustomers();
  }

  // Aplicar filtros
  applyFilters(): void {
    this.currentPage = 1; // Resetear a la primera página
    this.loadCustomers();
  }

  // Resetear filtros
  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      city: '',
      hasDebt: '',
    });
    this.currentPage = 1;
    this.loadCustomers();
  }

  // Navegar a la página de detalle del cliente
  viewCustomerDetails(id: string): void {
    this.router.navigate([`/clients/details/${id}`]);
  }

  // Navegar a la página de edición del cliente
  editCustomer(id: string): void {
    this.router.navigate([`/clients/edit/${id}`]);
  }

  // Navegar a la página de estado financiero del cliente
  viewFinancialSummary(id: string): void {
    this.router.navigate([`/clients/financial-summary/${id}`]);
  }

  // Navegar a la página de gestión de deudas del cliente
  viewDebtManagement(id: string): void {
    this.router.navigate([`/clients/debt-management/${id}`]);
  }

  // Crear nuevo cliente
  createNewCustomer(): void {
    this.router.navigate(['/clients/new']);
  }

  // Formatear nombre completo
  getFullName(customer: any): string {
    return `${customer.firstName} ${customer.lastName}`;
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

  parseFloat(value: string): number {
    return parseFloat(value) || 0;
  }
}
