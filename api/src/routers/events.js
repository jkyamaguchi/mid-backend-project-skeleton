import express from "express";
import {
  getEvents,
  getEventById,
  postEvent,
  patchEvent,
  removeEvent,
} from "#controllers/events.js";

const eventsRouter = express.Router();

/**
 * Events router (MVC example)
 *
 * This router demonstrates how HTTP routes are mapped to controller handlers
 * within the MVC structure used in this backend skeleton.
 *
 * Only some routes are required for the base trainee assignment.
 * Additional routes are included as OPTIONAL placeholders to illustrate
 * how the API structure may grow (for example with admin functionality).
 *
 * Optional routes should only be implemented if the trainee decides to
 * extend the project beyond the required scope.
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get paginated list of events
 *     description: Returns a paginated list of events. Pagination is zero-based.
 *     tags:
 *       - Events
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: false
 *         description: Search term matched against title and description (case-insensitive)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         required: false
 *         description: Page number (zero-based)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         required: false
 *         description: Number of items per page (max 100)
 *     responses:
 *       200:
 *         description: Paginated list of events
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedEvents'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
eventsRouter.get("/", getEvents);

/**
 * OPTIONAL ROUTE PLACEHOLDER
 *
 * Demonstrates how a "get single resource" endpoint would be added.
 * Not required in the base trainee assignment unless optional scope
 * is implemented.
 *
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid event ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
eventsRouter.get("/:id", getEventById);

/**
 * OPTIONAL ROUTE PLACEHOLDER
 *
 * Example of a "create event" endpoint (typically admin functionality).
 *
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create event (optional/admin)
 *     tags:
 *       - Events
 *     responses:
 *       501:
 *         description: Not implemented in base skeleton
 */
eventsRouter.post("/", postEvent);

/**
 * OPTIONAL ROUTE PLACEHOLDER
 *
 * Example of an "update event" endpoint.
 *
 * @swagger
 * /api/events/{id}:
 *   patch:
 *     summary: Update event (optional/admin)
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       501:
 *         description: Not implemented in base skeleton
 */
eventsRouter.patch("/:id", patchEvent);

/**
 * OPTIONAL ROUTE PLACEHOLDER
 *
 * Example of a "delete event" endpoint.
 *
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Delete event (optional/admin)
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       501:
 *         description: Not implemented in base skeleton
 */
eventsRouter.delete("/:id", removeEvent);

export default eventsRouter;
