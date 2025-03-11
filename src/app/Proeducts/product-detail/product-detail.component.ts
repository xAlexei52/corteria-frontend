// product-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from 'src/app/_services/Products/products.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit {
  productId: string = '';
  product: any = null;
  isLoading: boolean = false;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.productId = params['id'];
      if (this.productId) {
        this.loadProductDetails();
      } else {
        this.router.navigate(['/products/list']);
      }
    });
  }

  loadProductDetails(): void {
    this.isLoading = true;
    this.productsService.getProductById(this.productId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.product = response.product;
        } else {
          this.showAlert('Error al cargar los detalles del producto', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar los detalles: ' + err.message, false);
      },
    });
  }

  // Navegar a la página de edición del producto
  editProduct(): void {
    this.router.navigate([`/products/edit/${this.productId}`]);
  }

  // Eliminar el producto
  deleteProduct(): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productsService.deleteProduct(this.productId).subscribe({
        next: (response) => {
          if (response.success) {
            this.showAlert('Producto eliminado correctamente', true);
            setTimeout(() => {
              this.router.navigate(['/products/list']);
            }, 1500);
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

  // Volver a la lista de productos
  goBack(): void {
    this.router.navigate(['/products/list']);
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
