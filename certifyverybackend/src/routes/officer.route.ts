import { Router } from "express";
import multer from "multer";
import { signupController } from "../controller/officer/auth/signup";
import { loginController } from "../controller/officer/auth/login";
import { authenticateOffice } from "../middleware/officer.middleware";
import { getAllCertificatesController, updateCertificateStatusController } from "../controller/officer/certificate";
import { getOfficerProfileController, updateOfficerProfileController } from "../controller/officer/profile";
import { forgotPasswordController } from "../controller/officer/auth/forgotpassword";
import { verifyFileController } from "../controller/user/verify.controller";
import { verifyCertificateController } from "../controller/user/certificate-apply";

const Officerouter = Router();
const memoryUpload = multer({ storage: multer.memoryStorage() });

Officerouter.post('/signup', signupController);
Officerouter.post('/login', loginController);
Officerouter.get('/profile', authenticateOffice, getOfficerProfileController);
Officerouter.put('/profile/update', authenticateOffice, updateOfficerProfileController);
Officerouter.get('/certificates', authenticateOffice, getAllCertificatesController);
Officerouter.put('/certificate/:certificateId/status', authenticateOffice, updateCertificateStatusController);
Officerouter.put('/forgot-password', forgotPasswordController);
Officerouter.get('/certificate/verify/:hash', authenticateOffice, verifyCertificateController);
Officerouter.post('/certificate/verify-upload', authenticateOffice, memoryUpload.single('certificate'), verifyFileController);

export default Officerouter;