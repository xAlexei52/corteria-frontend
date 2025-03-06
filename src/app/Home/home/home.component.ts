// src/app/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/_services/Dashboard/dashboard.service';
import { Chart, registerables } from 'chart.js';

// Registrar los componentes necesarios de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  // Banderas para controlar carga y errores
  isLoading: boolean = true;
  error: string | null = null;

  // Datos del dashboard
  dashboardData: any = null;

  // Graficos
  salesChart: any;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Carga los datos del dashboard desde el servicio
   */
  loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
        // Inicializar gráficos después de cargar datos
        setTimeout(() => {
          this.initCharts();
        }, 0);
      },
      error: (err) => {
        this.error = err.message;
        this.isLoading = false;
        console.error('Error al cargar datos del dashboard:', err);
      },
    });
  }

  /**
   * Inicializa los gráficos con los datos cargados
   */
  initCharts(): void {
    this.initSalesChart();
  }

  /**
   * Inicializa el gráfico de ventas comparativas
   */
  initSalesChart(): void {
    // Obtener el contexto del canvas
    const ctx = document.getElementById('salesChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Datos para el gráfico
    const currentMonthSales =
      this.dashboardData.salesComparison.currentMonth.totalAmount;
    const previousMonthSales =
      this.dashboardData.salesComparison.previousMonth.totalAmount;

    // Obtener los nombres de los meses para las etiquetas
    const currentMonthLabel = this.getMonthName(
      new Date(this.dashboardData.salesComparison.currentMonth.period.start)
    );
    const previousMonthLabel = this.getMonthName(
      new Date(this.dashboardData.salesComparison.previousMonth.period.start)
    );

    // Crear el gráfico
    this.salesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [previousMonthLabel, currentMonthLabel],
        datasets: [
          {
            label: 'Ventas',
            data: [previousMonthSales, currentMonthSales],
            backgroundColor: [
              'rgba(54, 162, 235, 0.5)',
              'rgba(54, 162, 235, 0.8)',
            ],
            borderColor: ['rgba(54, 162, 235, 1)', 'rgba(54, 162, 235, 1)'],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return '$' + value.toLocaleString();
              },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                return '$' + context.parsed.y.toLocaleString();
              },
            },
          },
        },
      },
    });
  }

  /**
   * Obtiene el nombre del mes a partir de una fecha
   */
  getMonthName(date: Date): string {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return months[date.getMonth()];
  }

  /**
   * Formatea un valor numérico como moneda
   */
  formatCurrency(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return (
      '$' +
      num.toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  /**
   * Formatea una fecha para mostrar
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Retorna el nombre completo de un usuario
   */
  getFullName(user: any): string {
    return `${user.firstName} ${user.lastName}`;
  }

  /**
   * Devuelve el estado formateado de una venta
   */
  getSaleStatusText(status: string): string {
    switch (status) {
      case 'paid':
        return 'Pagada';
      case 'partially_paid':
        return 'Parcialmente pagada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  }

  /**
   * Devuelve la clase CSS según el estado de la venta
   */
  getSaleStatusClass(status: string): string {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partially_paid':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Obtiene el porcentaje de cambio para mostrar tendencia
   */
  getSalesChangePercent(): string {
    if (!this.dashboardData) return '0%';

    const change =
      this.dashboardData.salesComparison.comparison.amountPercentChange;
    const formattedChange = Math.abs(change).toFixed(1);
    return `${formattedChange}%`;
  }

  /**
   * Determina si el cambio en ventas es positivo
   */
  isSalesChangePositive(): boolean {
    if (!this.dashboardData) return true;

    return (
      this.dashboardData.salesComparison.comparison.amountPercentChange >= 0
    );
  }
}
