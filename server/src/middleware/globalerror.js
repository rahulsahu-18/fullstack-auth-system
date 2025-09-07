
const globalError = (err,req,res,next) => {
    const statuscode = err.statusCode || 500

    return err.status(statuscode).json({
        error:err,
        errorStack:err.stack
    })
}

export default globalError