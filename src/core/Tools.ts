import { z } from "zod";
export interface Tools {
  name: string;
  description: string;
  schema: z.ZodType;
  // this line to be explained..
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}
