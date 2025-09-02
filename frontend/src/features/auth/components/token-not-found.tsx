import React from 'react';
import TokenNotFound from '../../../assets/images/auth/token-not-found.svg';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
    return (
        <div className={className}>
            <img src={TokenNotFound} alt="Token not found" className="" />
        </div>
    );
};

export default Logo;
