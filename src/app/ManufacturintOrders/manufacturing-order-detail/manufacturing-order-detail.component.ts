// manufacturing-order-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ManufacturingOrdersService } from 'src/app/_services/ManufacturingOrders/manufacturing-orders.service';
import { ProductsService } from 'src/app/_services/Products/products.service';
import { SuppliesService } from 'src/app/_services/Supplies/supplies.service';

@Component({
  selector: 'app-manufacturing-order-detail',
  templateUrl: './manufacturing-order-detail.component.html',
  styleUrls: ['./manufacturing-order-detail.component.css'],
})
export class ManufacturingOrderDetailComponent implements OnInit {
  orderId: string = '';
  order: any = null;
  isLoading: boolean = false;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  // Para modal de confirmación de eliminación
  showDeleteModal: boolean = false;

  // Para modal de cambio de estado
  showStatusModal: boolean = false;
  statusForm: FormGroup;
  calculatingExpenses: boolean = false;

  // Para modal de agregar gastos
  showExpensesModal: boolean = false;
  expensesForm: FormGroup;
  supplies: any[] = [];
  selectedSupply: any = null;

  // Para modal de agregar subproductos
  showSubproductsModal: boolean = false;
  subproductsForm: FormGroup;
  products: any[] = [];
  selectedProduct: any = null;

  // Para cálculo de costos
  showCostsModal: boolean = false;
  costsForm: FormGroup;

