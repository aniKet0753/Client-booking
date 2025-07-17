import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TermsConditions() {
  return (
    <>
    <Navbar />
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden p-6 my-5">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Terms and Conditions</h1>
      
      <div className="prose">
        <h2 className="underline">1. Guest Acceptance of terms and conditions and filling the Registration Form:</h2>
        <p>The terms & conditions, acknowledged by the Guest on the Registration form duly signed by or acknowledging the same by any electronic medium the Terms & Conditions / Rules & Regulation in together payment of any initial / full amount paid thereof shall constitute a contract between the M/s L2G Cruise & Cure Travel Management Private Limited and the customer who has accepted the terms for himself / herself / the companions on behalf of whom he / she has accepted and made payment thereof making the contract effective immediate and binding upon them.</p>
        <p>Be it noted that if the Guest vis-à-vis the customer alone accepted the terms and conditions at the online platform on behalf of the persons accompanying the guest, it shall be construed that they have authorized the guest to acknowledge and accept on their behalf and thereby shall deemed to have been bound by the same together with the guest, even if the registered guest in-case missed to on-board the journey or opt-out from the travel program before / during the journey continuing the travel plan for others as per the declared itinerary.</p>
        
        <h2 className="underline mt-6">2. Guest's intention to participate in the schedule Tour:</h2>
        <p>Filling the Registration form with the payment of initial registration amount just indicate Guest's intention to participate in the tour together with accompanying persons but do not entitled to any services unless full tour cost has been paid by the guest and acknowledged by the "L2G CRUISE & CURE TRAVEL MANAGEMENT PRIVATE LIMITED".</p>
        
        <h2 className="underline mt-6">3. Booking of Tour and Payment process:</h2>
        <p>A) Registration Form shall be filled in online by customer directly logging in to the customer portal post creation of login credentials.</p>
        <p>B) In case the customer is not himself / herself competent to perform the booking by own-self, can connect to the nearby authorized agents as per the list available in the website / by connecting to the office staffs at L2G Cruise & Cure Travel Management Private Limited. The office of L2G Cruise & cure travel management private limited / local agent can guide the customer for booking but the customer has to complete the booking process through their Log-in ID only and shall not share with the agents.</p>
        <p>C) The customer shall mention the agent ID, in the online form as shall be provided by the agent, against assistance provided by them or shall be auto-detected by system for the area, upholding the exclusive decision by the customer.</p>
        <p>D) Post acceptance of tour itinerary and terms & conditions, based upon the real-time seat availability, booking shall be confirmed against successful online payment transaction between the customer and M/s L2G Cruise & Cure Travel Management Private Limited.</p>
        <p>E) No monetary transaction should be carried out in cash or electronic medium or by any other means / manner between customer and agent / employee of L2G cruise & cure travel management private limited, to any alternative account other than mentioned bank account details of the company and as such the booking shall be incomplete and will be considered void. If any agent / employee asks for money the customer to his / her personal account or in cash, should immediately inform the Ethics committee of M/s L2G Cruise & Cure Travel Management Private Limited about possible fraud.</p>
        <p>F) Against acceptance of terms & conditions and booking, the customer is authorizing on behalf of the companions / self that the L2G CRUISE & CURE TRAVEL MANAGEMENT PVT. LTD. may engage in booking and reserving seats in train, hotels, hostels, homestays, vehicles etc. as per the trip plan.</p>
        <p>G) Customer may consider to provide crossed checks towards the following bank account details and handover to the agents. But any online payment shall be directly managed by M/s L2G Cruise & Cure Travel Management Private Limited, as such the company may request the customer to visit office and do the necessary payments, to ensure the credibility of the transaction, in case the online transaction is facing any technical glitch beyond control of M/s L2G Cruise & Cure Travel Management Private Limited.</p>
        
        <div className="bg-gray-100 p-4 mt-4 rounded">
          <p className="font-semibold">Bank A/c Number: 43925661892</p>
          <p className="font-semibold">Bank: State Bank of India</p>
          <p className="font-semibold">Branch: SBI, XLRI Jamshedpur.</p>
          <p className="font-semibold">IFSC:SBIN0004660</p>
        </div>
        
        <p className="mt-4">Note:If payment is made online to the company as per following details mention the reference number in applicable section of the Form.</p>
        
        {/* Continue with the rest of the terms */}
      </div>
    </div>
    <Footer />
    </>
  )
}