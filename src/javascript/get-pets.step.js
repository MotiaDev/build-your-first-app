// src/javascript/get-pets.step.js
import { create, list, get, update, remove, softDelete, findDeletedPetsReadyToPurge, updateStatus, updateProfile } from './js-store.js';

export const config = { type:'api', name:'JsListPets', path:'/js/pets', method:'GET', emits: [], flows: ['JsPetManagement'] };
export const handler = async () => ({ status:200, body:list() });
