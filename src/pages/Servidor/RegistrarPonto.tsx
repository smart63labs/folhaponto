import { DashboardLayout } from "@/components/DashboardLayout";
import RegistroPonto from "@/components/RegistroPonto";
import { useAuth } from "@/contexts/AuthContext";

export default function RegistrarPonto() {
  const { user } = useAuth();
  
  return (
    <DashboardLayout userRole={user?.role || 'servidor'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Registrar Ponto
            </h1>
            <p className="text-gray-600 mt-2">Registre sua entrada, saída e intervalos de forma digital</p>
          </div>
        </div>

        {/* Componente de Registro de Ponto */}
        <RegistroPonto />
      </div>
    </DashboardLayout>
  );
}