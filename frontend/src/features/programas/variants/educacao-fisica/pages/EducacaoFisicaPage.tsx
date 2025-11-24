import { useEffect } from 'react';
import { useArea } from '@/contexts/AreaContext';
import EmConstrucaoPage from '../../pages/EmConstrucaoPage';

export default function EducacaoFisicaPage() {
    const { setCurrentArea } = useArea();

    useEffect(() => {
        setCurrentArea('educacao-fisica');
    }, [setCurrentArea]);

    return <EmConstrucaoPage areaName="Educação Física" pageTitle="Educação Física" />;
}
