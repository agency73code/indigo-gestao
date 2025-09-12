import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface GlobalSearchProps extends React.ComponentProps<'div'> {
    placeholder?: string;
}

export function GlobalSearch({
    className,
    placeholder = 'Buscar em tudo...',
    ...props
}: GlobalSearchProps) {
    return (
        <div className={cn('relative max-w-sm w-full', className)} {...props}>
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none " />
            <Input
                type="search"
                placeholder={placeholder}
                className="pl-8 h-8 text-sm bg-background/60 border-border/60 focus:bg-background focus:border-border transition-colors "
            />
        </div>
    );
}
