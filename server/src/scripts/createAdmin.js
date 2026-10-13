import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { connectDB } from '../config/db.js';

const [, , name, email, password] = process.argv;
if (!name || !email || !password) { console.error('Usage: npm run create-admin -- "Admin Name" admin@example.com StrongPassword'); process.exit(1); }
await connectDB();
const normalized=email.trim().toLowerCase();
const hash=await bcrypt.hash(password,12);
const user=await User.findOneAndUpdate({email:normalized},{name:name.trim(),email:normalized,password:hash,role:'admin',isActive:true},{upsert:true,new:true,setDefaultsOnInsert:true});
console.log(`Admin ready: ${user.email}`);
await mongoose.disconnect();
