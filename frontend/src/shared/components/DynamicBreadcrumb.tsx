import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { useBreadcrumb } from '@/hooks/useBreadcrumb';

export default function DynamicBreadcrumb() {
    const breadcrumbItems = useBreadcrumb();

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                    <div key={index} className="flex items-center">
                        <BreadcrumbItem className={index === 0 ? 'hidden md:block' : ''}>
                            {item.href && index < breadcrumbItems.length - 1 ? (
                                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                            ) : (
                                <BreadcrumbPage>{item.label}</BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                        {index < breadcrumbItems.length - 1 && (
                            <BreadcrumbSeparator className="hidden md:block" />
                        )}
                    </div>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
