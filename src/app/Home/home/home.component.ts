// src/app/Home/home/home.component.ts (completo)

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
  profitChart: any;
  inventoryChart: any;

  // Pestaña activa en análisis de producción
  activeProductionTab: string = 'profit';

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
    this.initProfitChart();
    this.initInventoryChart();
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
   * Inicializa el gráfico de rentabilidad de producción
   */
  initProfitChart(): void {
    if (!this.dashboardData?.manufacturingProfit) return;

    const ctx = document.getElementById('profitChart') as HTMLCanvasElement;
    if (!ctx) return;

    const profitData = this.dashboardData.manufacturingProfit.summary;

    const data = {
      labels: [
        'Costo Materia Prima',
        'Costo Procesamiento',
        'Valor Producción',
        'Ganancia',
      ],
      datasets: [
        {
          label: 'Análisis de Producción (MXN)',
          data: [
            profitData.totalRawMaterialCost,
            profitData.totalProcessingCost,
            profitData.totalProductionValue,
            profitData.totalProfit,
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(54, 162, 235, 0.7)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
          ],
          borderWidth: 1,
        },
      ],
    };

    this.profitChart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Análisis de Producción',
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return '$' + context.parsed.y.toLocaleString();
              },
            },
          },
        },
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
      },
    });
  }

  /**
   * Inicializa el gráfico de inventario
   */
  initInventoryChart(): void {
    if (!this.dashboardData?.inventoryStats) return;

    const ctx = document.getElementById('inventoryChart') as HTMLCanvasElement;
    if (!ctx) return;

    const stats = this.dashboardData.inventoryStats;
    const productQty = stats.inventoryByType.product?.totalQuantity || 0;
    const supplyQty = stats.inventoryByType.supply?.totalQuantity || 0;

    this.inventoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Productos (kg)', 'Insumos (u)'],
        datasets: [
          {
            data: [productQty, supplyQty],
            backgroundColor: [
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 205, 86, 0.7)',
            ],
            borderColor: ['rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Distribución de Inventario',
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                return (
                  label +
                  ': ' +
                  value.toLocaleString() +
                  (context.dataIndex === 0 ? ' kg' : ' unidades')
                );
              },
            },
          },
        },
      },
    });
  }

  /**
   * Cambia la pestaña activa en el análisis de producción
   */
  setProductionTab(tab: string): void {
    this.activeProductionTab = tab;
  }

  /**
   * Obtiene el rendimiento de producción (ratio salida/entrada)
   */
  getProductionYield(): number {
    if (!this.dashboardData?.manufacturingProfit?.summary) return 0;
    return (
      this.dashboardData.manufacturingProfit.summary.avgYieldPercentage || 0
    );
  }

  /**
   * Obtiene el margen de ganancia promedio
   */
  getAvgProfitMargin(): number {
    if (!this.dashboardData?.manufacturingProfit?.summary) return 0;
    return (
      this.dashboardData.manufacturingProfit.summary.avgProfitPercentage || 0
    );
  }

  /**
   * Obtiene el valor total del inventario
   */
  getTotalInventoryValue(): number {
    if (!this.dashboardData?.inventoryStats) return 0;
    return this.dashboardData.inventoryStats.totalProductValue || 0;
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
