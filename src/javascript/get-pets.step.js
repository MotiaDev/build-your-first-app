// steps/javascript/get-pets.step.js
import { list } from './js-store.js';

export const config = { type:'api', name:'JsListPets', path:'/js/pets', method:'GET', emits: [], flows: ['JsPetManagement'] };
export const handler = async () => ({ status:200, body:list() });
