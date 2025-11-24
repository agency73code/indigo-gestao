import { useEffect } from 'react';
import { useArea } from '@/contexts/AreaContext';
import EmConstrucaoPage from '../../pages/EmConstrucaoPage';

export default function PsicoterapiaPage() {
    const { setCurrentArea } = useArea();

    useEffect(() => {
        setCurrentArea('psicoterapia');
    }, [setCurrentArea]);

    return <EmConstrucaoPage areaName="Psicoterapia" pageTitle="Psicoterapia" />;
}
