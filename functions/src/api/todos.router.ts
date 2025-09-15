import { Router } from "express";
import { z } from "zod";

import { db } from "../config/firebase";
import { requireAuth } from "../infra/security/requireAuth";

const router = Router();
router.use(requireAuth);

const todoSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(""),
  completed: z.boolean().optional().default(false),
});

const todoUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
});

/**
 * GET /users/:userId/todos
 * Response: [{ id: string, title: string, description: string, completed: boolean, createdAt: number }]
 */
router.get("/:userId/todos", async (req, res) => {
  const { userId } = req.params;
  const qs = await db
    .collection("users").doc(userId)
    .collection("todos").orderBy("createdAt", "desc")
    .get();

  const items = qs.docs.map(d => ({ id: d.id, ...d.data() }));
  return res.json(items);
});

/**
 * POST /users/:userId/todos
 * Body: { title: string, description?: string, completed?: boolean }
 * Response: { id: string, title: string, description: string, completed: boolean, createdAt: number }
 */
router.post("/:userId/todos", async (req, res) => {
  const { userId } = req.params;
  const parsed = todoSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const payload = { ...parsed.data, createdAt: Date.now() };
  const ref = await db.collection("users").doc(userId).collection("todos").add(payload);
  return res.status(201).json({ id: ref.id, ...payload });
});

/**
 * PUT /users/:userId/todos/:todoId
 * Body: { title?: string, description?: string, completed?: boolean }
 * Response: { id: string, title: string, description: string, completed: boolean, createdAt: number }
 */
router.put("/:userId/todos/:todoId", async (req, res) => {
  const { userId, todoId } = req.params;
  const parsed = todoUpdateSchema.safeParse(req.body);
  if (!parsed.success) {return res.status(400).json({ error: "Invalid payload" });}

  const changes = Object.fromEntries(
    Object.entries(parsed.data).filter(([_, v]) => v !== undefined),
  );

  const docRef = db.collection("users").doc(userId).collection("todos").doc(todoId);
  await docRef.update(changes);
  const doc = await docRef.get();

  return res.json({ id: doc.id, ...doc.data() });
});

/**
 * DELETE /users/:userId/todos/:todoId
 */
router.delete("/:userId/todos/:todoId", async (req, res) => {
  const { userId, todoId } = req.params;
  await db.collection("users").doc(userId).collection("todos").doc(todoId).delete();
  res.status(204).send();
});

export default router;
