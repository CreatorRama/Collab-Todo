import {mongoose} from 'mongoose'
import dotenv from 'dotenv';
dotenv.config();  

export default async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully!');
   
  } catch (error) {
    console.error('Connection error:', error);
    throw error;
  }
}