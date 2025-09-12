import { useParams } from 'react-router-dom';

export default function DetalheProgramaPage() {
    const { programaId } = useParams();

    return (
        <div style={{ padding: 24 }}>
            <h1>Detalhe do Programa — ID: {programaId}</h1>
        </div>
    );
}
