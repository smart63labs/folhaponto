import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import logoSefaz from "@/assets/logo-sefaz-tocantins.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="-mb-4">
          <img src={logoSefaz} alt="SEFAZ Tocantins" className="h-16 w-auto mx-auto" />
        </div>
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-gray-600">Oops! Página não encontrada.</p>
        <a href="/" className="text-blue-500 underline hover:text-blue-700">
          Retornar para Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
