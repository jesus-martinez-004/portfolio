import { Router } from "express";
import { AuthService } from "../../core/services/auth.service";

const router = Router();
const authService = new AuthService();

/**
 * POST /auth/register
 * Body: { email, password }
 */
router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await authService.register(email, password);
        // No devolvemos contraseña
        const { password: _, ...safe } = user as any;
        res.json(safe);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * POST /auth/login
 * Body: { email, password }
 * Respuesta: { accessToken, refreshToken, user }
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = await authService.login(email, password);
        res.json(data);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * POST /auth/refresh
 * Body: { refreshToken }
 * Devuelve nuevos accessToken y refreshToken
 */
router.post("/refresh", async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const tokens = await authService.refresh(refreshToken);
        res.json(tokens);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * POST /auth/logout
 * Body: { refreshToken }
 * Elimina refresh token del servidor
 */
router.post("/logout", async (req, res) => {
    try {
        const { refreshToken } = req.body;
        await authService.logout(refreshToken);
        res.json({ ok: true });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
