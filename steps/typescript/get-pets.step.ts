import { ApiRouteConfig, Handlers } from "motia";
import { z } from "zod";

export const config: ApiRouteConfig = {
  type: "api",
  name: "GetPets",
  description: "Get all pets in the store",
  method: "GET",
  path: "/typescript/pets",
  responseSchema: {
    200: z.object({
      pets: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          breed: z.string(),
          age: z.number(),
        })
      ),
    }),
  },
  emits: [],
  flows: ["api-endpoints-typescript"],
};

export const handler: Handlers["GetPets"] = async (req, { logger }) => {
  logger.info("Getting all pets");

  // In a real app, you will query from a database
  const pets = [
    { id: "1", name: "Buddy", breed: "Golden Retriever", age: 3 },
    { id: "2", name: "Luna", breed: "Border Collie", age: 2 },
    { id: "3", name: "Max", breed: "German Shepherd", age: 5 },
  ];

  return {
    status: 200,
    body: { pets },
  };
};
