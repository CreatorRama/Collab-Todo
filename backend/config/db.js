import {mongoose} from 'mongoose'

export default async function connectToDatabase() {
  try {
    await mongoose.connect('mongodb+srv://ap410485:SeetaRam@amans-db.pleyh.mongodb.net/Collab-Todo?retryWrites=true&w=majority&appName=Amans-db');
    console.log('Connected successfully!');
   
  } catch (error) {
    console.error('Connection error:', error);
    throw error;
  }
}