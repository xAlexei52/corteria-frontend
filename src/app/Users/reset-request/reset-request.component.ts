// reset-request.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/_services/Users/users.service';

@Component({
  selector: 'app-reset-request',
  templateUrl: './reset-request.component.html',
  styleUrls: ['./reset-request.component.css'],
})
export class ResetRequestComponent {
  email: string = '';
  alertMessage: string = '';
  isSuccess: boolean = false;
  isLoading: boolean = false;
  isClosing: boolean = false;

  constructor(private usersService: UsersService, private router: Router) {}

  onSubmit() {
    if (!this.isValidEmail(this.email)) {
      this.showAlert('Por favor, ingresa un email válido', false);
      return;
    }

    this.isLoading = true;

    this.usersService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.showAlert(
            response.message ||
              'Se ha enviado un enlace a tu correo para restablecer tu contraseña',
            true
          );

          // Después de un tiempo, redirigir al login
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 5000);
        } else {
          this.showAlert(
            response.message || 'No se pudo procesar tu solicitud',
            false
          );
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error en solicitud de restablecimiento', error);
        // No decir específicamente si el correo existe o no para evitar enumeración de usuarios
        this.showAlert(
          'Si tu correo está registrado, recibirás instrucciones para restablecer tu contraseña',
          true
        );
      },
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
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
