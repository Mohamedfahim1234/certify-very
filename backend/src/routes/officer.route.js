import { Router } from "express";
import { signupController } from "../controller/officer/signup.js";
import { loginController } from "../controller/officer/login.js";

const Officerouter = Router();

Officerouter.post('/signup', signupController);
Officerouter.post('/login',loginController);

export default Officerouter;