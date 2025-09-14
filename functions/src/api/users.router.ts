import { Router } from "express";
import { z } from "zod";

import { db } from "../config/firebase";
import { signToken } from "../infra/security/jwt";

const router = Router();
const emailSchema = z.object({ email: z.email() });

/**
 * GET /users/find?email=...
 * Response: { userId: string, email: string, token: string } si existe
 *           400 si no se provee email
 *           404 si no existe
 */
router.get("/users/find", async (req, res) => {
  const email = String(req.query.email ?? "").toLowerCase();
  if (!email) {
    return res.status(400).json({ error: "email required" });
  }

  const qs = await db.collection("users").where("email", "==", email).limit(1).get();
  if (qs.empty) {
    return res.status(404).json({ error: "not found" });
  }

  const doc = qs.docs[0];
  const user = { userId: doc.id, email: doc.get("email") as string };
  const token = signToken(user.userId, user.email);

  return res.json({ ...user, token });
});

/**
 * POST /auth/login-or-create
 * Body: { email: string }
 * Response: Si existe, { user: { id: string, email: string }, token: string }
 *          Si no existe, crea el usuario y responde igual.
 */
router.post("/login-or-create", async (req, res) => {
  try {
    const parsed = emailSchema.safeParse(req.body);
    if (!parsed.success) {return res.status(400).json({ error: "Invalid email" });}

    const { email } = parsed.data;

    const snap = await db.collection("users").where("email", "==", email).limit(1).get();
    let userId: string;

    if (snap.empty) {
      const ref = await db.collection("users").add({ email, createdAt: Date.now() });
      userId = ref.id;
      const token = signToken(userId, email);
      return res.json({ user: { id: userId, email }, token, created: true });
    } else {
      userId = snap.docs[0].id;
      const token = signToken(userId, email);
      return res.json({ user: { id: userId, email }, token, created: false });
    }
  } catch (_err) {
    console.error("Error in /auth/login-or-create:", _err);
    return res.status(500).json({ error: "Internal server error", details: _err instanceof Error ? _err.message : String(_err) });
  }
});

export default router;
