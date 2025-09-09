import { Link } from 'react-router-dom';
import { User, Users } from 'lucide-react';
import { PageShell } from '../../../shared/components/PageShell';

export default function CadastroPage() {
    return (
        <PageShell
            header={
                <>
                    <h1 className="text-2xl font-semibold text-primary">Cadastro</h1>
                    <p className="text-sm text-muted-foreground">O que você deseja cadastrar?</p>
                </>
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
                <Link
                    to="/app/cadastro/terapeuta"
                    className="group block rounded-lg border bg-card p-6 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label="Cadastrar novo terapeuta no sistema"
                >
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <User className="w-5 h-5 text-blue-600" />
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
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                            <Users className="w-5 h-5 text-green-600" />
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
        </PageShell>
    );
}
