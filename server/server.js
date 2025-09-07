//Entry point
import app from "./app.js"
import config from "./src/config/envConfig.js"
import connectDataBase from "./src/config/db.config.js"
const startServer = async ()=>{
    await connectDataBase();
  app.listen(config.PORT ,()=>{
    console.log(`app lisen in ${config.PORT}`);
  })
}

startServer()