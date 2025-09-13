
const globalError = (err,req,res,next) => {
    const statuscode = err.statusCode || 500

    return res.status(statuscode).json({
        error:err,
        errorStack:err.stack
    })
}

export default globalError