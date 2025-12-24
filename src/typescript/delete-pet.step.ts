// src/typescript/delete-pet.step.ts
import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { TSStore } from './ts-store'

// Define path parameters schema for type safety
const pathParamsSchema = z.object({
  id: z.string().min(1, 'Pet ID is required'),
})

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'TsDeletePet',
  path: '/ts/pets/:id',
  method: 'DELETE',
  emits: [],
  flows: ['TsPetManagement'],
}

export const handler: Handlers['TsDeletePet'] = async (req) => {
  try {
    // Validate path parameters
    const { id } = pathParamsSchema.parse(req.pathParams)

    const deleted = TSStore.remove(id)

    if (!deleted) {
      return {
        status: 404,
        body: { message: 'Pet not found' },
      }
    }

    // DELETE operations typically return 204 No Content on success
    return { status: 204, body: {} }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        status: 400,
        body: {
          message: 'Invalid pet ID',
          errors: error.errors,
        },
      }
    }

    return {
      status: 500,
      body: { message: 'Internal server error' },
    }
  }
}
