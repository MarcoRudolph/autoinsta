import { z } from 'zod';

export const PersonaDataSchema = z.object({
  personality: z.object({
    name: z.string(),
    description: z.string(),
    childhoodExperiences: z.object({
      personalDevelopment: z.array(z.string()),
      sexuality: z.array(z.string()),
      generalExperiences: z.array(z.string()),
      socialEnvironmentFriendships: z.array(z.string()),
      educationLearning: z.array(z.string()),
      familyRelationships: z.array(z.string())
    }),
    emotionalTriggers: z.array(z.string()),
    characterTraits: z.array(z.string()),
    positiveTraits: z.object({
      socialCommunicative: z.array(z.string()),
      professionalCognitive: z.array(z.string()),
      personalIntrinsic: z.array(z.string())
    }),
    negativeTraits: z.array(z.string()),
    areasOfInterest: z.array(z.string()),
    communicationStyle: z.object({
      tone: z.string(),
      wordChoice: z.string(),
      responsePatterns: z.string(),
      humor: z.object({
        humorEnabled: z.boolean(),
        humorTypes: z.array(z.string()),
        humorIntensity: z.string(),
        humorExclusionTopics: z.array(z.string())
      })
    })
  }),
  productLinks: z.array(z.string()).optional().default([])
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
export type PersonaData = z.infer<typeof PersonaDataSchema>; 