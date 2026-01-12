import type { Prisma } from '@prisma/client';
import type { AnamnesePayload } from '../../../schemas/anamnese.schema.js';
import { maybeCreateList } from './helpers.js';

type FamilyContextRoutinePayload = AnamnesePayload['contextoFamiliarRotina'];

type FamilyContextRoutineCreateInput = Pick<
    Prisma.anamneseCreateInput,
    'contexto_familiar_rotina'
>;

export function buildFamilyContextRoutine(
    familyContextRoutine: FamilyContextRoutinePayload,
): FamilyContextRoutineCreateInput {
    const historicosFamiliares = maybeCreateList(
        familyContextRoutine.historicosFamiliares,
        (historico) => ({
            condicao_diagnostico: historico.condicaoDiagnostico ?? null,
            parentesco: historico.parentesco ?? null,
            observacao: historico.observacao ?? null,
        }),
    );

    const atividadesRotina = maybeCreateList(familyContextRoutine.atividadesRotina, (atividade) => ({
        atividade: atividade.atividade ?? null,
        horario: atividade.horario ?? null,
        responsavel: atividade.responsavel ?? null,
        frequencia: atividade.frequencia ?? null,
        observacao: atividade.observacao ?? null,
    }));

    return {
        contexto_familiar_rotina: {
            create: {
                ...(historicosFamiliares && {
                    historicos_familiares: historicosFamiliares,
                }),
                ...(atividadesRotina && {
                    atividades_rotina: atividadesRotina,
                }),
            },
        },
    };
}
