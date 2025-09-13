import cookieParser from "cookie-parser";
import express from "express"
import globalError from "./src/middleware/globalerror.js";
import config from "./src/config/envConfig.js"
import cors from 'cors'
import userRoute from "./src/user/userRoutes.js";

const app = express();

app.use(cors(
    {
        origin:[config.FRONTEND_DOMAIN],
        methods:['POST','PUT','GET','DELETE'],
        credentials:true
    }
));
app.use(express.json());
app.use(cookieParser());
app.use('/account',userRoute);
app.use(globalError);



export default app;
