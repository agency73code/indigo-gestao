import { useEffect } from 'react';
import { useArea } from '@/contexts/AreaContext';
import EmConstrucaoPage from '../../pages/EmConstrucaoPage';

export default function FisioterapiaPage() {
    const { setCurrentArea } = useArea();

    useEffect(() => {
        setCurrentArea('fisioterapia');
    }, [setCurrentArea]);

    return <EmConstrucaoPage areaName="Fisioterapia" pageTitle="Fisioterapia" />;
}
