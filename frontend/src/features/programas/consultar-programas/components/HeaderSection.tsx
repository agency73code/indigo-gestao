interface HeaderSectionProps {
    title?: string;
    subtitle?: string;
}

export default function HeaderSection({
    title = 'Consultar Programas (OCP)',
    subtitle = '',
}: HeaderSectionProps) {
    return (
        <div className="space-y-2 p-0 pb-2">
            <h1
                style={{ fontFamily: 'Sora, sans-serif' }}
                className="text-xl sm:text-2xl font-semibold text-primary leading-tight"
            >
                {title}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{subtitle}</p>
        </div>
    );
}
