// product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService } from 'src/app/_services/Products/products.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  isLoading: boolean = false;
  totalItems: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  filterForm!: FormGroup;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  constructor(
    private productsService: ProductsService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      active: [''],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
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

    this.productsService.getProducts(filters).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.products = response.products;
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
          this.currentPage = response.pagination.currentPage;
          this.itemsPerPage = response.pagination.limit;
        } else {
          this.showAlert('Error al cargar los productos', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar los productos: ' + err.message, false);
      },
    });
  }

  // Cambiar de página
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  // Aplicar filtros
  applyFilters(): void {
    this.currentPage = 1; // Resetear a la primera página
    this.loadProducts();
  }

  // Resetear filtros
  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      active: '',
    });
    this.currentPage = 1;
    this.loadProducts();
  }

  // Navegar a la página de detalle del producto
  viewProductDetails(id: string): void {
    this.router.navigate([`/products/details/${id}`]);
  }

  // Navegar a la página de edición del producto
  editProduct(id: string): void {
    this.router.navigate([`/products/edit/${id}`]);
  }

  // Crear nuevo producto
  createNewProduct(): void {
    this.router.navigate(['/products/new']);
  }

  // Eliminar un producto
  deleteProduct(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productsService.deleteProduct(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showAlert('Producto eliminado correctamente', true);
            this.loadProducts(); // Recargar la lista
          } else {
            this.showAlert('Error al eliminar el producto', false);
          }
        },
        error: (err) => {
          this.showAlert(
            'Error al eliminar el producto: ' + err.message,
            false
          );
        },
      });
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
}
