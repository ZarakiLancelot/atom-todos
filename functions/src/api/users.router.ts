import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { db } from "../config/firebase";


const router = Router();
const bodySchema = z.object({ email: z.email() });

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

router.post("/login-or-create", async (req, res) => {
  try {
    const parsed = bodySchema.safeParse(req.body);
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

    const token = jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ user: { id: userId, email }, token });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
