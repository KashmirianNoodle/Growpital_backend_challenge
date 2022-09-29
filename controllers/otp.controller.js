import { connectToDatabase } from "./../model/db.js"
import otpGenerator from "otp-generator"

// this is not supposed to be here.
const url = 'mongodb://localhost:27017'
const client = await connectToDatabase(url)
const aadhar_collection = client.db('growpital').collection('aadhar_card_collection')
const otp_collection = client.db("growpital").collection('otp_db')

export async function generate(req, res) {
    const { aadharNumber } = req.body
    // make the right api call to the CIDR database for verification.
    // forward the aadhar number to the CIDR database or the (aadhar identification provider) and verify the authencity of the aadhaar card accordingly.
    // for testing purposes i've used a simple local database with already stored aadhar card details for verification.
    aadhar_collection.findOne({ aadhar_number: parseInt(aadharNumber) }, function (err, docs) {
        if (err) {
            return err
        }
        if (!docs) {
            const response = { "Status": "Failure", "Message": "Invalid Aadhaar Number" }
            return res.status(404).send(response)
        } else {
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
                if (err) {
                    return err
                }
                if (docs) {
                    const response = { "Status": "Success", "Message": "Otp Sent", "OTP": otp }
                    // THe otp would be send by the aadhar identification provider.
                    //the client would receive it by phone.
                    // for testing we will send the otp ourselves right here.
                    return res.status(202).send(response)
                }
            })
        }
    });
    //we need a ref_id to store this event
}

export async function verify(req, res) {
    const { otp } = req.body
    // recieve the otp and forward to the right handler to get information about the customer. 
    // for testing we'll be verifying the otp that we've sent.
    const now = new Date().getTime()
    otp_collection.findOne({ otp: otp, verified: false, expirationTime: { $gt: now } }, function (err, otp_object) {
        if (err) {
            return err
            // should we return a response to this not just err?
        }
        if (!otp_object) {
            const response = { "Status": "Failure", "Message": "Invalid OTP " }
            return res.status(404).send(response)
        } else {
            otp_collection.updateOne({ otp: otp }, { $set: { verified: true } })
            aadhar_collection.findOne({ aadhar_number: parseInt(otp_object.aadhar_number) }, function (err, docs) {
                if (err) {
                    return err
                }
                const response = { "Status": "Success", "Message": "Aadhar Card exists", "Details": { ...docs } }
                return res.status(202).send(response)
            })
        }
    })
    ////we need a ref_id to store this event
}


