// customer-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomersService } from 'src/app/_services/Customers/customers.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.css'],
})
export class CustomerDetailComponent implements OnInit {
  customerId: string = '';
  customer: any = null;
  customerSales: any[] = [];
  isLoading: boolean = false;
  isLoadingSales: boolean = false;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  // Para gestión de documentos
  documents: any[] = [];
  selectedFile: File | null = null;
  documentDescription: string = '';
  isUploadingDocument: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customersService: CustomersService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.customerId = params['id'];
      if (this.customerId) {
        this.loadCustomerData();
        this.loadCustomerSales();
      } else {
        this.router.navigate(['/clients/list']);
      }
    });
  }

  getDocumentUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${environment.documentsUrl}${
      path.startsWith('/') ? '' : '/'
    }${path}`;
  }

  loadCustomerData(): void {
    this.isLoading = true;
    this.customersService.getCustomerById(this.customerId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.customer = response.customer;
          if (this.customer.documents) {
            this.documents = this.customer.documents;
          }
        } else {
          this.showAlert('Error al cargar los datos del cliente', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar los datos: ' + err.message, false);
      },
    });
  }

  loadCustomerSales(): void {
    this.isLoadingSales = true;
    this.customersService
      .getCustomerSales(this.customerId, { limit: 5 })
      .subscribe({
        next: (response) => {
          this.isLoadingSales = false;
          if (response.success) {
            this.customerSales = response.sales;
          } else {
            this.showAlert('Error al cargar las ventas del cliente', false);
          }
        },
        error: (err) => {
          this.isLoadingSales = false;
          this.showAlert('Error al cargar las ventas: ' + err.message, false);
        },
      });
  }

  // Ir a edición del cliente
  editCustomer(): void {
    this.router.navigate(['/clients/edit', this.customerId]);
  }

  // Ir a detalles financieros del cliente
  viewFinancialSummary(): void {
    this.router.navigate(['/clients/financial-summary', this.customerId]);
  }

  // En CustomerDetailComponent
  viewDebtManagement(): void {
    this.router.navigate(['/clients/debt-management', this.customerId]);
  }

  // Volver a la lista de clientes
  goBack(): void {
    this.router.navigate(['/clients/list']);
  }

  // Seleccionar archivo para subir
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
    }
  }

  // Subir documento
  uploadDocument(): void {
    if (!this.selectedFile || !this.documentDescription.trim()) {
      this.showAlert(
        'Selecciona un archivo y proporciona una descripción',
        false
      );
      return;
    }

    this.isUploadingDocument = true;
    this.customersService
      .addCustomerDocument(
        this.customerId,
        this.selectedFile,
        this.documentDescription
      )
      .subscribe({
        next: (response) => {
          this.isUploadingDocument = false;
          if (response.success) {
            this.showAlert('Documento subido correctamente', true);
            this.selectedFile = null;
            this.documentDescription = '';
            // Recargar datos para mostrar el nuevo documento
            this.loadCustomerData();
          } else {
            this.showAlert('Error al subir el documento', false);
          }
        },
        error: (err) => {
          this.isUploadingDocument = false;
          this.showAlert('Error al subir el documento: ' + err.message, false);
        },
      });
  }

  // Eliminar documento
  deleteDocument(documentId: string): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      return;
    }

    this.customersService
      .deleteCustomerDocument(this.customerId, documentId)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.showAlert('Documento eliminado correctamente', true);
            // Actualizar la lista de documentos
            this.documents = this.documents.filter(
              (doc) => doc.id !== documentId
            );
          } else {
            this.showAlert('Error al eliminar el documento', false);
          }
        },
        error: (err) => {
          this.showAlert(
            'Error al eliminar el documento: ' + err.message,
            false
          );
        },
      });
  }

  // Formatear nombre completo
  getFullName(): string {
    if (!this.customer) return '';
    return `${this.customer.firstName} ${this.customer.lastName}`;
  }

  // Formatear estado de venta
  formatSaleStatus(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'paid':
        return 'Pagada';
      case 'partial':
        return 'Pago Parcial';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  }

  // Obtener clase de estado de venta
  getSaleStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  parseFloat(value: string): number {
    return parseFloat(value) || 0;
  }
}
