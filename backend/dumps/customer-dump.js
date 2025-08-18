const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const Booking = require('../models/Booking');

router.get('/daily-dump', async (req, res) => {
  try {
    const today = new Date();

    // Example: Hardcoded range for demo
    const startOfDay = new Date('2025-04-10T00:00:00.000Z');
    const endOfDay = new Date('2025-08-17T23:59:59.999Z');
    
    // const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    // const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const bookings = await Booking.find({
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Daily Booking Dump');

    // Define the columns based on the exact format of the Customer Dump CSV
    worksheet.columns = [
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
      { header: 'Refund against cancellation', key: 'refundAmount', width: 25 }
    ];

    // Helper to check if a traveler is the main customer
    const isMainCustomer = (traveler, mainCustomerEmail) => traveler.email === mainCustomerEmail;
    
    // Counter for the S/L column
    let slCounter = 1;

    bookings.forEach((booking) => {
      // Loop through each traveler (customer + co-passengers) and create a new row
      const allTravelers = [booking.customer, ...booking.travelers];

      allTravelers.forEach((traveler) => {
        const adultsCount = booking.travelers.filter(t => !t.isChild).length;
        const childrenCount = booking.travelers.filter(t => t.isChild).length;
        const isCustomer = isMainCustomer(traveler, booking.customer.email);

        const rowData = {
          sl: slCounter++,
          dateOfDump: today.toLocaleDateString(),
          dateOfBooking: booking.createdAt.toLocaleDateString(),
          bookingEmailId: booking.customer.email,
          bookingId: booking.bookingID,
          dateOfJourney: booking.tour.startDate?.toLocaleDateString() || 'N/A',
          nameOfCustomer: isCustomer ? traveler.name : '', // Main customer name only on their row
          coPassengers: isCustomer ? '' : traveler.name, // Co-passenger name only on their row
          gender: traveler.gender,
          dob: traveler.dob,
          age: traveler.age,
          phoneCalling: traveler.phone,
          emergencyContact: isCustomer ? (booking.customer.emergencyContact || 'N/A') : '',
          phoneWhatsapp: traveler.whatsapp,
          flatNo: booking.customer.flatNo || 'N/A',
          locality: booking.customer.locality || 'N/A',
          city: booking.customer.city || 'N/A',
          pincode: booking.customer.pincode || 'N/A',
          ps: booking.customer.ps || 'N/A',
          state: booking.customer.state || 'N/A',
          country: booking.tour.country,
          aadharNumber: traveler.aadhar,
          panNumber: traveler.pan,
          birthCertificate: traveler.birthCertificate || '', // Data not in provided schema
          disability: traveler.disability || '',
          medicalCondition: traveler.medicalCondition || '',
          tourType: booking.tour.tourType,
          packageSelected: booking.tour.name,
          agentName: booking.agent?.name || '',
          agentId: booking.agent?.agentID || '',
          selectedTrip: booking.tour.name,
          coPassengerCount: booking.travelers.length,
          aadharJpg: traveler.aadharJpg || '', // Data not in provided schema
          panJpg: traveler.panJpg || '', // Data not in provided schema
          bankName: booking.payment?.bankName || '', // Data not in provided schema
          accountHolderName: booking.payment?.accountHolderName || '', // Data not in provided schema
          bankAccountNo: booking.payment?.bankAccountNo || '', // Data not in provided schema
          ifscCode: booking.payment?.ifscCode || '', // Data not in provided schema
          adults: adultsCount,
          children: childrenCount,
          adultRate: booking.packageRates?.adultRate || booking.tour.pricePerHead,
          childRate: booking.packageRates?.childRate || 0,
          totalPaid: booking.payment?.totalAmount || 0,
          utrNumber: booking.utrNumber || '',
          canceledMembers: booking.travelers.filter(t => t.cancellationApproved).map(t => t.name).join(', ') || '',
          refundAmount: booking.payment?.refundAmount || 0
        };

        worksheet.addRow(rowData);
      });
    });

    // Set response headers for Excel download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=daily_dump_${today.toISOString().slice(0, 10)}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating Excel file:', error);
    res.status(500).send('Error generating daily dump.');
  }
});

module.exports = router;