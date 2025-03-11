// customer-debt-managment.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomersService } from 'src/app/_services/Customers/customers.service';

@Component({
  selector: 'app-customer-debt-managment',
  templateUrl: './customer-debt-managment.component.html',
  styleUrls: ['./customer-debt-managment.component.css'],
})
export class CustomerDebtManagmentComponent implements OnInit {
  customerId: string = '';
  customer: any = null;
  debtInfo: any = {
    hasDebt: false,
    debtAmount: '0.00',
    oldestDebtDays: 0,
    pendingSales: 0,
  };

  isLoading: boolean = false;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customersService: CustomersService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.customerId = params['id'];
      if (this.customerId) {
        this.loadCustomerDebtInfo();
      } else {
        this.router.navigate(['/clients/list']);
      }
    });
  }

  loadCustomerDebtInfo(): void {
    this.isLoading = true;
    this.customersService.checkCustomerDebt(this.customerId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.customer = response.customer;
          this.debtInfo = response.debtInfo;
        } else {
          this.showAlert('Error al cargar la información de deuda', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar la información: ' + err.message, false);
      },
    });
  }

  // Ir a detalles del cliente
  viewCustomerDetails(): void {
    this.router.navigate(['/clients/details', this.customerId]);
  }

  // Ir a estado financiero del cliente
  viewFinancialSummary(): void {
    this.router.navigate(['/clients/financial-summary', this.customerId]);
  }

  // Volver a la lista de clientes
  goBack(): void {
    this.router.navigate(['/clients/list']);
  }

  // Formatear nombre completo
  getFullName(): string {
    if (!this.customer) return '';
    return `${this.customer.firstName} ${this.customer.lastName}`;
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
