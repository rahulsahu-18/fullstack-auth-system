import config from "./envConfig.js"
import mongoose from "mongoose"

const connectDataBase = async () => {

    try {
        mongoose.connection.on("connected", () => {
            console.log("✅ Database connected successfully");
        });

        mongoose.connection.on("error", (err) => {
            console.error("❌ Error occurred while connecting:", err);
        });
        await mongoose.connect(config.DB_URL);
    } catch (error) {
        console.log("database not connected", error)
    }

}

export default connectDataBase;