import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SettingsCard } from '@/components/configuracoes/SettingsCard';

export function PreferenciasSection() {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <SettingsCard
                title="Localização"
                description="Idioma, fuso horário e formatos regionais"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="idioma">Idioma</Label>
                        <Select defaultValue="pt-br">
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o idioma" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Español</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fuso">Fuso Horário</Label>
                        <Select defaultValue="america-sao-paulo">
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o fuso horário" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="america-sao-paulo">
                                    América/São_Paulo (UTC-3)
                                </SelectItem>
                                <SelectItem value="america-new-york">
                                    América/New_York (UTC-5)
                                </SelectItem>
                                <SelectItem value="europe-london">
                                    Europa/Londres (UTC+0)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard title="Formatação" description="Como datas, horas e números são exibidos">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="formato-data">Formato de Data</Label>
                        <Select defaultValue="dd-mm-yyyy">
                            <SelectTrigger>
                                <SelectValue placeholder="Formato de data" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dd-mm-yyyy">DD/MM/AAAA</SelectItem>
                                <SelectItem value="mm-dd-yyyy">MM/DD/AAAA</SelectItem>
                                <SelectItem value="yyyy-mm-dd">AAAA-MM-DD</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="formato-hora">Formato de Hora</Label>
                        <Select defaultValue="24h">
                            <SelectTrigger>
                                <SelectValue placeholder="Formato de hora" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="24h">24 horas (14:30)</SelectItem>
                                <SelectItem value="12h">12 horas (2:30 PM)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </SettingsCard>
        </div>
    );
}
