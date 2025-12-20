import { Elysia } from "elysia";
import { getDomainsHandler, getSkillsHandler } from "../controllers/optionsController";

/**
 * Options routes (domains & skills for selection)
 */
const optionsRoutes = new Elysia()
  .get("/domains", getDomainsHandler, {
    detail: {
      tags: ["Domains & Skills"],
      summary: "Get all domains",
      description: "Fetch all available domains for user selection",
    },
  })
  .get("/skills", getSkillsHandler, {
    detail: {
      tags: ["Domains & Skills"],
      summary: "Get all skills",
      description: "Fetch all available skills for user selection",
    },
  });

export default optionsRoutes;
