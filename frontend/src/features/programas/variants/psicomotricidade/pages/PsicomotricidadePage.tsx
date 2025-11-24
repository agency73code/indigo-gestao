import { useEffect } from 'react';
import { useArea } from '@/contexts/AreaContext';
import EmConstrucaoPage from '../../pages/EmConstrucaoPage';

export default function PsicomotricidadePage() {
    const { setCurrentArea } = useArea();

    useEffect(() => {
        setCurrentArea('psicomotricidade');
    }, [setCurrentArea]);

    return <EmConstrucaoPage areaName="Psicomotricidade" pageTitle="Psicomotricidade" />;
}
