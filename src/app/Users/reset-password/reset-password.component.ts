// reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from 'src/app/_services/Users/users.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  password: string = '';
  confirmPassword: string = '';
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isLoading: boolean = false;
  isClosing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService
  ) {}

  ngOnInit() {
    // Obtener el token de la URL
    this.route.params.subscribe((params) => {
      this.token = params['token'];
      if (!this.token) {
        this.showAlert('Token no válido o no proporcionado', false);
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      }
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  onSubmit() {
    // Validar que las contraseñas coincidan y cumplan los requisitos
    if (!this.isPasswordValid()) {
      return;
    }

    this.isLoading = true;

    this.usersService.resetPassword(this.token, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.showAlert(
            response.message || 'Contraseña restablecida correctamente',
            true
          );
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.showAlert(
            response.message || 'No se pudo restablecer la contraseña',
            false
          );
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al restablecer contraseña', error);
        this.showAlert(
          error.error?.message ||
            'Error al restablecer la contraseña. El enlace podría haber expirado.',
          false
        );
      },
    });
  }

  private isPasswordValid(): boolean {
    if (this.password.length < 6) {
      this.showAlert('La contraseña debe tener al menos 6 caracteres', false);
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.showAlert('Las contraseñas no coinciden', false);
      return false;
    }

    return true;
  }

  private showAlert(message: string, isSuccess: boolean) {
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
