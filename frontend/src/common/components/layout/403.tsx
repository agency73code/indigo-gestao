import React from 'react';
import Indigo403 from '../../../assets/images/auth/403.svg';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
    return (
        <div className={className}>
            <img src={Indigo403} alt="Indigo 403" className="w-90 h-auto" />
        </div>
    );
};

export default Logo;
