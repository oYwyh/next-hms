import { baseSchema } from "@/types/index.types";
import { z } from "zod";

export const addUserSchema = baseSchema;

export type TAddUserSchema = z.infer<typeof addUserSchema>