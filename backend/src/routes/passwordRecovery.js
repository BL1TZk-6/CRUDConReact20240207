import express from "express";
import multer from "multer";
import passwordRecoveryController from "../controllers/passwordRecoveryController.js";
import { validate } from "../middlewares/validate.js";
import {
  validatePasswordRecoveryRequestPayload,
  validatePasswordRecoveryConfirmPayload,
} from "../shared/validator.js";

const router = express.Router();
const upload = multer();

router
  .route("/")
  .post(
    upload.none(),
    validate(validatePasswordRecoveryRequestPayload),
    passwordRecoveryController.requestRecovery,
  );

router
  .route("/verify")
  .post(
    upload.none(),
    validate(validatePasswordRecoveryConfirmPayload),
    passwordRecoveryController.confirmRecovery,
  );

export default router;
