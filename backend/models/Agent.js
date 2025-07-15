const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
    status: { type: String,  enum: ['active','inactive', 'rejected','pending'], default:'pending' },
    remarks: { type: String, default: '' },
    isAdmin: { type: Boolean, default: false },
    name: String,
    gender: String,
    dob: Date, 
    age: Number,
    phone_calling: {type: String, unique: true},
    phone_whatsapp: String,
    email: {type: String, unique: true}, 
    aadhar_card: {type: String, unique: true},
    aadhaarPhotoFront: String,
    aadhaarPhotoBack: String,
    pan_card: String,
    panCardPhoto: String,
    password: String,
    photo: String,
    profession: String,
    income: Number,
    office_address: String,
    permanent_address: {
        house_no: String,
        road_no: String,
        flat_name: String,
        pincode: String,
        village: String,
        district: String,
        state: String,
        police_station: String,
        post_office: String
    },
    exclusive_zone: [{
        pincode: String,
        village_preference: [String]
    }],
    banking_details: {
        bank_name: String,
        acc_holder_name: String,
        acc_number: String,
        ifsc_code: String,
        branch_name: String
    },
    parentAgent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent',
        default: null
    },
    agentID : {type: String, unique: true},
    walletID : {type: String, unique: true},
    walletBalance: {type: Number, default: 0},
    // lastCode : {type: String, unique: true},
},  { timestamps: true });

module.exports = mongoose.model('Agent', agentSchema);