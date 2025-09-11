import { Router } from "express";
import { z } from "zod";

import { db } from "../config/firebase";

const router = Router();

const todoSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(""),
  completed: z.boolean().optional().default(false),
});

router.get("/:userId/todos", async (req, res) => {
  const { userId } = req.params;
  const qs = await db.collection("users").doc(userId).collection("todos")
    .orderBy("createdAt", "desc").get();
  res.json(qs.docs.map((d) => ({ id: d.id, ...d.data() })));
});

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

router.put("/:userId/todos/:todoId", async (req, res) => {
  const { userId, todoId } = req.params;
  const parsed = todoSchema.partial().safeParse(req.body);
  if (!parsed.success) {return res.status(400).json({ error: "Invalid payload" });}
  await db.collection("users").doc(userId).collection("todos").doc(todoId).update(parsed.data);
  const doc = await db.collection("users").doc(userId).collection("todos").doc(todoId).get();
  return res.json({ id: doc.id, ...doc.data() });
});

router.delete("/:userId/todos/:todoId", async (req, res) => {
  const { userId, todoId } = req.params;
  await db.collection("users").doc(userId).collection("todos").doc(todoId).delete();
  res.status(204).send();
});

export default router;
