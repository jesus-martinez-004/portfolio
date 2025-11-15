import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

// Registrar usuario
router.post("/register", AuthController.register);

// Login
router.post("/login", AuthController.login);

// Refresh token
router.post("/refresh", AuthController.refresh);

// Logout
router.post("/logout", AuthController.logout);

export default router;
