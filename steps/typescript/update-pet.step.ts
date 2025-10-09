// steps/typescript/update-pet.step.ts
import { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { TSStore } from './ts-store';

// Define path parameter schema
const pathParamsSchema = z.object({
  id: z.string().min(1, 'Pet ID is required')
});

// Define request body schema for selective updates
const updatePetSchema = z.object({
  name: z.string().min(1, 'Name is required').trim().optional(),
  species: z.enum(['dog', 'cat', 'bird', 'other']).optional(),
  ageMonths: z.number().int().min(0, 'Age must be a positive number').optional(),
  status: z.enum(['new','in_quarantine','healthy','available','pending','adopted','ill','under_treatment','recovered','deleted']).optional(),
  notes: z.string().optional(),
  nextFeedingAt: z.number().optional()
});

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'TsUpdatePet',
  path: '/ts/pets/:id',
  method: 'PUT',
  emits: ['ts.pet.status.update.requested'],
  flows: ['TsPetManagement']
};

export const handler: Handlers['TsUpdatePet'] = async (req, { emit, logger }) => {
  try {
    // Validate path parameters
    const { id } = pathParamsSchema.parse(req.pathParams);

    // Validate request body
    const validatedData = updatePetSchema.parse(req.body);

    // Check if pet exists
    const currentPet = TSStore.get(id);
    if (!currentPet) {
      return { status: 404, body: { message: 'Pet not found' } };
    }

    // Handle status updates through orchestrator
    if (validatedData.status && validatedData.status !== currentPet.status) {
      if (logger) {
        logger.info('👤 Staff requesting status change', {
          petId: id,
          currentStatus: currentPet.status,
          requestedStatus: validatedData.status
        });
      }

      // Emit to orchestrator for validation and processing
      if (emit) {
        await (emit as any)({
          topic: 'ts.pet.status.update.requested',
          data: {
            petId: id,
            event: 'status.update.requested',
            requestedStatus: validatedData.status,
            currentStatus: currentPet.status
          }
        });
      }

      // Return current pet - orchestrator will handle the actual status change
      return { status: 202, body: {
        message: 'Status change request submitted',
        petId: id,
        currentStatus: currentPet.status,
        requestedStatus: validatedData.status
      }};
    }

    // Handle non-status updates normally
    const patch: Partial<{ name: string; species: "dog" | "cat" | "bird" | "other"; ageMonths: number; notes: string; nextFeedingAt: number }> = {};

    if (validatedData.name !== undefined) patch.name = validatedData.name;
    if (validatedData.species !== undefined) patch.species = validatedData.species;
    if (validatedData.ageMonths !== undefined) patch.ageMonths = validatedData.ageMonths;
    if (validatedData.notes !== undefined) patch.notes = validatedData.notes;
    if (validatedData.nextFeedingAt !== undefined) patch.nextFeedingAt = validatedData.nextFeedingAt;

    const updated = TSStore.update(id, patch);
    return updated ? { status: 200, body: updated } : { status: 404, body: { message: 'Pet not found' } };

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