
import React, { useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { Truck, Calendar, FileChartPie, TrendingUp, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ExpensesChart from '@/components/reports/ExpensesChart';
import MonthlyExpenseChart from '@/components/reports/MonthlyExpenseChart';
import ExpenseSummary from '@/components/reports/ExpenseSummary';
import { formatCurrency } from '@/utils/chartColors';

const Dashboard = () => {
  console.log('🎯 [Dashboard] Inicializando Dashboard');
  
  const { 
    vehicles, 
    trips, 
    expenses, 
    isLoading 
  } = useData();
  
  console.log('📊 [Dashboard] Datos cargados:', {
    vehicles: vehicles.length,
    trips: trips.length,
    expenses: expenses.length,
    isLoading
  });
  
  const metrics = useMemo(() => {
    const startTime = performance.now();
    console.log('📈 [Dashboard] Calculando métricas...');
    
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const now = new Date();
    const activeTrips = trips.filter(trip => {
      const hasNoEndDate = !trip.endDate;
      const endDateFuture = trip.endDate && new Date(trip.endDate) >= now;
      return hasNoEndDate || endDateFuture;
    });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentExpenses = expenses.filter(expense => 
      new Date(expense.date) >= thirtyDaysAgo
    );
    
    const vehiclesWithExpiringDocs = vehicles.filter(vehicle => {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const soatExpiring = vehicle.soatExpiryDate && 
        new Date(vehicle.soatExpiryDate) <= thirtyDaysFromNow;
      const technoExpiring = vehicle.technoExpiryDate && 
        new Date(vehicle.technoExpiryDate) <= thirtyDaysFromNow;
      
      return soatExpiring || technoExpiring;
    });
    
    const avgExpensePerTrip = trips.length > 0 ? totalExpenses / trips.length : 0;
    const avgExpensePerVehicle = vehicles.length > 0 ? totalExpenses / vehicles.length : 0;
    
    const result = {
      totalExpenses,
      activeTrips: activeTrips.length,
      totalTrips: trips.length,
      recentExpenses: recentExpenses.length,
      recentExpensesAmount: recentExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      vehiclesWithExpiringDocs: vehiclesWithExpiringDocs.length,
      avgExpensePerTrip,
      avgExpensePerVehicle,
      completedTrips: trips.length - activeTrips.length
    };
    
    const endTime = performance.now();
    console.log(`✅ [Dashboard] Métricas calculadas en ${(endTime - startTime).toFixed(2)}ms:`, result);
    
    return result;
  }, [vehicles, trips, expenses]);
  
  const chartData = useMemo(() => {
    console.log('📊 [Dashboard] Preparando datos para gráficos...');
    
    const expensesByCategory = expenses.reduce((acc, expense) => {
      const category = expense.category || 'other';
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('✅ [Dashboard] Datos de gráficos preparados:', expensesByCategory);
    return { expensesByCategory };
  }, [expenses]);
  
  useEffect(() => {
    console.log('🔄 [Dashboard] Dashboard renderizado con métricas actualizadas');
  }, [metrics]);
  
  if (isLoading) {
    console.log('⏳ [Dashboard] Mostrando estado de carga');
    return (
      <div className="space-y-6 bg-white min-h-full animate-pulse">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="h-8 bg-gray-200 rounded mb-2 w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-6 bg-gray-200 rounded mb-4 w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 bg-white min-h-full px-2 sm:px-0">
      {/* Header optimizado */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Dashboard</h1>
        <p className="text-muted-foreground">
          Panel de control completo de TransporegistrosPlus
        </p>
        {metrics.vehiclesWithExpiringDocs > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">
              {metrics.vehiclesWithExpiringDocs} vehículo(s) con documentos próximos a vencer
            </span>
            <Link to="/vehicles">
              <Button variant="outline" size="sm" className="ml-auto">
                Revisar
              </Button>
            </Link>
          </div>
        )}
      </div>
      
      {/* Métricas principales optimizadas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-6">
            <div className="space-y-1 min-w-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                Vehículos
              </CardTitle>
              <CardDescription className="text-xs hidden sm:block">
                Total registrados
              </CardDescription>
            </div>
            <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-3xl font-bold text-gray-900">{vehicles.length}</div>
            <Link to="/vehicles">
              <Button variant="link" className="p-0 h-auto text-blue-600 text-xs sm:text-sm">
                Ver vehículos →
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-6">
            <div className="space-y-1 min-w-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                Viajes
              </CardTitle>
              <CardDescription className="text-xs hidden sm:block">
                Activos / Completados
              </CardDescription>
            </div>
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-3xl font-bold text-gray-900">
              {metrics.activeTrips} / {metrics.completedTrips}
            </div>
            <Link to="/trips">
              <Button variant="link" className="p-0 h-auto text-green-600 text-xs sm:text-sm">
                Ver viajes →
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-6">
            <div className="space-y-1 min-w-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                Gastos Totales
              </CardTitle>
              <CardDescription className="text-xs hidden sm:block">
                Todos los registros
              </CardDescription>
            </div>
            <FileChartPie className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-sm sm:text-2xl font-bold text-gray-900">
              {formatCurrency(metrics.totalExpenses)}
            </div>
            <Link to="/reports">
              <Button variant="link" className="p-0 h-auto text-purple-600 text-xs sm:text-sm">
                Ver reportes →
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-6">
            <div className="space-y-1 min-w-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                Gastos Recientes
              </CardTitle>
              <CardDescription className="text-xs hidden sm:block">
                Últimos 30 días
              </CardDescription>
            </div>
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-sm sm:text-2xl font-bold text-gray-900">
              {formatCurrency(metrics.recentExpensesAmount)}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              {metrics.recentExpenses} registros
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Gráficas optimizadas para móvil */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm min-h-[300px] sm:min-h-[400px]">
          <ExpensesChart 
            expenses={expenses} 
            data={chartData.expensesByCategory}
          />
        </div>
        <div className="bg-white rounded-lg shadow-sm">
          <MonthlyExpenseChart expenses={expenses} />
        </div>
      </div>
      
      {/* Resumen de gastos recientes optimizado */}
      {metrics.recentExpenses > 0 && (
        <div className="bg-white rounded-lg shadow-sm">
          <ExpenseSummary 
            expenses={expenses.filter(e => {
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              return new Date(e.date) >= thirtyDaysAgo;
            })} 
            vehicles={vehicles} 
            trips={trips} 
            title="Gastos de los últimos 30 días" 
          />
        </div>
      )}
      
      {/* Enlaces rápidos optimizados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex flex-col items-center py-8 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all duration-200 border-blue-200">
          <Truck className="h-12 w-12 text-blue-600 mb-4" />
          <CardTitle className="mb-3 text-gray-900 text-center">Administrar Vehículos</CardTitle>
          <p className="text-sm text-gray-600 text-center mb-4 px-4">
            Gestiona tu flota y mantén al día la documentación
          </p>
          <Link to="/vehicles">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Ir a Vehículos
            </Button>
          </Link>
        </Card>
        
        <Card className="flex flex-col items-center py-8 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-200 border-green-200">
          <Calendar className="h-12 w-12 text-green-600 mb-4" />
          <CardTitle className="mb-3 text-gray-900 text-center">Administrar Viajes</CardTitle>
          <p className="text-sm text-gray-600 text-center mb-4 px-4">
            Planifica y rastrea todos tus viajes
          </p>
          <Link to="/trips">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Ir a Viajes
            </Button>
          </Link>
        </Card>
        
        <Card className="flex flex-col items-center py-8 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all duration-200 border-purple-200">
          <FileChartPie className="h-12 w-12 text-purple-600 mb-4" />
          <CardTitle className="mb-3 text-gray-900 text-center">Análisis y Reportes</CardTitle>
          <p className="text-sm text-gray-600 text-center mb-4 px-4">
            Obtén insights detallados de tus gastos
          </p>
          <Link to="/reports">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Ver Reportes
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
