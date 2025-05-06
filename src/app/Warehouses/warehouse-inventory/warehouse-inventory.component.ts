// src/app/Warehouses/warehouse-inventory/warehouse-inventory.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WarehousesService } from 'src/app/_services/Warehouses/warehouses.service';
import { InventoryService } from 'src/app/_services/Inventory/inventory.service';
import { ProductsService } from 'src/app/_services/Products/products.service';

@Component({
  selector: 'app-warehouse-inventory',
  templateUrl: './warehouse-inventory.component.html',
  styleUrls: ['./warehouse-inventory.component.css'],
})
export class WarehouseInventoryComponent implements OnInit {
  warehouseId: string = '';
  warehouse: any = null;
  inventory: any[] = [];
  isLoading: boolean = false;
  totalItems: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  // Para filtros de inventario
  filterForm!: FormGroup;

  // Para transferencias
  showTransferModal: boolean = false;
  transferForm!: FormGroup;
  warehousesList: any[] = [];
  productsList: any[] = [];
  isTransferring: boolean = false;

  // Alertas
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private warehousesService: WarehousesService,
    private inventoryService: InventoryService,
    private productsService: ProductsService
  ) {
    this.filterForm = this.fb.group({
      itemType: ['product'], // Por defecto, mostrar productos
      search: [''],
    });

    this.transferForm = this.fb.group({
      sourceWarehouseId: [this.warehouseId],
      destinationWarehouseId: ['', Validators.required],
      itemType: ['product', Validators.required],
      itemId: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(0.1)]],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.warehouseId = params['id'];
      if (this.warehouseId) {
        this.loadWarehouseData();
        this.loadInventory();
        this.loadWarehousesList();
        this.loadProductsList();
      } else {
        this.router.navigate(['/warehouses']);
      }
    });
  }

  loadWarehouseData(): void {
    this.isLoading = true;
    this.warehousesService.getWarehouseById(this.warehouseId).subscribe({
      next: (response) => {
        if (response.success) {
          this.warehouse = response.warehouse;
        } else {
          this.showAlert('Error al cargar datos del almacén', false);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.showAlert('Error: ' + err.message, false);
        this.isLoading = false;
      },
    });
  }

  loadInventory(): void {
    this.isLoading = true;
    const filters = {
      warehouseId: this.warehouseId,
      page: this.currentPage,
      limit: this.itemsPerPage,
      ...this.filterForm.value,
    };

    this.inventoryService.getInventory(filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.inventory = response.inventory;
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
          this.currentPage = response.pagination.currentPage;
          this.itemsPerPage = response.pagination.limit;
        } else {
          this.showAlert('Error al cargar inventario', false);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.showAlert('Error: ' + err.message, false);
        this.isLoading = false;
      },
    });
  }

  loadWarehousesList(): void {
    this.warehousesService.getWarehouses({ active: true }).subscribe({
      next: (response) => {
        if (response.success) {
          // Filtrar el almacén actual de la lista de destinos
          this.warehousesList = response.warehouses.filter(
            (w: any) => w.id !== this.warehouseId
          );
        }
      },
      error: (err) => console.error('Error cargando almacenes:', err),
    });
  }

  loadProductsList(): void {
    this.productsService.getProducts({ active: true }).subscribe({
      next: (response) => {
        if (response.success) {
          this.productsList = response.products;
        }
      },
      error: (err) => console.error('Error cargando productos:', err),
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadInventory();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadInventory();
  }

  resetFilters(): void {
    this.filterForm.reset({
      itemType: 'product',
      search: '',
    });
    this.currentPage = 1;
    this.loadInventory();
  }

  goBack(): void {
    this.router.navigate(['/warehouses']);
  }

  openTransferModal(): void {
    this.transferForm.patchValue({
      sourceWarehouseId: this.warehouseId,
      destinationWarehouseId: '',
      itemId: '',
      quantity: '',
    });
    this.showTransferModal = true;
  }

  closeTransferModal(): void {
    this.showTransferModal = false;
  }

  onTransferSubmit(): void {
    if (this.transferForm.invalid) {
      return;
    }

    this.isTransferring = true;
    this.inventoryService.transferInventory(this.transferForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.showAlert('Transferencia realizada con éxito', true);
          this.loadInventory(); // Recargar el inventario
        } else {
          this.showAlert(
            'Error en la transferencia: ' + response.message,
            false
          );
        }
        this.isTransferring = false;
        this.showTransferModal = false;
      },
      error: (err) => {
        this.showAlert('Error: ' + err.message, false);
        this.isTransferring = false;
        this.showTransferModal = false;
      },
    });
  }

  getItemDetails(item: any): string {
    if (item.itemType === 'product' && item.product) {
      return `${item.product.name} - $${item.product.pricePerKilo}/kg`;
    } else if (item.itemType === 'supply' && item.supply) {
      return `${item.supply.name} - ${item.supply.unit}`;
    }
    return 'No disponible';
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
