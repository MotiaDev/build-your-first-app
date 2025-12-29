// steps/javascript/get-pet.step.js
import { get } from './js-store.js';

export const config = { type:'api', name:'JsGetPet', path:'/js/pets/:id', method:'GET', emits: [], flows: ['JsPetManagement'] };
export const handler = async (req) => {
  const pet = get(req.pathParams.id);
  return pet ? { status:200, body:pet } : { status:404, body:{ message:'Not found' } };
};
