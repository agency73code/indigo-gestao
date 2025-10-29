/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    prefix: '',
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                sora: ['Sora', 'sans-serif'],
                heading: ['Sora', 'sans-serif'],
            },
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
                'float-up': {
                    '0%': { transform: 'translate(-50%, -50%) scale(0.5)', opacity: '0' },
                    '50%': { transform: 'translate(-50%, -70%) scale(1.2)', opacity: '1' },
                    '100%': { transform: 'translate(-50%, -100%) scale(0.8)', opacity: '0' },
                },
                'pencil-write': {
                    '0%': { transform: 'translate(0, 0) rotate(-5deg)' },
                    '25%': { transform: 'translate(3px, 3px) rotate(5deg)' },
                    '50%': { transform: 'translate(6px, 6px) rotate(-3deg)' },
                    '75%': { transform: 'translate(3px, 3px) rotate(3deg)' },
                    '100%': { transform: 'translate(0, 0) rotate(-5deg)' },
                },
                'pulse-subtle': {
                    '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.4)' },
                    '50%': { transform: 'scale(1.03)', boxShadow: '0 0 0 6px rgba(59, 130, 246, 0)' },
                },
                'writing-line': {
                    '0%': { transform: 'scaleX(0)', opacity: '0' },
                    '50%': { transform: 'scaleX(1)', opacity: '1' },
                    '100%': { transform: 'scaleX(0)', opacity: '0' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'float-up': 'float-up 0.6s ease-out forwards',
                'pencil-write': 'pencil-write 0.8s ease-in-out infinite',
                'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
                'writing-line': 'writing-line 1s ease-in-out infinite',
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
};
