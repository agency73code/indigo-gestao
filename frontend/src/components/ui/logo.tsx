import React from 'react';
import IndigoLogo from '@/assets/logos/indigo.svg';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
    return (
        <div className={className}>
            <img src={IndigoLogo} alt="Indigo Logo" className="w-32 h-auto" />
        </div>
    );
};

export default Logo;
