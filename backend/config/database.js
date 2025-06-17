import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI , {
        dbName: 'CF_STUDENTS'
    });

    console.log(`Database is Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB Connection', error.message);
    process.exit(1); 
  }
};

export default connectDB;
