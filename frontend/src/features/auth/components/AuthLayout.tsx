import { useState, useEffect } from 'react';
import Logo from '../../../shared/components/ui/logo';
import FooterBreadcrumb from '../../../shared/components/ui/footer-breadcrumb';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from '@/components/ui/carousel';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [api, setApi] = useState<CarouselApi>();

    useEffect(() => {
        if (!api) return;

        // Atualiza o slide atual quando mudar
        api.on('select', () => {
            setCurrentSlide(api.selectedScrollSnap());
        });

        // Autoplay - avança a cada 4 segundos
        const interval = setInterval(() => {
            api.scrollNext();
        }, 4000);

        return () => clearInterval(interval);
    }, [api]);
    // Imagens para o carrossel (você pode substituir por suas próprias imagens)
    const carouselImages = [
        {
            url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&auto=format&fit=crop&q=80',
            title: 'Tudo em Um Só Lugar',
            description: 'Centralize cadastros, programas e atendimentos em uma plataforma completa e intuitiva.'
        },
        {
            url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&h=1080&auto=format&fit=crop&q=80',
            title: 'Gestão Simplificada',
            description: 'Ferramentas completas para gerenciar sua equipe e atendimentos com eficiência.'
        },
        {
            url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&h=1080&auto=format&fit=crop&q=80',
            title: 'Controle Total',
            description: 'Acompanhe programas, sessões e relatórios em tempo real.'
        }
    ];

    return (
        <div className="flex h-screen p-1.5 gap-1.5" style={{ background: 'var(--blue-moon-gradient)' }}>
            {/* Lado Esquerdo - Carrossel de Imagens */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative rounded-2xl overflow-hidden bg-muted">
                {/* Logo no canto superior esquerdo */}
                <div className="absolute z-10">
                    <Logo className="scale-75" />
                </div>
                
                <Carousel
                    className="w-full h-full"
                    opts={{
                        align: 'start',
                        loop: true,
                    }}
                    setApi={setApi}
                >
                    <CarouselContent className="-ml-0" style={{ height: '100vh' }}>
                        {carouselImages.map((image, index) => (
                            <CarouselItem key={index} className="pl-0 basis-full h-screen">
                                <div className="relative h-full w-full">
                                    <img 
                                        src={image.url}
                                        alt={image.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Overlay escuro para melhorar legibilidade do texto */}
                                    <div className="absolute inset-0 bg-black/50" />
                                    
                                    {/* Texto sobre a imagem */}
                                    <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
                                        <h2 className="text-4xl font-regular mb-4 max-w-md" style={{ fontFamily: 'Sora' }} >
                                            {image.title}
                                        </h2>
                                        <p className="text-lg text-white/90 max-w-md">
                                            {image.description}
                                        </p>
                                        
                                        {/* Indicadores de slide */}
                                        <div className="flex gap-2 mt-8">
                                            {carouselImages.map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-2 rounded-full transition-all ${
                                                        i === currentSlide 
                                                            ? 'w-8 bg-white' 
                                                            : 'w-2 bg-white/50'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>

            {/* Lado Direito - Formulário de Login */}
            <div className="flex-1 flex flex-col p-4 lg:p-12 bg-background rounded-2xl">
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-md">
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <div className="w-full">
                    <FooterBreadcrumb />
                </div>
            </div>
        </div>
    );
}
