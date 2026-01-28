import type { UploadedFile } from "../../types/CreateSessionParams.js";
import type { CreateAreaSessionData } from "../../types/olp.schema.js";

type MusicAreas = "musicoterapia";

export type MusictherapyInput = Extract<CreateAreaSessionData, { area: MusicAreas }> & {
    files: UploadedFile[];
}