import nodemailer  from 'nodemailer'
import config from "./envConfig.js"
const transpoter = nodemailer.createTransport({
    host:"smtp-relay.brevo.com",
    port:587,
    auth:{
        user:config.SMPT_USER,
        pass:config.SMPT_PASS
    }
})

export default transpoter;