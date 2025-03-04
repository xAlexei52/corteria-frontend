import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/_services/Users/users.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  nombre: string = '';
  apellido: string = '';
  email: string = '';
  password: string = '';
  hidePassword: boolean = true;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isLoading: boolean = false;
  isClosing: boolean = false;

  constructor(
    private usersService: UsersService, 
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onRegister() {
    if (!this.isFormValid()) {
      this.showAlert('Por favor, completa todos los campos correctamente', false);
      return;
    }

    this.isLoading = true;

    const userData = {
      firstName: this.nombre,
      lastName: this.apellido,
      email: this.email,
      password: this.password,
      city: 'N/A'
    };

    this.usersService.register(userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          // Mostramos el mensaje que viene de la API
          this.showAlert(response.message || 'Registro exitoso. Tu cuenta está pendiente de activación.', true);
          
          // Guardamos los datos del usuario recién registrado para mostrarlos o usarlos si es necesario
          localStorage.setItem('tempUserData', JSON.stringify(response.user));
          
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000); // Damos un poco más de tiempo para que el usuario lea el mensaje
        } else {
          this.showAlert(response.message || 'Error en el registro. Por favor, intenta de nuevo.', false);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error en el registro', error);
        this.showAlert(
          error.error?.message || 
          'Hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.', 
          false
        );
      }
    });
  }

  private isFormValid(): boolean {
    return this.nombre.length >= 2 &&
           this.apellido.length >= 2 &&
           this.isValidEmail(this.email) &&
           this.password.length >= 6;
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