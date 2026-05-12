import mongoose from "mongoose";
import logger from "../utils/logger.js";

const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        logger.info("MONGODB disconnected successfully");
        
    } catch (error) {
        logger.error({err: error},"MONGODB disconnect failed");        
        throw error;
    }

}

export default disconnectDB;