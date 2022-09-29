import express, { Router } from "express"
import bodyParser from "body-parser"
import { executeAadharCrudOperations } from "./model/aadharCrud.js";
import * as controller from "./controllers/otp.controller.js"
import validate from "express-joi-validation"
import { validateAadhar, validateOTP } from "./validations/otp_aadhar.validation.js"


// inserting a aadhar document into db for testing.
await executeAadharCrudOperations();

//express, bodyparser, validate
const validator = validate.createValidator({})
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//routes
const baseURL = Router()
app.use('/growpital.com', baseURL)

baseURL.route('/verification/aadhar/otp')
    .post(validator.body(validateAadhar), controller.generate);

baseURL.route('/verification/aadhar/verify')
    .post(validator.body(validateOTP), controller.verify);


app.listen(3000, function () {
    console.log("server started on port 3000")
})

