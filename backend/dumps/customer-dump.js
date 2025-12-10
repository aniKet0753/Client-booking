const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');

// ===============================
// ✅ Setup Nodemailer transporter
// ===============================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // Your Gmail
    pass: process.env.EMAIL_PASS,  // Your App Password
  },
});

// ✅ Utility function to send dump email
async function sendDumpMail(toEmail, subject, filePath) {
  try {
    const mailOptions = {
      from: `"L2G Dump Bot" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      text: `Attached is the ${subject} file.`,
      attachments: [
        {
          filename: path.basename(filePath),
          path: filePath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 ${subject} email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}

// ===============================
// ✅ DAILY DUMP
// ===============================
router.get('/daily-dump', async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  // Temporarily store file locally
  const filePath = path.join(__dirname, `../../temp/daily_tourwise_dump_${today.toISOString().slice(0, 10)}.xlsx`);
  req.filePath = filePath;

  await generateDump(req, res, startOfDay, today, 'Daily Booking Dump', 'daily_dump');

  // ✅ Send email once generated
  await sendDumpMail(
    process.env.REPORT_RECEIVER || 'yourfallback@gmail.com', // Replace or keep configurable via env
    `L2G-Daily ${today.getFullYear()} Dump`,
    filePath
  );

  //Cleanup code to remove temporary created files
  setTimeout(() => {
  fs.unlink(filePath, err => {
    if (err) console.error('❌ Failed to delete temp file:', err);
    else console.log('🗑️ Temp dump file deleted:', filePath);
  });
}, 60000);

});

// ===============================
// ✅ WEEKLY DUMP
// ===============================
router.get('/weekly-dump', async (req, res) => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - 7);
  startOfWeek.setHours(0, 0, 0, 0);

  const filePath = path.join(__dirname, `../../temp/weekly_tourwise_dump_${today.toISOString().slice(0, 10)}.xlsx`);
  req.filePath = filePath;

  await generateDump(req, res, startOfWeek, today, 'Weekly Booking Dump', 'weekly_dump');

  await sendDumpMail(
    process.env.REPORT_RECEIVER || 'yourfallback@gmail.com',
    `L2G-Weekly ${today.getFullYear()} Dump`,
    filePath
  );

  //Cleanup code to remove temporary created files
  setTimeout(() => {
  fs.unlink(filePath, err => {
    if (err) console.error('❌ Failed to delete temp file:', err);
    else console.log('🗑️ Temp dump file deleted:', filePath);
  });
}, 60000);

});

// ===============================
// ✅ QUARTERLY DUMP
// ===============================
router.get('/quarterly-dump', async (req, res) => {
  const today = new Date();
  const startOfQuarter = new Date(today);
  startOfQuarter.setMonth(today.getMonth() - 3);
  startOfQuarter.setHours(0, 0, 0, 0);

  const filePath = path.join(__dirname, `../../temp/quarterly_tourwise_dump_${today.toISOString().slice(0, 10)}.xlsx`);
  req.filePath = filePath;

  await generateDump(req, res, startOfQuarter, today, 'Quarterly Booking Dump', 'quarterly_dump');

  await sendDumpMail(
    process.env.REPORT_RECEIVER || 'yourfallback@gmail.com',
    `L2G-Quarterly ${today.getFullYear()} Dump`,
    filePath
  );

  //Cleanup code to remove temporary created files
  setTimeout(() => {
  fs.unlink(filePath, err => {
    if (err) console.error('❌ Failed to delete temp file:', err);
    else console.log('🗑️ Temp dump file deleted:', filePath);
  });
}, 60000);

});


// ✅ Reuse the same logic for all dumps
async function generateDump(req, res, startDate, endDate, sheetName, filenamePrefix) {
  try {
    const today = new Date();
    const bookings = await Booking.find({
      createdAt: { $gte: startDate, $lt: endDate }
    });

    const workbook = new ExcelJS.Workbook();
    const dailySheet = workbook.addWorksheet(sheetName);

    // ✅ Reuse same column headers as daily dump
    dailySheet.columns = [
      { header: 'S/L', key: 'sl', width: 5 },
      { header: 'Date of Dump', key: 'dateOfDump', width: 15 },
      { header: 'Date of booking', key: 'dateOfBooking', width: 15 },
      { header: 'Booking Email ID', key: 'bookingEmailId', width: 30 },
      { header: 'Booking ID', key: 'bookingId', width: 20 },
      { header: 'Date of journey', key: 'dateOfJourney', width: 15 },
      { header: 'Name of customer', key: 'nameOfCustomer', width: 25 },
      { header: 'Name of co-passengers', key: 'coPassengers', width: 40 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'DOB', key: 'dob', width: 15 },
      { header: 'Age', key: 'age', width: 8 },
      { header: 'Phone No. Calling', key: 'phoneCalling', width: 20 },
      { header: 'Emergency Contact', key: 'emergencyContact', width: 20 },
      { header: 'Phone No. Whatsaap', key: 'phoneWhatsapp', width: 20 },
      { header: 'Flat No.', key: 'flatNo', width: 15 },
      { header: 'Locality', key: 'locality', width: 20 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'Pin Code', key: 'pincode', width: 10 },
      { header: 'PS', key: 'ps', width: 15 },
      { header: 'State', key: 'state', width: 15 },
      { header: 'Country', key: 'country', width: 15 },
      { header: 'Aadhar Card Number', key: 'aadharNumber', width: 20 },
      { header: 'PAN Card Number', key: 'panNumber', width: 20 },
      { header: 'Birth Certificate', key: 'birthCertificate', width: 20 },
      { header: 'Disability (if any)', key: 'disability', width: 20 },
      { header: 'Medical condition', key: 'medicalCondition', width: 20 },
      { header: 'Tour Type', key: 'tourType', width: 20 },
      { header: 'Package selected', key: 'packageSelected', width: 25 },
      { header: 'Agent Name', key: 'agentName', width: 20 },
      { header: 'Agent ID', key: 'agentId', width: 20 },
      { header: 'Selected Trip', key: 'selectedTrip', width: 25 },
      { header: 'No. of Co-passanger', key: 'coPassengerCount', width: 20 },
      { header: 'JPG/PDF of aadhar Card of passanger', key: 'aadharJpg', width: 40 },
      { header: 'JPG/PDF of PAN Card of passanger', key: 'panJpg', width: 40 },
      { header: 'Bank Name', key: 'bankName', width: 20 },
      { header: 'Account holder name', key: 'accountHolderName', width: 25 },
      { header: 'Bank Account No', key: 'bankAccountNo', width: 20 },
      { header: 'IFSC Code', key: 'ifscCode', width: 15 },
      { header: 'No. of adults', key: 'adults', width: 15 },
      { header: 'No. of Child', key: 'children', width: 15 },
      { header: 'Package rate for adult', key: 'adultRate', width: 20 },
      { header: 'Package rate for child', key: 'childRate', width: 20 },
      { header: 'Total Amount paid by customer', key: 'totalPaid', width: 25 },
      { header: 'UTR Number', key: 'utrNumber', width: 20 },
      { header: 'Canceled booking of members(Only Nos.)', key: 'canceledMembers', width: 30 },
      { header: 'Refund against cancellation', key: 'refundAmount', width: 25 },
      { header: 'Commission rate agent', key: 'commissionRateAgent', width: 20 },
      { header: 'Commission amount of agent', key: 'commissionAmountAgent', width: 25 },
      { header: 'Commission amount of parent agent', key: 'commissionAmountParent', width: 25 },
      { header: 'Commission rate of parent agent', key: 'commissionRateParent', width: 25 },
      { header: 'Due date of payment for agent', key: 'dueDateAgent', width: 25 },
      { header: 'Due date of payment for parent agent', key: 'dueDateParent', width: 25 },
      { header: 'Agent Commission paid (yes/no)', key: 'agentCommissionPaid', width: 25 },
      { header: 'Parent agent Commission paid (yes/no)', key: 'parentCommissionPaid', width: 30 },
      { header: 'Commission paid date for agent', key: 'commissionPaidDateAgent', width: 30 },
      { header: 'Commission paid date for parent agent', key: 'commissionPaidDateParent', width: 30 },
      { header: 'Commission deduction amount of agent', key: 'commissionDeductionAgent', width: 30 },
      { header: 'Commission deduction amount of parent agent', key: 'commissionDeductionParent', width: 30 },
    ];

    const isMainCustomer = (traveler, mainCustomerEmail) => traveler.email === mainCustomerEmail;
    let slCounter = 1;

    for (const booking of bookings) {
      const allTravelers = [booking.customer, ...booking.travelers];
      let isFirstRow = true;

      const transaction = await Transaction.findOne({ transactionId: booking.utrNumber });
      let commissionData = {
        commissionRateAgent: '',
        commissionAmountAgent: '',
        commissionAmountParent: '',
        commissionRateParent: '',
        dueDateAgent: '',
        dueDateParent: '',
        agentCommissionPaid: 'No',
        parentCommissionPaid: 'No',
        commissionPaidDateAgent: '',
        commissionPaidDateParent: '',
        commissionDeductionAgent: '',
        commissionDeductionParent: '',
      };

      if (transaction) {
        const agentCommission = transaction.commissions.find(c => c.level === 1);
        const parentCommission = transaction.commissions.find(c => c.level === 2);

        commissionData = {
          commissionRateAgent: agentCommission?.commissionRate || '',
          commissionAmountAgent: agentCommission?.commissionAmount || '',
          commissionAmountParent: parentCommission?.commissionAmount || '',
          commissionRateParent: parentCommission?.commissionRate || '',
          dueDateAgent: transaction.tourStartDate || '',
          dueDateParent: transaction.tourStartDate || '',
          agentCommissionPaid: agentCommission?.commissionPaid ? 'Yes' : 'No',
          parentCommissionPaid: parentCommission?.commissionPaid ? 'Yes' : 'No',
          commissionPaidDateAgent: agentCommission?.commissionPaidDate || '',
          commissionPaidDateParent: parentCommission?.commissionPaidDate || '',
          commissionDeductionAgent: agentCommission?.commissionDeductionAmount || '',
          commissionDeductionParent: parentCommission?.commissionDeductionAmount || '',
        };
      }

      for (const traveler of allTravelers) {
        const isCustomer = isMainCustomer(traveler, booking.customer.email);

        const rowData = {
          sl: slCounter++,
          dateOfDump: isFirstRow ? today.toLocaleDateString() : '',
          dateOfBooking: isFirstRow ? booking.createdAt.toLocaleDateString() : '',
          bookingEmailId: isFirstRow ? booking.customer.email : '',
          bookingId: isFirstRow ? booking.bookingID : '',
          dateOfJourney: isFirstRow ? (booking.tour.startDate?.toLocaleDateString() || 'N/A') : '',
          nameOfCustomer: isCustomer ? traveler.name : '',
          coPassengers: isCustomer ? '' : traveler.name,
          gender: traveler.gender || '',
          dob: traveler.dob || '',
          age: traveler.age || '',
          phoneCalling: traveler.phone || '',
          emergencyContact: isFirstRow ? (booking.customer.emergencyContact || 'N/A') : '',
          phoneWhatsapp: traveler.whatsapp || '',
          flatNo: isFirstRow ? (booking.customer.homeAddress.flatNo || 'N/A') : '',
          locality: isFirstRow ? (booking.customer.homeAddress.locality || 'N/A') : '',
          city: isFirstRow ? (booking.customer.homeAddress.city || 'N/A') : '',
          pincode: isFirstRow ? (booking.customer.homeAddress.pincode || 'N/A') : '',
          ps: isFirstRow ? (booking.customer.homeAddress.ps || 'N/A') : '',
          state: isFirstRow ? (booking.customer.homeAddress.state || 'N/A') : '',
          country: isFirstRow ? booking.tour.country : '',
          aadharNumber: traveler.aadhar || '',
          panNumber: traveler.pan || '',
          birthCertificate: traveler.birthCertificate || '',
          disability: traveler.disability || '',
          medicalCondition: traveler.medicalCondition || '',
          tourType: isFirstRow ? booking.tour.tourType : '',
          packageSelected: isFirstRow ? booking.tour.name : '',
          agentName: isFirstRow ? (booking.agent?.name || '') : '',
          agentId: isFirstRow ? (booking.agent?.agentID || '') : '',
          selectedTrip: isFirstRow ? booking.tour.name : '',
          coPassengerCount: isFirstRow ? booking.travelers.length : '',
          aadharJpg: traveler.aadharJpg || '',
          panJpg: traveler.panJpg || '',
          bankName: isFirstRow ? (booking.payment?.bankName || '') : '',
          accountHolderName: isFirstRow ? (booking.payment?.accountHolderName || '') : '',
          bankAccountNo: isFirstRow ? (booking.payment?.bankAccountNo || '') : '',
          ifscCode: isFirstRow ? (booking.payment?.ifscCode || '') : '',
          adults: isFirstRow ? booking.numAdults : '',
          children: isFirstRow ? booking.numChildren : '',
          adultRate: isFirstRow ? (booking.packageRates?.adultRate || booking.tour.pricePerHead) : '',
          childRate: isFirstRow ? (booking.packageRates?.childRate || 0) : '',
          totalPaid: isFirstRow ? (booking.payment?.totalAmount || 0) : '',
          utrNumber: isFirstRow ? (booking.utrNumber || '') : '',
          cancelledMembers: isFirstRow ? booking.cancelledMembers : '',
          refundAmount: isFirstRow ? (booking.payment?.refundAmount || 0) : '',
          ...(isFirstRow ? commissionData : {})
        };

        dailySheet.addRow(rowData);
        isFirstRow = false;
      }
    }

    // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    // res.setHeader('Content-Disposition', `attachment; filename=${filenamePrefix}_${today.toISOString().slice(0, 10)}.xlsx`);

    // await workbook.xlsx.write(res);
    // ===============================
    // ✅ ALSO GENERATE TOUR-WISE DUMP
    // -------------------------------
    // Tour-wise Booking Dump sheet
    // -------------------------------
    const tourSheet = workbook.addWorksheet('Tour-wise Booking Dump');
    tourSheet.columns = dailySheet.columns;

    let slCounterTour = 1;
    const tourGroups = {};
    for (const booking of bookings) {
      const tourID = booking.tour?.tourID?.toString() || 'Unknown';
      if (!tourGroups[tourID]) tourGroups[tourID] = [];
      tourGroups[tourID].push(booking);
    }

    for (const [tourID, tourBookings] of Object.entries(tourGroups)) {
      tourSheet.addRow([]);
      tourSheet.addRow([`Tour ID: ${tourID}`, `Tour Name: ${tourBookings[0]?.tour?.name || 'N/A'}`]);
      tourSheet.addRow([]);

      for (const booking of tourBookings) {
        const allTravelers = [booking.customer, ...booking.travelers];
        let isFirstRow = true;

        const transaction = await Transaction.findOne({ transactionId: booking.utrNumber });
        let commissionData = {
          commissionRateAgent: '',
          commissionAmountAgent: '',
          commissionAmountParent: '',
          commissionRateParent: '',
          dueDateAgent: '',
          dueDateParent: '',
          agentCommissionPaid: 'No',
          parentCommissionPaid: 'No',
          commissionPaidDateAgent: '',
          commissionPaidDateParent: '',
          commissionDeductionAgent: '',
          commissionDeductionParent: '',
        };

        if (transaction) {
          const agentCommission = transaction.commissions.find(c => c.level === 1);
          const parentCommission = transaction.commissions.find(c => c.level === 2);
          commissionData = {
            commissionRateAgent: agentCommission?.commissionRate || '',
            commissionAmountAgent: agentCommission?.commissionAmount || '',
            commissionAmountParent: parentCommission?.commissionAmount || '',
            commissionRateParent: parentCommission?.commissionRate || '',
            dueDateAgent: transaction.tourStartDate || '',
            dueDateParent: transaction.tourStartDate || '',
            agentCommissionPaid: agentCommission?.commissionPaid ? 'Yes' : 'No',
            parentCommissionPaid: parentCommission?.commissionPaid ? 'Yes' : 'No',
            commissionPaidDateAgent: agentCommission?.commissionPaidDate || '',
            commissionPaidDateParent: parentCommission?.commissionPaidDate || '',
            commissionDeductionAgent: agentCommission?.commissionDeductionAmount || '',
            commissionDeductionParent: parentCommission?.commissionDeductionAmount || '',
          };
        }

        for (const traveler of allTravelers) {
          const isCustomer = traveler.email === booking.customer.email;
          const rowData = {
            sl: slCounterTour++,
            dateOfDump: isFirstRow ? today.toLocaleDateString() : '',
            dateOfBooking: isFirstRow ? booking.createdAt.toLocaleDateString() : '',
            bookingEmailId: isFirstRow ? booking.customer.email : '',
            bookingId: isFirstRow ? booking.bookingID : '',
            dateOfJourney: isFirstRow ? (booking.tour.startDate?.toLocaleDateString() || 'N/A') : '',
            nameOfCustomer: isCustomer ? traveler.name : '',
            coPassengers: isCustomer ? '' : traveler.name,
            gender: traveler.gender || '',
            dob: traveler.dob || '',
            age: traveler.age || '',
            phoneCalling: traveler.phone || '',
            emergencyContact: isFirstRow ? (booking.customer.emergencyContact || 'N/A') : '',
            phoneWhatsapp: traveler.whatsapp || '',
            flatNo: isFirstRow ? (booking.customer.homeAddress.flatNo || 'N/A') : '',
            locality: isFirstRow ? (booking.customer.homeAddress.locality || 'N/A') : '',
            city: isFirstRow ? (booking.customer.homeAddress.city || 'N/A') : '',
            pincode: isFirstRow ? (booking.customer.homeAddress.pincode || 'N/A') : '',
            ps: isFirstRow ? (booking.customer.homeAddress.ps || 'N/A') : '',
            state: isFirstRow ? (booking.customer.homeAddress.state || 'N/A') : '',
            country: isFirstRow ? booking.tour.country : '',
            aadharNumber: traveler.aadhar || '',
            panNumber: traveler.pan || '',
            birthCertificate: traveler.birthCertificate || '',
            disability: traveler.disability || '',
            medicalCondition: traveler.medicalCondition || '',
            tourType: isFirstRow ? booking.tour.tourType : '',
            packageSelected: isFirstRow ? booking.tour.name : '',
            agentName: isFirstRow ? (booking.agent?.name || '') : '',
            agentId: isFirstRow ? (booking.agent?.agentID || '') : '',
            selectedTrip: isFirstRow ? booking.tour.name : '',
            coPassengerCount: isFirstRow ? booking.travelers.length : '',
            aadharJpg: traveler.aadharJpg || '',
            panJpg: traveler.panJpg || '',
            bankName: isFirstRow ? (booking.payment?.bankName || '') : '',
            accountHolderName: isFirstRow ? (booking.payment?.accountHolderName || '') : '',
            bankAccountNo: isFirstRow ? (booking.payment?.bankAccountNo || '') : '',
            ifscCode: isFirstRow ? (booking.payment?.ifscCode || '') : '',
            adults: isFirstRow ? booking.numAdults : '',
            children: isFirstRow ? booking.numChildren : '',
            adultRate: isFirstRow ? (booking.packageRates?.adultRate || booking.tour.pricePerHead) : '',
            childRate: isFirstRow ? (booking.packageRates?.childRate || 0) : '',
            totalPaid: isFirstRow ? (booking.payment?.totalAmount || 0) : '',
            utrNumber: isFirstRow ? booking.utrNumber : '',
            cancelledMembers: isFirstRow ? booking.cancelledMembers : '',
            refundAmount: isFirstRow ? (booking.payment?.refundAmount || 0) : '',
            ...(isFirstRow ? commissionData : {})
          };
          tourSheet.addRow(rowData);
          isFirstRow = false;
        }
      }
    }

    // ✅ Send single workbook with both sheets
    // ✅ Save Excel temporarily to file for email attachment
    const filePath = req.filePath || path.join(__dirname, `../../temp/${filenamePrefix}_${today.toISOString().slice(0, 10)}.xlsx`);
    
    // Ensure temp directory exists
    fs.mkdirSync(path.join(__dirname, '../../temp'), { recursive: true });

    await workbook.xlsx.writeFile(filePath);

    // ✅ Also send file in response (optional)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${path.basename(filePath)}`);
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error generating Excel file:', error);
    res.status(500).send('Error generating dump.');
  }
}

module.exports = router;