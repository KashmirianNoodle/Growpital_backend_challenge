// this document is meant for data insertion for testing.
// uncomment function calls and run

import { connectToDatabase } from "./db.js";
import otpGenerator from "otp-generator"

export async function executeAadharCrudOperations() {
    const url = 'mongodb://localhost:27017'
    let mongoClient;
    try {
        mongoClient = await connectToDatabase(url);
        const db = mongoClient.db('growpital')
        const collection = db.collection('aadhar_card_collection')
        await createAadhaarCardDocument(collection)
        console.log("inserted documents")
    } finally {
        await mongoClient.close();
        console.log("disconnected from MongoDB")
    }
}


export async function createAadhaarCardDocument(collection) {
    var aadharCardDetails = {
        aadhar_number: 216378619131,
        care_of: "S/O: Fakkirappa Dollin",
        address: "D-98, vikas puri, Lucknow, Uttar Pradesh-223009",
        dob: "25-09-1993",
        email: "example@gmail.com",
        gender: "male",
        name: "a guy",
        photo_link: "",
        mobile_hash: "some_hash",
        split_address: {
            country: "india",
            district: "lucknow",
            house: "n-890",
            landmark: "opposite uloq school",
            pincode: "223009",
            postOffice: "",
            state: "Uttar Pradesh",
            Street: "",
            subdist: "",
            vtc: "Gomti Nagar S.O",
            year_of_birth: "1995"
        }
    }

    await collection.insertOne(aadharCardDetails);
}


export async function executeOTPcrudOperations() {
    const url = 'mongodb://localhost:27017'
    let mongoClient;
    try {
        mongoClient = await connectToDatabase(url);
        const db = mongoClient.db('growpital')
        const collection = db.collection('otp_db')
        await createOTPdocument(collection)
        console.log("inserted documents")
    } finally {
        await mongoClient.close();
    }
}


export async function createOTPdocument(collection) {
    const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, specialChars: false, upperCaseAlphabets: false })
    var otp_object = {
        otp: otp,
        aadhar_number: "",
        creationTime: (new Date().getTime())
    }

    await collection.insertOne(otp_object);
}

// executeOTPcrudOperations()