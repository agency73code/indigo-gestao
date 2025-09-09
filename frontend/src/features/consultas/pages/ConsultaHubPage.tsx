import { Link } from 'react-router-dom';
import { User, Users } from 'lucide-react';

export default function ConsultaHubPage() {
    return (
        <div className='flex flex-col top-0 left-0 w-full h-full px-6 py-6'>
            <div className='mb-6'>
                <h1 
                    style={{ fontFamily: 'sora' }}
                    className="text-2xl font-semibold text-primary">Consulta</h1>
                <p className="text-sm text-muted-foreground">O que você deseja consultar?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-full">
                <Link
                    to="/app/consultas/terapeutas"
                    className="group block rounded-lg border bg-card p-6 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label="Consultar e gerenciar terapeutas cadastrados"
                >
                    <div className=" items-start gap-4 flex flex-col">
                        <div className="flex-shrink-0 w-30 h-30 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <User className="w-20 h-20 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                                Consultar Terapeutas
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Visualize e gerencie os terapeutas cadastrados no sistema.
                            </p>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/app/consultas/pacientes"
                    className="group block rounded-lg border bg-card p-6 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label="Consultar e gerenciar pacientes cadastrados"
                >
                    <div className="flex items-start gap-4  flex-col">
                        <div className="flex-shrink-0 w-30 h-30 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                            <Users className="w-20 h-20 text-green-700" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                                Consultar Pacientes
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Visualize e gerencie os pacientes cadastrados no sistema.
                            </p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
