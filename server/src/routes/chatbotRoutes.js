import express from 'express';
import rateLimit from 'express-rate-limit';
import { chatEndpoint, chatbotConfig } from '../controllers/chatbotController.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
const router=express.Router();
const limiter=rateLimit({windowMs:5*60*1000,limit:40,standardHeaders:'draft-8',legacyHeaders:false,message:{message:'Please wait a moment before sending more messages.'}});
router.get('/config',chatbotConfig);
router.post('/chat',limiter,optionalAuth,chatEndpoint);
export default router;
