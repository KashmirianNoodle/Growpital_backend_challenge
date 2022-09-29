import Joi from "joi";

const validateAadhar = Joi.object({
    aadharNumber: Joi.required()
})


const validateOTP = Joi.object({
    otp: Joi.required()
})

export { validateAadhar, validateOTP }