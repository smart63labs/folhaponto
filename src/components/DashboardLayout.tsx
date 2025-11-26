import { AppSidebar } from "./AppSidebar";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import { UserRole } from "@/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
}

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50">
      {/* Header ocupando toda a largura */}
      <Header />
      
      {/* Conteúdo principal com sidebar e área de conteúdo - com padding-top para compensar header fixo */}
      <div className="flex flex-1 pt-16">
        <AppSidebar userRole={userRole} />
        <main className="flex-1 flex flex-col">
          <div className="flex-1">
            <div className="container mx-auto px-6 py-8 max-w-7xl">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      {/* Footer ocupando toda a largura */}
      <Footer />
    </div>
  );
}
