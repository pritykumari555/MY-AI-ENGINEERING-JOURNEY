const mongoose=require('mongoose');

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("DATABASE IS CONNECTED");

    }catch(error){
        console.log("NO DATABASE CONNECTED");

    }
}
module.exports=connectDB;