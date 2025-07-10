import { z } from 'zod';

export const PersonaDataSchema = z.object({
  // Accept any structure for now, as the persona JSON is complex and nested
  // You can refine this schema for stricter validation if needed
}).passthrough();

export const PersonaInsertSchema = z.object({
  userId: z.string().uuid(), // UUID string
  data: PersonaDataSchema,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const PersonaSelectSchema = PersonaInsertSchema.extend({
  id: z.string().uuid(),
});

export type PersonaInsert = z.infer<typeof PersonaInsertSchema>;
export type PersonaSelect = z.infer<typeof PersonaSelectSchema>; 