import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function CancellationPolicy() {
  return (

    <>
    <Navbar />
    
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden p-6 my-5">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Cancellation & Refund Policy</h1>
      
      <div className="prose">
        <p>M/s L2G Cruise & Cure Travel Management Private Limited is functioning as an agent of the guest and his accompanying person for booking of their ticket, accommodation, transportation etc. in advance upon payment to their outside service providers, hence cancellation of services results losing money of the company depending upon the time of communication of cancellation to outside service providers under situation, and hence the refund amount against cancellation will vary and shall not be uniform as following table. Booking Money: Total Tour Cost [Per head] to be deposited at the time of Booking.</p>
        
        <h2 className="underline mt-6">A) Cancellation Terms against cancellation by Tourist:</h2>
        
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Number of days before departure from the date of receipt of your cancellation</th>
                <th className="border px-4 py-2">Amount of Cancellation charge in % on the Total Tour price must be paid by the Guest(s)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-4 py-2">120 days to 70 days before date of journey</td>
                <td className="border px-4 py-2">0% on Principal Package cost (100% refund)</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border px-4 py-2">69 days -- 31 Days before Journey Date</td>
                <td className="border px-4 py-2">50% on Principal Package Cost (50% refund)</td>
              </tr>
              <tr>
                <td className="border px-4 py-2 font-semibold">30 days -- Date of departure</td>
                <td className="border px-4 py-2 font-semibold">100% on Principal Package Cost (Zero refund)</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <h2 className="underline mt-6">B) Cancellation Terms against cancellation by L2G CRUISE & CURE TRAVEL MANAGEMENT PVT. LTD.</h2>
        
        <p>Due to natural calamity / pandemic / non-confirmation of hotel or vehicle / epidemic / border unrest / situations beyond control of L2G CRUISE & TRAVEL MANAGEMENT PRVATE LTD.booking for any trip / tour program may be canceled with advance / short notice depending upon the situation and Government declaration / announcement / guidelines from central government / state government / local government authorities.Based upon the type of travel restrictions / situations a flexible cancellation policy is followed by the company to ensure maximum refund to the customer.</p>
        
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Number of days before departure from the date of receipt of your cancellation request</th>
                <th className="border px-4 py-2">Refundable amount against cancellation*</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-4 py-2">120 days to 45 days before date of journey</td>
                <td className="border px-4 py-2">100% refund</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border px-4 py-2">45 days -- Date of departure</td>
                <td className="border px-4 py-2">50% refund**</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 text-sm">
          <p>* denotes that the refundable amount is dependent upon the cancellation of entire trip or part closure of a destination point as per directive of the local/ state /central law enforcement authorities or government.</p>
          <p className="mt-2">** denotes that the refundable amount is subject to refunds on actuals received from the hoteliers / transporters / Indian railways etc.</p>
        </div>
      </div>
    </div>

    <Footer/>
    </>
  )
}