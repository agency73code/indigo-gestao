import { useParams } from 'react-router-dom';

export default function EditarProgramaPage() {
    const { programaId } = useParams();

    return (
        <div style={{ padding: 24 }}>
            <h1>Editar Programa — ID: {programaId}</h1>
        </div>
    );
}
