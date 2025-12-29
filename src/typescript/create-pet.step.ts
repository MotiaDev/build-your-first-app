// src/typescript/create-pet.step.ts
import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { TSStore } from './ts-store'

// Define request body schema with Zod for type safety and validation
const createPetSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  species: z.enum(['dog', 'cat', 'bird', 'other']),
  ageMonths: z.number().int().min(0, 'Age must be a positive number'),
})

// Define event data schemas for type safety
const feedingReminderEventSchema = z.object({
  petId: z.string(),
  enqueuedAt: z.number(),
})

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'TsCreatePet',
  path: '/ts/pets',
  method: 'POST',
  emits: ['ts.feeding.reminder.enqueued'],
  flows: ['TsPetManagement'],
  // Add schema validation
  bodySchema: createPetSchema,
}

export const handler: Handlers['TsCreatePet'] = async (
  req,
  { emit, logger }
) => {
  try {
    // Zod automatically validates and parses the request body
    const validatedData = createPetSchema.parse(req.body)

    const pet = TSStore.create({
      name: validatedData.name,
      species: validatedData.species,
      ageMonths: validatedData.ageMonths,
    })

    if (logger) {
      logger.info('🐾 Pet created', {
        petId: pet.id,
        name: pet.name,
        species: pet.species,
        status: pet.status,
      })
    }

    if (emit) {
      // Type-safe event emission
      const feedingReminderData = feedingReminderEventSchema.parse({
        petId: pet.id,
        enqueuedAt: Date.now(),
      })

      // Enqueue feeding reminder background job
      await (emit as any)({
        topic: 'ts.feeding.reminder.enqueued',
        data: feedingReminderData,
      })
    }

    return { status: 201, body: pet }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return validation errors with proper HTTP status
      return {
        status: 400,
        body: {
          message: 'Validation error',
          errors: error.errors,
        },
      }
    }

    // Handle unexpected errors
    if (logger) {
      logger.error('❌ Pet creation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }

    return {
      status: 500,
      body: { message: 'Internal server error' },
    }
  }
}