  // Opciones para el selector de estado
  statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'in_progress', label: 'En Proceso' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' },
  ];

  // Opciones para el tipo de gasto
  expenseTypeOptions = [
    { value: 'supply', label: 'Insumo' },
    { value: 'fixed', label: 'Gasto Fijo' },
    { value: 'variable', label: 'Gasto Variable' },
    { value: 'packaging', label: 'Empaque' },
    { value: 'labor', label: 'Mano de Obra' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private manufacturingOrdersService: ManufacturingOrdersService,
    private productsService: ProductsService,
    private suppliesService: SuppliesService
  ) {
    this.statusForm = this.fb.group({
      status: ['', Validators.required],
      startDate: [''],
      endDate: [''],
    });

    this.expensesForm = this.fb.group({
      type: ['supply', Validators.required],
      name: ['', Validators.required],
      supplyId: [''],
      quantity: ['', [Validators.required, Validators.min(0.01)]],
      unit: [''],
      costPerUnit: [''],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      notes: [''],
    });

    this.subproductsForm = this.fb.group({
      name: ['', Validators.required],
      productId: [''],
      quantity: ['', [Validators.required, Validators.min(0.01)]],
      unit: ['kg', Validators.required],
      costPerUnit: [''],
      notes: [''],
    });

    this.costsForm = this.fb.group({
      sellingPricePerKilo: ['', [Validators.required, Validators.min(0.01)]],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.orderId = params['id'];
      if (this.orderId) {
        this.loadOrderData();
        this.loadSupplies();
        this.loadProducts();
      } else {
        this.router.navigate(['/manufacturing-orders']);
      }
    });

    // Gestión de formularios dinámicos
    this.setupFormListeners();
  }

  setupFormListeners(): void {
    // En el formulario de gastos
    this.expensesForm.get('type')?.valueChanges.subscribe((type) => {
      const nameControl = this.expensesForm.get('name');
      const supplyIdControl = this.expensesForm.get('supplyId');
      const quantityControl = this.expensesForm.get('quantity');
      const unitControl = this.expensesForm.get('unit');
      const costPerUnitControl = this.expensesForm.get('costPerUnit');
      const amountControl = this.expensesForm.get('amount');

      if (type === 'supply') {
        supplyIdControl?.setValidators([Validators.required]);
        quantityControl?.setValidators([
          Validators.required,
          Validators.min(0.01),
        ]);
        nameControl?.clearValidators();
        nameControl?.setValue('');
      } else {
        nameControl?.setValidators([Validators.required]);
        supplyIdControl?.clearValidators();
        supplyIdControl?.setValue('');
        if (type !== 'labor' && type !== 'fixed') {
          quantityControl?.setValidators([
            Validators.required,
            Validators.min(0.01),
          ]);
        } else {
          quantityControl?.clearValidators();
          quantityControl?.setValue('');
          unitControl?.setValue('');
          costPerUnitControl?.setValue('');
        }
      }

      nameControl?.updateValueAndValidity();
      supplyIdControl?.updateValueAndValidity();
      quantityControl?.updateValueAndValidity();
    });

    // Cuando se selecciona un insumo
    this.expensesForm.get('supplyId')?.valueChanges.subscribe((supplyId) => {
      if (supplyId) {
        const supply = this.supplies.find((s) => s.id === supplyId);
        if (supply) {
          this.selectedSupply = supply;
          this.expensesForm.patchValue({
            name: supply.name,
            unit: supply.unit,
            costPerUnit: supply.costPerUnit,
          });
        }
      } else {
        this.selectedSupply = null;
      }
    });

    // Calcular automáticamente el amount o costPerUnit
    this.expensesForm.get('quantity')?.valueChanges.subscribe((quantity) => {
      const costPerUnit = this.expensesForm.get('costPerUnit')?.value;
      if (quantity && costPerUnit) {
        const amount = quantity * costPerUnit;
        this.expensesForm.get('amount')?.setValue(amount.toFixed(2));
      }
    });

    this.expensesForm
      .get('costPerUnit')
      ?.valueChanges.subscribe((costPerUnit) => {
        const quantity = this.expensesForm.get('quantity')?.value;
        if (quantity && costPerUnit) {
          const amount = quantity * costPerUnit;
          this.expensesForm.get('amount')?.setValue(amount.toFixed(2));
        }
      });

    this.expensesForm.get('amount')?.valueChanges.subscribe((amount) => {
      const quantity = this.expensesForm.get('quantity')?.value;
      if (quantity && amount && !this.expensesForm.get('costPerUnit')?.dirty) {
        const costPerUnit = amount / quantity;
        this.expensesForm.get('costPerUnit')?.setValue(costPerUnit.toFixed(2));
      }
    });

    // Para subproductos
    this.subproductsForm
      .get('productId')
      ?.valueChanges.subscribe((productId) => {
        if (productId) {
          const product = this.products.find((p) => p.id === productId);
          if (product) {
            this.selectedProduct = product;
            this.subproductsForm.patchValue({
              name: product.name,
              costPerUnit: product.pricePerKilo,
            });
          }
        } else {
          this.selectedProduct = null;
        }
      });
  }

  loadOrderData(): void {
    this.isLoading = true;
    this.manufacturingOrdersService
      .getManufacturingOrderById(this.orderId)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.order = response.order;

            // Inicializar el formulario de estado con los valores actuales
            this.statusForm.patchValue({
              status: this.order.status,
              startDate: this.formatDateForInput(this.order.startDate),
              endDate: this.formatDateForInput(this.order.endDate),
            });

            // Si hay un precio de venta, inicializar el formulario de costos
            if (this.order.sellingPricePerKilo) {
              this.costsForm.patchValue({
                sellingPricePerKilo: this.order.sellingPricePerKilo,
              });
            } else if (this.order.product?.pricePerKilo) {
              // Si no hay precio de venta pero el producto tiene uno
              this.costsForm.patchValue({
                sellingPricePerKilo: this.order.product.pricePerKilo,
              });
            }
          } else {
            this.showAlert('Error al cargar los detalles de la orden', false);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.showAlert('Error al cargar los detalles: ' + err.message, false);
        },
      });
  }

  loadSupplies(): void {
    this.suppliesService.getSupplies({ active: true }).subscribe({
      next: (response) => {
        if (response.success) {
          this.supplies = response.supplies;
        }
      },
    });
  }

  loadProducts(): void {
    this.productsService.getProducts({ active: true }).subscribe({
      next: (response) => {
        if (response.success) {
          this.products = response.products;
        }
      },
    });
  }

  // Formatear fecha para input datetime-local
  formatDateForInput(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 16);
  }

  // Regresar a la lista
  goBack(): void {
    this.router.navigate(['/manufacturing-orders']);
  }

  // Abrir modal de confirmación para eliminar
  confirmDelete(): void {
    this.showDeleteModal = true;
  }

  // Cancelar eliminación
  cancelDelete(): void {
    this.showDeleteModal = false;
  }

  // Eliminar orden
  deleteOrder(): void {
    this.isLoading = true;
    this.manufacturingOrdersService
      .deleteManufacturingOrder(this.orderId)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showDeleteModal = false;
          if (response.success) {
            this.showAlert('Orden eliminada correctamente', true);
            setTimeout(() => {
              this.router.navigate(['/manufacturing-orders']);
            }, 2000);
          } else {
            this.showAlert('Error al eliminar la orden', false);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.showDeleteModal = false;
          this.showAlert('Error al eliminar la orden: ' + err.message, false);
        },
      });
  }

  // Abrir modal para cambiar estado
  openStatusModal(): void {
    // Asegurarse de que el formulario tenga los valores actuales
    this.statusForm.patchValue({
      status: this.order.status,
      startDate: this.formatDateForInput(this.order.startDate),
      endDate: this.formatDateForInput(this.order.endDate),
    });

    this.showStatusModal = true;
  }

  // Cerrar modal de estado
  cancelStatusChange(): void {
    this.showStatusModal = false;
  }

  // Guardar cambio de estado
  updateStatus(): void {
    if (this.statusForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formData = this.statusForm.value;

    this.manufacturingOrdersService
      .updateOrderStatus(this.orderId, formData)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showStatusModal = false;
          if (response.success) {
            this.showAlert('Estado actualizado correctamente', true);
            this.loadOrderData(); // Recargar datos
          } else {
            this.showAlert('Error al actualizar el estado', false);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.showStatusModal = false;
          this.showAlert(
            'Error al actualizar el estado: ' + err.message,
            false
          );
        },
      });
  }

  // Abrir modal para agregar gastos
  openExpensesModal(): void {
    this.expensesForm.reset({
      type: 'supply',
      quantity: '',
      name: '',
      amount: '',
      unit: '',
      costPerUnit: '',
      notes: '',
    });
    this.showExpensesModal = true;
  }

  // Cerrar modal de gastos
  cancelExpenses(): void {
    this.showExpensesModal = false;
  }

  // Agregar gastos
  addExpenses(): void {
    if (this.expensesForm.invalid) {
      return;
    }

    const formData = this.expensesForm.value;
    const expense: any = {
      type: formData.type,
      name: formData.name,
      amount: parseFloat(formData.amount),
    };

    // Agregar campos adicionales según el tipo
    if (formData.type === 'supply') {
      expense.supplyId = formData.supplyId;
      expense.quantity = parseFloat(formData.quantity);
    } else if (formData.type !== 'labor' && formData.type !== 'fixed') {
      // Para gastos variables y empaque
      expense.quantity = parseFloat(formData.quantity);
      expense.unit = formData.unit;
      expense.costPerUnit = parseFloat(formData.costPerUnit);
    }

    if (formData.notes) {
      expense.notes = formData.notes;
    }

    this.isLoading = true;
    this.manufacturingOrdersService
      .addOrderExpenses(this.orderId, [expense])
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showExpensesModal = false;
          if (response.success) {
            this.showAlert('Gasto agregado correctamente', true);
            this.loadOrderData(); // Recargar datos
          } else {
            this.showAlert('Error al agregar gasto', false);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.showExpensesModal = false;
          this.showAlert('Error al agregar gasto: ' + err.message, false);
        },
      });
  }

  // Abrir modal para agregar subproductos
  openSubproductsModal(): void {
    this.subproductsForm.reset({
      name: '',
      productId: '',
      quantity: '',
      unit: 'kg',
      costPerUnit: '',
      notes: '',
    });
    this.showSubproductsModal = true;
  }

  // Cerrar modal de subproductos
  cancelSubproducts(): void {
    this.showSubproductsModal = false;
  }

  // Agregar subproductos
  addSubproducts(): void {
    if (this.subproductsForm.invalid) {
      return;
    }

    const formData = this.subproductsForm.value;
    const subproduct: any = {
      name: formData.name,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
    };

    if (formData.productId) {
      subproduct.productId = formData.productId;
    }

    if (formData.costPerUnit) {
      subproduct.costPerUnit = parseFloat(formData.costPerUnit);
    }

    if (formData.notes) {
      subproduct.notes = formData.notes;
    }

    this.isLoading = true;
    this.manufacturingOrdersService
      .addOrderSubproducts(this.orderId, [subproduct])
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showSubproductsModal = false;
          if (response.success) {
            this.showAlert('Subproducto agregado correctamente', true);
            this.loadOrderData(); // Recargar datos
          } else {
            this.showAlert('Error al agregar subproducto', false);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.showSubproductsModal = false;
          this.showAlert('Error al agregar subproducto: ' + err.message, false);
        },
      });
  }

  // Abrir modal para calcular costos
  openCostsModal(): void {
    // Si ya hay un precio de venta, usarlo
    if (this.order.sellingPricePerKilo) {
      this.costsForm.patchValue({
        sellingPricePerKilo: this.order.sellingPricePerKilo,
      });
    } else if (this.order.product?.pricePerKilo) {
      // Si no hay precio de venta pero el producto tiene uno
      this.costsForm.patchValue({
        sellingPricePerKilo: this.order.product.pricePerKilo,
      });
    } else {
      this.costsForm.reset();
    }
    this.showCostsModal = true;
  }

  // Cerrar modal de costos
  cancelCosts(): void {
    this.showCostsModal = false;
  }

  // Calcular costos
  calculateCosts(): void {
    if (this.costsForm.invalid) {
      return;
    }

    this.isLoading = true;
    const calculationData = this.costsForm.value;

    this.manufacturingOrdersService
      .calculateOrderCosts(this.orderId, calculationData)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showCostsModal = false;
          if (response.success) {
            this.showAlert('Costos calculados correctamente', true);
            this.loadOrderData(); // Recargar datos
          } else {
            this.showAlert('Error al calcular los costos', false);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.showCostsModal = false;
          this.showAlert('Error al calcular los costos: ' + err.message, false);
        },
      });
  }

  // Formatear estado para mostrar
  formatStatus(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'in_progress':
        return 'En proceso';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  }

  // Obtener clase de estado
  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Formatear tipo de gasto
  formatExpenseType(type: string): string {
    switch (type) {
      case 'supply':
        return 'Insumo';
      case 'fixed':
        return 'Gasto Fijo';
      case 'variable':
        return 'Gasto Variable';
      case 'packaging':
        return 'Empaque';
      case 'labor':
        return 'Mano de Obra';
      default:
        return type;
    }
  }

  // Formatear estado de cálculo
  formatCalculationStatus(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pendiente de cálculo';
      case 'calculated':
        return 'Calculado';
      default:
        return status;
    }
  }

  calculateTotalExpenses(): number {
    if (!this.order?.expenses || this.order.expenses.length === 0) {
      return 0;
    }
    return this.order.expenses
      .map((expense: any) => parseFloat(expense.amount) || 0)
      .reduce((acc: number, val: number) => acc + val, 0);
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
