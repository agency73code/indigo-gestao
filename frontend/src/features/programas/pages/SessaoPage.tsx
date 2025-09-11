import { useParams } from 'react-router-dom';

export default function SessaoPage() {
    const { sessaoId } = useParams();

    return (
        <div style={{ padding: 24 }}>
            <h1>Sessão — ID: {sessaoId}</h1>
        </div>
    );
}
