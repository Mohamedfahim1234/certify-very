import { Router } from "express";
import { OTPController } from "../controller/user/otp.js";
import { loginController } from "../controller/user/login.js";

const router = Router();

router.post('/request-otp', OTPController);
router.post('/login', loginController);

export default router;