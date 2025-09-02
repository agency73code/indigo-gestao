import React from 'react';
import Indigo404 from '../../../assets/images/auth/404.svg';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
    return (
        <div className={className}>
            <img src={Indigo404} alt="Indigo 404" className="w-80 h-auto" />
        </div>
    );
};

export default Logo;
