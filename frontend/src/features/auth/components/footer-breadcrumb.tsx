import React from 'react';
import { Link } from 'react-router-dom';

interface FooterBreadcrumbProps {
    className?: string;
}

const FooterBreadcrumb: React.FC<FooterBreadcrumbProps> = ({ className = '' }) => {
    return (
        <nav
            className={`flex items-center justify-center text-sm text-muted-foreground ${className}`}
        >
            <span className="text-muted-foreground">© Indigo</span>
            <span className="mx-2 text-muted-foreground/60">•</span>
            <a
                href="https://www.indigoinstituto.com.br/contato"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-muted-foreground/80 transition-colors"
            >
                Contato
            </a>
            <span className="mx-2 text-muted-foreground/60">•</span>
            <Link
                to="/politica-privacidade"
                className="text-muted-foreground hover:text-muted-foreground/80 transition-colors"
            >
                Política de Privacidade & Termos
            </Link>
        </nav>
    );
};

export default FooterBreadcrumb;
