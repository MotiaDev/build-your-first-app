import { ApiRouteConfig, Handlers } from "motia";
import { z } from "zod";

export const config: ApiRouteConfig = {
  type: "api",
  name: "CreatePet",
  description: "Create a new pet in the store",
  method: "POST",
  path: "/pets",

  bodySchema: z.object({
    name: z.string(),
    breed: z.string(),
    age: z.number(),
  }),

  responseSchema: {
    200: z.object({
      id: z.string(),
      name: z.string(),
      breed: z.string(),
      age: z.number(),
    }),
  },
  emits: [],
  // flows: ["create-pet-flow"],
};

export const handler: Handlers["CreatePet"] = async (req, { logger }) => {
  logger.info("Creating new pet", { body: req.body });

  // In a real app, you will save to a database
  const newPet = {
    id: Date.now().toString(),
    ...req.body,
  };

  return {
    status: 200,
    body: newPet,
  };
};
