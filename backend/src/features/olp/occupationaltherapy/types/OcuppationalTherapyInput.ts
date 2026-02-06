import type { UploadedFile } from "../../types/CreateSessionParams.js";
import type { CreateAreaSessionData } from "../../types/olp.schema.js";

type OccupationalAreas = "terapia-ocupacional";

export type OccupationalTherapyInput = Extract<CreateAreaSessionData, { area: OccupationalAreas }> & {
    files: UploadedFile[];
}