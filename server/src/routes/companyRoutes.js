import express from 'express';
import { getCompanyProfile } from '../controllers/companyController.js';
const router = express.Router();
router.get('/', getCompanyProfile);
export default router;
