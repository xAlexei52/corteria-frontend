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
  usuario: string = '';
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

    // Generar el usuario a partir del nombre y apellido
    this.usuario = this.generateUsername(this.nombre, this.apellido);

    const userData = {
      nombre: `${this.nombre} ${this.apellido}`,
      usuario: this.usuario,
      email: this.email,
      password: this.password,
      rol: 'user' // Por defecto asignamos rol 'user'
    };

    this.usersService.register(userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.showAlert(response.message || 'Registro exitoso. Por favor, inicia sesión.', true);
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
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

  private generateUsername(nombre: string, apellido: string): string {
    // Limpia y normaliza el nombre y apellido
    const cleanName = nombre.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, '');
    
    const cleanLastName = apellido.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, '');

    // Crea el usuario con la primera letra del nombre y el apellido completo
    const username = `${cleanName.charAt(0)}${cleanLastName}`;
    
    return username;
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