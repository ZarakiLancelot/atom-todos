import { Router } from "express";
import { z } from "zod";

import { db } from "../config/firebase";
import { signToken } from "../infra/security/jwt";

const router = Router();
const emailSchema = z.object({ email: z.email() });

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
    } else {
      userId = snap.docs[0].id;
    }

    const token = signToken(userId, email);
    return res.json({ user: { id: userId, email }, token });
  } catch (_err) {
    console.error("Error in /auth/login-or-create:", _err);
    return res.status(500).json({ error: "Internal server error", details: _err instanceof Error ? _err.message : String(_err) });
  }
});

export default router;
