import React from 'react';
import Indigo401 from '../../../assets/images/auth/401.svg';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
    return (
        <div className={className}>
            <img src={Indigo401} alt="Indigo 401" className="w-90 h-auto" />
        </div>
    );
};

export default Logo;
