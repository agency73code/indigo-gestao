import { useEffect } from 'react';
import { useArea } from '@/contexts/AreaContext';
import EmConstrucaoPage from '../../pages/EmConstrucaoPage';

export default function NeuropsicologiaPage() {
    const { setCurrentArea } = useArea();

    useEffect(() => {
        setCurrentArea('neuropsicologia');
    }, [setCurrentArea]);

    return <EmConstrucaoPage areaName="Neuropsicologia" pageTitle="Neuropsicologia" />;
}
