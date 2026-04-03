import { Router } from "express";
import multer from "multer";
import { loginController } from "../controller/higher-officer/auth/login";
import { signupController } from "../controller/higher-officer/auth/signup";
import { getAllCertificatesController, updateCertificateStatusController } from "../controller/higher-officer/certificate";
import { getHigherProfileController, updateHigherProfileController } from "../controller/higher-officer/profile";
import { higherAuthMiddleware } from "../middleware/higher.middleware";
import { forgotPasswordController } from "../controller/higher-officer/auth/forgotpassword";
import { verifyFileController } from "../controller/user/verify.controller";
import { verifyCertificateController } from "../controller/user/certificate-apply";

const higherRouter = Router();
const memoryUpload = multer({ storage: multer.memoryStorage() });

higherRouter.post('/login', loginController);
higherRouter.post('/signup', signupController);
higherRouter.get('/certificates/list', higherAuthMiddleware, getAllCertificatesController);
higherRouter.get('/profile', higherAuthMiddleware, getHigherProfileController);
higherRouter.put('/profile/update', higherAuthMiddleware, updateHigherProfileController);
higherRouter.put('/certificate/status/update/:certificateId', higherAuthMiddleware, updateCertificateStatusController);
higherRouter.put('/forgot-password', forgotPasswordController);
higherRouter.get('/certificate/verify/:hash', higherAuthMiddleware, verifyCertificateController);
higherRouter.post('/certificate/verify-upload', higherAuthMiddleware, memoryUpload.single('certificate'), verifyFileController);

export default higherRouter;