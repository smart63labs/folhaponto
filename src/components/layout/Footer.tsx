import { MapPin, Phone, Mail, Globe } from "lucide-react";
import logoSefaz from "@/assets/ti_sefaz.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-govto mt-auto w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Logo e Informações Principais */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col items-start space-y-2">
              <div className="p-2 sm:p-4">
                <h3 className="text-lg sm:text-xl font-bold font-heading text-protocolo-blue mb-1">
                  Sistema de Ponto Digital
                </h3>
                <p className="text-xs sm:text-sm font-medium text-protocolo-blue opacity-80 leading-relaxed">
                  Modernizando o controle de ponto através da tecnologia e transparência.
                </p>
              </div>
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 font-heading">
              Contato
            </h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 sm:space-x-3 text-gray-700">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">
                  Palmas - TO, Brasil
                </span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 text-gray-700">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">
                  (63) 3218-1000
                </span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 text-gray-700">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">
                  ponto@sefaz.to.gov.br
                </span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 text-gray-700">
                <Globe className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">
                  www.sefaz.to.gov.br
                </span>
              </div>
            </div>
          </div>

          {/* Links Úteis */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 font-heading">
              Links Úteis
            </h4>
            <div className="space-y-2 sm:space-y-3">
              <a 
                href="#" 
                className="block text-xs sm:text-sm text-gray-700 hover:text-gray-900 transition-smooth"
              >
                Portal da Transparência
              </a>
              <a 
                href="#" 
                className="block text-xs sm:text-sm text-gray-700 hover:text-gray-900 transition-smooth"
              >
                Ouvidoria
              </a>
              <a 
                href="#" 
                className="block text-xs sm:text-sm text-gray-700 hover:text-gray-900 transition-smooth"
              >
                Acesso à Informação
              </a>
              <a 
                href="#" 
                className="block text-xs sm:text-sm text-gray-700 hover:text-gray-900 transition-smooth"
              >
                Fale Conosco
              </a>
            </div>
          </div>
        </div>

        {/* Rodapé Inferior */}
        <div className="border-t border-gray-200 mt-6 sm:mt-8 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 text-gray-600">
              <img 
                src={logoSefaz} 
                alt="Logo SEFAZ Tocantins"
                className="h-8 sm:h-10 w-auto object-contain"
              />
              <span className="text-xs sm:text-sm text-center sm:text-left">
                © {currentYear} Governo do Tocantins. Todos os direitos reservados.
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-xs sm:text-sm text-gray-600">
              <a 
                href="#" 
                className="hover:text-gray-900 transition-smooth"
              >
                Política de Privacidade
              </a>
              <a 
                href="#" 
                className="hover:text-gray-900 transition-smooth"
              >
                Termos de Uso
              </a>
              <a 
                href="#" 
                className="hover:text-gray-900 transition-smooth"
              >
                Acessibilidade
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;