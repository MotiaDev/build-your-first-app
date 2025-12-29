// src/typescript/delete-pet.step.ts
import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { TSStore } from './ts-store'

// Define path parameters schema for type safety
const pathParamsSchema = z.object({
  id: z.string().min(1, 'Pet ID is required'),
})

// Define event data schema for type safety
export const config: ApiRouteConfig = {
  type: 'api',
  name: 'TsDeletePet',
  path: '/ts/pets/:id',
  method: 'DELETE',
  emits: [],
  flows: ['TsPetManagement'],
}

export const handler: Handlers['TsDeletePet'] = async (
  req,
  { emit, logger }
) => {
  try {
    // Validate path parameters
    const { id } = pathParamsSchema.parse(req.pathParams)

    const deletedPet = TSStore.softDelete(id)

    if (!deletedPet) {
      return {
        status: 404,
        body: { message: 'Pet not found' },
      }
    }

    if (logger) {
      logger.info('🗑️ Pet soft deleted', {
        petId: deletedPet.id,
        name: deletedPet.name,
        purgeAt: new Date(deletedPet.purgeAt!).toISOString(),
      })
    }

    // Pet soft deleted successfully

    return {
      status: 202,
      body: {
        message: 'Pet scheduled for deletion',
        petId: deletedPet.id,
        purgeAt: deletedPet.purgeAt,
      },
    }
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

    // Handle unexpected errors
    if (logger) {
      logger.error('❌ Pet deletion failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }

    return {
      status: 500,
      body: { message: 'Internal server error' },
    }
  }
}
