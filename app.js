import express, { Router } from "express"
import bodyParser from "body-parser"
import { connectToDatabase } from "./model/db.js"
import otpGenerator from "otp-generator"
import { executeAadharCrudOperations } from "./model/aadharCrud.js";


//connect to mongodb and get client instance.
const url = 'mongodb://localhost:27017'
const client = await connectToDatabase(url)
const aadhar_collection = client.db('growpital').collection('aadhar_card_collection')
const otp_collection = client.db("growpital").collection('otp_db')

// inserting a aadhar document into db for testing.
await executeAadharCrudOperations();

//express, bodyparser
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//routes
const baseURL = Router()
app.use('/growpital.com', baseURL)


baseURL.post('/verification/aadhar/otp', (req, res) => {
    const { aadharNumber } = req.body
    // make the right api call to the CIDR database for verification.
    // forward the aadhar number to the CIDR database or the (aadhar identification provider) and verify the authencity of the aadhaar card accordingly.
    // for testing purposes i've used a simple local database with already stored aadhar card details for verification.
    if (!aadharNumber) {
        const response = { "Status": "Failure", "Message": "AadharNumber not provided" }
        return res.status(400).send(response)

    }
    aadhar_collection.findOne({ aadhar_number: parseInt(aadharNumber) }, function (err, docs) {
        if (docs) {
            const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, specialChars: false, upperCaseAlphabets: false })
            const now = new Date();
            const otp_object = {
                otp: otp,
                aadhar_number: parseInt(aadharNumber),
                creationTime: (now.getTime()),
                expirationTime: (now.getTime() + 600000), //10 minutes from now
                verified: false
            }
            otp_collection.insertOne(otp_object, function (err, docs) {
                console.log(docs)
                const response = { "Status": "Success", "Message": "Otp Sent", "OTP": otp }
                // THe otp would be send by the aadhar identification provider.
                //the client would receive it by phone.
                // for testing we will send the otp ourselves right here.
                return res.status(202).send(response)
            })
        } else {
            const response = { "Status": "Failure", "Message": "Invalid Aadhaar Number" }
            return res.status(404).send(response)
        }
    });
    //we need a ref_id to store this event
})

baseURL.post('/verification/aadhar/verify', (req, res) => {
    const { otp } = req.body
    if (!otp) {
        const response = { "Status": "Failure", "Message": "OTP not provided" }
        return res.status(400).send(response)
    }
    // recieve the otp and forward to the right handler to get information about the customer. 
    // for testing we'll be verifying the otp that we've sent.
    const now = new Date().getTime()
    otp_collection.findOne({ otp: otp, verified: false, expirationTime: { $gt: now } }, function (err, otp_object) {
        if (otp_object) {
            otp_collection.updateOne({ otp: otp }, { $set: { verified: true } })
            aadhar_collection.findOne({ aadhar_number: parseInt(otp_object.aadhar_number) }, function (err, docs) {
                const response = { "Status": "Success", "Message": "Aadhar Card exists", "Details": { ...docs } }
                return res.status(202).send(response)
            })
        } else {
            const response = { "Status": "Failure", "Message": "Invalid OTP " }
            return res.status(404).send(response)
        }
    })
    ////we need a ref_id to store this event
})


app.listen(3000, function () {
    console.log("server started on port 3000")
})


// Improvements/bugs found

// separate different layers
// too much nested code
// maybe use promises instead of callbacks
// handle errors in db queries
// close client instance for mongodb
