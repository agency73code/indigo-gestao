interface HeaderSectionProps {
    title?: string;
    subtitle?: string;
}

export default function HeaderSection({
    title = 'Consultar Programas (OCP)',
    subtitle = 'Selecione um paciente para ver ou criar programas',
}: HeaderSectionProps) {
    return (
        <div className="space-y-2 p-0">
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
