import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    loadingText?: string;
}

const buttonVariants = {
    primary: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
};

const sizeVariants = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-8',
};

export default function AnimatedButton({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText = 'Carregando...',
    className,
    disabled,
    ...props
}: AnimatedButtonProps) {
    return (
        <motion.button
            className={cn(
                'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 overflow-hidden',
                buttonVariants[variant],
                sizeVariants[size],
                className,
            )}
            whileHover={!disabled && !isLoading ? { scale: 1.02 } : undefined}
            whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}
            disabled={disabled || isLoading}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 15,
            }}
            {...props}
        >
            {/* Shimmer effect on hover */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
            />

            {/* Button content */}
            <motion.div
                className="relative z-10 flex items-center justify-center gap-2"
                animate={{
                    opacity: isLoading ? 0.7 : 1,
                }}
                transition={{ duration: 0.2 }}
            >
                {isLoading ? (
                    <>
                        <motion.div
                            className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        />
                        {loadingText}
                    </>
                ) : (
                    children
                )}
            </motion.div>
        </motion.button>
    );
}
