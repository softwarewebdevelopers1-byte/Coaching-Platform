import mongoose from "mongoose";
import DotEnvConfig from "../configs/DotEnv.js";
function DatabaseConnection() {
    mongoose
        .connect(DotEnvConfig.MongoLocalUri)
        .then(() => {
        console.log("Database connected successfully");
    })
        .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    });
}
export default DatabaseConnection;
//# sourceMappingURL=ConnectDB.js.map