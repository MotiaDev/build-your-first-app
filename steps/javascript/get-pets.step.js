const { z } = require("zod");

const config = {
  type: "api",
  name: "GetPets",
  description: "Get all pets in the store",
  method: "GET",
  path: "/javascript/pets",
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
  flows: ["api-endpoints-javascript"],
};

const handler = async (req, { logger }) => {
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

module.exports = { config, handler };
