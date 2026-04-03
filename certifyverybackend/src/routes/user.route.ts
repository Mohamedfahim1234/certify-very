import { Router } from "express";
import multer from "multer";
import { OTPController } from "../controller/user/auth/otp";
import { loginController } from "../controller/user/auth/login";
import { signupController } from "../controller/user/auth/signup";
import { authenticateUser } from "../middleware/user.middleware";
import { applyCertificateController, getUserCertificatesController, verifyCertificateController } from "../controller/user/certificate-apply.js";
import { verifyFileController } from "../controller/user/verify.controller";
import { getUserProfileController, updateUserProfileController } from "../controller/user/profile";
import { ask, ingest } from "../controller/ai/rag";

const router = Router();

// Memory storage for verification (no need to save files permanently)
const memoryUpload = multer({ storage: multer.memoryStorage() });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            return cb(new Error('Only JPEG, PNG images and PDF files are allowed'));
        }
    }
});

router.post('/request-otp', OTPController);
router.post('/login', loginController);
router.post('/signup', signupController);
router.get('/profile', authenticateUser, getUserProfileController);
router.put('/profile/update', authenticateUser, updateUserProfileController);
router.post('/apply-certificate', authenticateUser, upload.array('documentUrl',), applyCertificateController);
router.get('/certificates', authenticateUser, getUserCertificatesController);
router.post('/ingest', authenticateUser, ingest);
router.post('/ask', authenticateUser, ask);
router.get('/certificate/verify/:hash', verifyCertificateController);
router.post('/certificate/verify-upload', authenticateUser, memoryUpload.single('certificate'), verifyFileController);

export default router;