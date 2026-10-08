import { documentTypes } from "./documents";
import { leadTypes } from "./leads";
import { objectTypes } from "./objects";

export const contentSchemaTypes = [...objectTypes, ...documentTypes];
export const leadsSchemaTypes = leadTypes;
