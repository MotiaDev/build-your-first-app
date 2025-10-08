// steps/typescript/create-pet.step.ts
import { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { TSStore } from './ts-store';

// Define request body schema with Zod for type safety and validation
const createPetSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  species: z.enum(['dog', 'cat', 'bird', 'other']),
  ageMonths: z.number().int().min(0, 'Age must be a positive number'),
  weightKg: z.number().positive().optional(),
  symptoms: z.array(z.string()).optional()
});

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'TsCreatePet',
  path: '/ts/pets',
  method: 'POST',
  emits: ['ts.pet.created', 'ts.feeding.reminder.enqueued'],
  flows: ['TsPetManagement']
};

export const handler: Handlers['TsCreatePet'] = async (req, { emit, logger, streams, traceId }) => {
  try {
    // Zod automatically validates and parses the request body
    const validatedData = createPetSchema.parse(req.body);

    const pet = TSStore.create({
      name: validatedData.name,
      species: validatedData.species,
      ageMonths: validatedData.ageMonths,
      weightKg: validatedData.weightKg,
      symptoms: validatedData.symptoms
    });

    if (logger) {
      logger.info('🐾 Pet created', { petId: pet.id, name: pet.name, species: pet.species, status: pet.status });
    }

    // Create & return the initial stream record (following working pattern)
    const result = await streams.petCreation.set(traceId, 'message', { 
      message: `Pet ${pet.name} (ID: ${pet.id}) created successfully - Species: ${pet.species}, Age: ${pet.ageMonths} months, Status: ${pet.status}` 
    });

    if (emit) {
      await emit({
        topic: 'ts.pet.created',
        data: { petId: pet.id, event: 'pet.created', name: pet.name, species: validatedData.species, traceId }
      } as any);

      // Enqueue feeding reminder background job
      await emit({
        topic: 'ts.feeding.reminder.enqueued',
        data: { petId: pet.id, enqueuedAt: Date.now(), traceId }
      } as any);
    }

    return { 
      status: 201, 
      body: result 
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        status: 400,
        body: {
          message: 'Validation error',
          errors: error.errors
        }
      };
    }

    return {
      status: 500,
      body: { message: 'Internal server error' }
    };
  }
};