import type { UploadedFile } from "../../types/CreateSessionParams.js";
import type { CreateAreaSessionData } from "../../types/olp.schema.js";

type PhysioAreas = "fisioterapia" | "psicomotricidade" | "educacao-fisica";

export type PhysiotherapyInput = Extract<CreateAreaSessionData, { area: PhysioAreas }> & {
    files: UploadedFile[];
}