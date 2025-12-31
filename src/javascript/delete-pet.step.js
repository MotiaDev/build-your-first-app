// src/javascript/delete-pet.step.js
import { remove } from './js-store.js'

export const config = {
  type: 'api',
  name: 'JsDeletePet',
  path: '/js/pets/:id',
  method: 'DELETE',
  emits: [],
  flows: ['JsPetManagement'],
}
export const handler = async (req) => {
  const ok = remove(req.pathParams.id)
  return ok
    ? { status: 204, body: {} }
    : { status: 404, body: { message: 'Not found' } }
}
