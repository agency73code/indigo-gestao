import { Link } from 'react-router-dom';
import { User, Users } from 'lucide-react';

export default function CadastroHubPage() {
    return (
        <div className='flex flex-col top-0 left-0 w-full h-full px-6 py-6'>
            <div className='mb-6'>
                <h1 
                style={{ fontFamily: 'sora' }}
                className="text-2xl font-semibold text-primary">Cadastro</h1>
                <p className="text-sm text-muted-foreground">O que você deseja cadastrar?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-full">
                <Link
                    to="/app/cadastro/terapeuta"
                    className="group block rounded-lg border bg-card p-6 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label="Cadastrar novo terapeuta no sistema"
                >
                    <div className="flex items-start gap-4 flex-col">
                        <div className="flex-shrink-0 w-30 h-30 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <User className="w-20 h-20 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                                Cadastrar Terapeuta
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Inclua um novo profissional no sistema com todos os dados
                                necessários.
                            </p>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/app/cadastro/cliente"
                    className="group block rounded-lg border bg-card p-6 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label="Cadastrar novo cliente/paciente no sistema"
                >
                    <div className="flex items-start gap-4 flex-col">
                        <div className="flex-shrink-0 w-30 h-30 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                            <Users className="w-20 h-20 text-green-700" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                                Cadastrar Cliente
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Crie o cadastro completo do paciente/cliente no sistema.
                            </p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
