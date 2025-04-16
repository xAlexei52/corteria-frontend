import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SalesService } from 'src/app/_services/Sales/sales.service';
import { CustomersService } from 'src/app/_services/Customers/customers.service';
import { ProductsService } from 'src/app/_services/Products/products.service';
import { WarehousesService } from 'src/app/_services/Warehouses/warehouses.service';
import { InventoryService } from 'src/app/_services/Inventory/inventory.service';

@Component({
  selector: 'app-sale-form',
  templateUrl: './sale-form.component.html',
  styleUrls: ['./sale-form.component.css'],
})
export class SaleFormComponent implements OnInit {
  inventory: { itemId: string, quantity: string }[] = [];
  saleForm!: FormGroup;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  saleId: string = '';

  customers: any[] = [];
  products: any[] = [];
  warehouses: any[] = [];
  isLoadingCustomers: boolean = false;
  isLoadingProducts: boolean = false;
  isLoadingWarehouses: boolean = false;

  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  entries: any[] = [];
  helper = 0;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private salesService: SalesService,
    private customersService: CustomersService,
    private productsService: ProductsService,
    private warehousesService: WarehousesService,
    private inventoryService: InventoryService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadCustomers();
    this.loadProducts();
    this.loadWarehouses();
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.saleId = params['id'];
        this.isEditMode = true;
        this.loadSaleData();
      }
    });
    this.inventoryService.getInventory().subscribe(data => {
      this.inventory = data;
    });
  }

  createForm(): void {
    this.saleForm = this.fb.group({
      customerId: ['', Validators.required],
      date: [new Date().toISOString().substring(0, 16), Validators.required],
      notes: [''],
      products: this.fb.array([]),
    });
  }

  get productsArray(): FormArray {
    return this.saleForm.get('products') as FormArray;
  }

  addProduct(): void {
    const productGroup = this.fb.group({
      productId: ['', Validators.required],
      warehouseId: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]],
      boxes: [0, [Validators.required, Validators.min(1)]],
      subtotal: [{ value: 0, disabled: true }],
    });

    productGroup
      .get('quantity')
      ?.valueChanges.subscribe(() => this.updateSubtotal(productGroup));
    productGroup
      .get('unitPrice')
      ?.valueChanges.subscribe(() => this.updateSubtotal(productGroup));

    this.productsArray.push(productGroup);
  }

  removeProduct(index: number): void {
    this.productsArray.removeAt(index);
    this.calculateTotal();
  }

  updateSubtotal(group: FormGroup): void {
    const quantity = group.get('quantity')?.value || 0;
    const unitPrice = group.get('unitPrice')?.value || 0;
    const subtotal = quantity * unitPrice;
    group.get('subtotal')?.setValue(subtotal.toFixed(2));
    this.calculateTotal();
  }

  calculateTotal(): number {
    let total = 0;
    for (let i = 0; i < this.productsArray.length; i++) {
      const group = this.productsArray.at(i) as FormGroup;
      const quantity = group.get('quantity')?.value || 0;
      const unitPrice = group.get('unitPrice')?.value || 0;
      total += quantity * unitPrice;
    }
    return total;
  }

  loadCustomers(): void {
    this.isLoadingCustomers = true;
    this.customersService.getCustomers({ active: true }).subscribe({
      next: (response) => {
        this.isLoadingCustomers = false;
        if (response.success) {
          this.customers = response.customers;
        } else {
          this.showAlert('Error al cargar los clientes', false);
        }
      },
      error: (err) => {
        this.isLoadingCustomers = false;
        this.showAlert('Error al cargar los clientes: ' + err.message, false);
      },
    });
  }

  loadProducts(): void {
    this.isLoadingProducts = true;
    this.productsService.getProducts({ active: true }).subscribe({
      next: (response) => {
        this.isLoadingProducts = false;
        if (response.success) {
          this.products = response.products;
        } else {
          this.showAlert('Error al cargar los productos', false);
        }
      },
      error: (err) => {
        this.isLoadingProducts = false;
        this.showAlert('Error al cargar los productos: ' + err.message, false);
      },
    });
  }

  loadWarehouses(): void {
    this.isLoadingWarehouses = true;
    this.warehousesService.getWarehouses({ active: true }).subscribe({
      next: (response) => {
        this.isLoadingWarehouses = false;
        if (response.success) {
          this.warehouses = response.warehouses;
        } else {
          this.showAlert('Error al cargar los almacenes', false);
        }
      },
      error: (err) => {
        this.isLoadingWarehouses = false;
        this.showAlert('Error al cargar los almacenes: ' + err.message, false);
      },
    });
  }

  loadSaleData(): void {
    this.isLoading = true;
    this.salesService.getSaleById(this.saleId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          const sale = response.sale;
          this.saleForm.patchValue({
            customerId: sale.customerId,
            date: new Date(sale.date).toISOString().substring(0, 16),
            notes: sale.notes,
          });

          while (this.productsArray.length) {
            this.productsArray.removeAt(0);
          }

          sale.details.forEach((detail: any) => {
            const productGroup = this.fb.group({
              productId: [detail.productId, Validators.required],
              warehouseId: [detail.warehouseId, Validators.required],
              quantity: [detail.quantity, [Validators.required, Validators.min(1)]],
              unitPrice: [detail.unitPrice, [Validators.required, Validators.min(0.01)]],
              boxes: [detail.boxes, [Validators.required, Validators.min(1)]],
              subtotal: [{ value: detail.subtotal, disabled: true }],
            });

            productGroup
              .get('quantity')
              ?.valueChanges.subscribe(() => this.updateSubtotal(productGroup));
            productGroup
              .get('unitPrice')
              ?.valueChanges.subscribe(() => this.updateSubtotal(productGroup));

            this.productsArray.push(productGroup);
          });
        } else {
          this.showAlert('Error al cargar los datos de la venta', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar los datos: ' + err.message, false);
      },
    });
  }

  onProductSelect(index: number): void {
    const productGroup = this.productsArray.at(index) as FormGroup;
    const productId = productGroup.get('productId')?.value;

    if (productId) {
      const selectedProduct = this.products.find((p) => p.id === productId);
      if (selectedProduct) {
        productGroup.get('unitPrice')?.setValue(selectedProduct.pricePerKilo);
        this.updateSubtotal(productGroup);
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/sales/list']);
  }

  private isQuantityValid(): boolean {
    for (let i = 0; i < this.productsArray.length; i++) {
      const group = this.productsArray.at(i) as FormGroup;
      const productId = group.get('productId')?.value;
      const quantity = parseFloat(group.get('quantity')?.value);
      const warehouseId = group.get('warehouseId')?.value;

      const inventoryItem = this.inventory.find(item =>
        item.itemId === productId
      );

      if (!inventoryItem) {
        this.showAlert(`No se encontró inventario para el producto seleccionado`, false);
        return false;
      }

      const available = parseFloat(inventoryItem.quantity);

      if (quantity > available) {
        this.showAlert(
          `La cantidad (${quantity} kg) del producto excede el inventario disponible (${available} kg).`,
          false
        );
        return false;
      }
    }

    return true;
  }

  onSubmit(): void {
    if (this.saleForm.invalid) {
      this.markFormGroupTouched(this.saleForm);
      this.showAlert('Por favor, completa todos los campos requeridos', false);
      return;
    }

    if (this.productsArray.length === 0) {
      this.showAlert('Debe agregar al menos un producto', false);
      return;
    }

    if (!this.isQuantityValid()) {
      return;
    }

    const formValue = this.saleForm.value;

    const saleData = {
      customerId: formValue.customerId,
      date: formValue.date,
      notes: formValue.notes,
      products: formValue.products.map((product: any) => ({
        productId: product.productId,
        warehouseId: product.warehouseId,
        quantity: product.quantity,
        unitPrice: product.unitPrice,
        boxes: product.boxes,
      })),
    };

    this.isSubmitting = true;

    if (this.isEditMode) {
      this.showAlert('La edición de ventas no está disponible', false);
      this.isSubmitting = false;
    } else {
      this.salesService.createSale(saleData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.success) {
            this.showAlert('Venta creada exitosamente', true);
            setTimeout(() => {
              this.router.navigate(['/sales/details', response.sale.id]);
            }, 1500);
          } else {
            this.showAlert('Error al crear la venta: ' + response.message, false);
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          this.showAlert('Error al crear la venta: ' + err.message, false);
        },
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        for (let i = 0; i < control.length; i++) {
          const arrayControl = control.at(i);
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        }
      }
    });
  }

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
