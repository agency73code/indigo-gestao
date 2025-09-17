import React from 'react';

interface FooterBreadcrumbProps {
  className?: string;
}

const FooterBreadcrumb: React.FC<FooterBreadcrumbProps> = ({ className = "" }) => {
  return (
    <nav className={`flex items-center justify-center text-sm text-gray-500 ${className}`}>
      <span className="text-gray-600">© Indigo</span>
      <span className="mx-2 text-gray-400">•</span>
      <a 
        href="/contato" 
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        Contato
      </a>
      <span className="mx-2 text-gray-400">•</span>
      <a 
        href="/politica-privacidade" 
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        Política de Privacidade
      </a>
    </nav>
  );
};

export default FooterBreadcrumb;