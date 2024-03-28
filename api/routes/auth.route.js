import express from "express";
import { signup, singin, google, signOut } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", singin);
router.post("/google", google);
router.get("/signout", signOut);

export default router;
