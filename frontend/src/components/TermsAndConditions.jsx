import { useSearchParams, useParams } from 'react-router-dom';
import { useState } from 'react';

export default function TermsAndConditions() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const paymentUrl = searchParams.get('redirect');
    const [accepted, setAccepted] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 px-4 py-8">
            <div className="max-w-4xl w-full p-8 bg-white shadow-lg rounded-xl border border-gray-200 mx-auto">

                <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Terms & Conditions</h1>

                <p className="text-gray-700 leading-relaxed mb-8">
                    By proceeding with the payment, you agree to the terms and conditions outlined by the company.
                    Please read all the clauses carefully.
                </p>

                <div className="space-y-10">
                    <Section
                        title="1. Guest Acceptance of Terms"
                        content={
                            <>
                                Guest Acceptance of terms and conditions and filling the Registration Form:
                                The terms & conditions, acknowledged by the Guest on the Registration form duly signed by or 
                                acknowledging the same by any electronic medium the Terms & Conditions / Rules & Regulation in 
                                together payment of any initial / full amount paid thereof shall constitute a contract between the 
                                M/s L2G Cruise & Cure Travel Management Private Limited and the customer who has accepted the terms for himself / herself / the companions on behalf of whom he / she has accepted and made payment thereof making the contract effective immediate and binding upon them. 
                                Be it noted that if the Guest vis-à-vis the customer alone accepted the terms and conditions at the online platform on behalf of the persons accompanying the guest, it shall be construed that they have authorized the guest to acknowledge and accept on their behalf and thereby shall deemed to have been bound by the same together with the guest, even if the registered guest in-case missed to on-board the journey or opt-out from the travel program before / during the journey continuing the travel plan for others as per the declared itinerary.
                            </>
                        }
                    />
                    <Section
                        title="2. Guest’s intention to participate in the schedule Tour : "
                        content="Filling the Registration form with the payment of initial registration amount just indicate 
                                Guest’s intention to participate in the tour together with accompanying persons but do not 
                                entitled to any services unless full tour cost has been paid by the guest and acknowledged by 
                                the “L2G CRUISE & CURE TRAVEL MANAGEMENT PRIVATE LIMITED”."
                    />
                    <Section
                        title="3. Booking of Tour and Payment process: "
                        content={
                            <ol className="list-[upper-alpha] pl-6 space-y-2 text-gray-700">
                                <li>Registration Form shall be filled in online by customer directly logging in to the customer portal post creation of login credentials.</li>
                                <li>In case the customer is not himself / herself competent to perform the booking by own-self, can connect to the nearby authorized agents as per the list available in the website / by connecting to the office staffs at L2G Cruise & Cure Travel Management Private Limited. The office of L2G Cruise & cure travel management private limited / local agent can guide the customer for booking but the customer has to complete the booking process through their Log-in ID only and shall not share with the agents.</li>
                                <li>The customer shall mention the agent ID, in the online form as shall be provided by the agent, 
                                    against assistance provided by them or shall be auto-detected by system for the area, upholding the exclusive decision by the customer. </li>
                                <li>Post acceptance of tour itinerary and terms & conditions, based upon the real-time seat 
                                    availability, booking shall be confirmed against successful online payment transaction between the customer and M/s L2G Cruise & Cure Travel Management Private Limited.</li>
                                <li>No monetary transaction should be carried out in cash or electronic medium or by any other means / manner between customer and agent / employee of L2G cruise & cure travel management private limited, to any alternative account other than mentioned bank account details of the company and as such the booking shall be incomplete and will be considered void. If any agent / employee asks for money the customer to his / her personal account, should immediately inform the Ethics committee of M/s L2G Cruise & Cure Travel Management Private Limited about possible fraud.</li>
                                <li>Against acceptance of terms & conditions and booking, the customer is authorizing on behalf of the companions / self that the L2G CRUISE & CURE TRAVEL MANAGEMENT PVT. LTD. may engage in booking and reserve seats in train, hotels, hostels, homestays, vehicles as per the trip plan.</li>
                                <li>Customer may consider to provide crossed checks towards the following bank account details and 
                                    handover to the agents. But any online payment shall be directly managed by M/s L2G Cruise & Cure Travel Management Private Limited, as such the company may request the customer to visit office and do the necessary payments, to ensure the credibility of the transaction, in case the online transaction is facing any technical glitch beyond control of M/s L2G Cruise & Cure Travel 
                                    Management Private Limited.
                                    <ul className="pl-6 mt-2 text-sm text-gray-700">
                                        <li>Bank: State Bank of India</li>
                                        <li>Branch: SBI, XLRI Jamshedpur</li>
                                        <li>Account Number: 43925661892</li>
                                        <li>IFSC: SBIN0004660</li>
                                    </ul>
                                </li>
                                <li>Any fraudulent request for personal payments should be reported to the Ethics Committee.</li>
                            </ol>
                        }
                    />
                    <Section
                        title="4. Travel Documents:"
                        content={
                            <ul className="list-disc pl-6 text-gray-700">
                                For any people carrying out travel to Sikkim, following documents are required for making of permits and passes. As these are adjacent border areas, laws are to be abide by to the best of the requirement of the local authorities:-
                                <li>Aadhar Card, Driving License, Voter Card.</li>
                                <li>For minors, Birth Certificate is required.</li>
                            </ul>
                        }
                    />
                    <Section
                        title="5. Health "
                        content="The guest and his accompanying persons should as certain of their physical & medical 
                                fitness to undertake the tour. The tourists who have suffered from any ailments and under 
                                domiciliary medical treatment and /or hospitalized till recently have to undertake that they are 
                                availing the tour at his / her own risk. In the case of health emergency during the tour the guest will be sole responsible for the same and to make their own arrangement for the medical assistance and related expenses. The guest should not expect the tour leader to provide full time attention to him alone since he has other guests to attend to continue the tour."
                    />
                    <Section
                        title="6. Insurance"
                        content="Guests are advised to acquire adequate insurance policy and Insurance cover to meet medical expenses, accident etc. during the entire tour."
                    />
                    <Section
                        title="7. Liability & Responsibility of L2G CRUISE AND CURE TRAVEL MANAGEMENT PRIVATE LIMITED"
                        content={
                            <>
                            <p className="mb-2"><strong>Tour Package cost includes:</strong></p>
                            <ul className="list-disc pl-6 space-y-1 text-gray-700">
                                <li>
                                Bed tea, breakfast, lunch, evening snacks with tea, and dinner (unless specifically mentioned otherwise in a specific itinerary plan).
                                </li>
                                <li>
                                Sightseeing as per scheduled tour program provided by the company.
                                </li>
                                <li>
                                Accommodation in twin sharing rooms in reputed hotels. For an extra person, the same room will be shared with an extra bed/mattress/cot or an additional twin sharing room can be arranged at extra cost.
                                </li>
                                <li>
                                Transportation as per the tour plan.
                                </li>
                            </ul>

                            <p className="mt-4 mb-2"><strong>Tour Package cost does not include:</strong></p>
                            <ol className="list-[upper-alpha] pl-6 space-y-1 text-gray-700">
                                <li>Train Tickets / Air Tickets / Bus Tickets.</li>
                                <li>Goods & Service Tax on principal package cost (charged extra).</li>
                                <li>Food during train journeys.</li>
                                <li>
                                Entry or ticket charges for zoo, national parks, vehicles inside parks, ropeways, water parks, other parks (for entry, food, rides, etc.).
                                </li>
                                <li>
                                Personal expenses including porter charges, tips, camera entry fees, charges for pony or dundy, cable car, helicopter ticket, boating, laundry, or any other charges of a personal nature.
                                </li>
                                <li>Cost of medical treatment or medicines if any.</li>
                                <li>
                                Increase in fare, tariffs, or similar charges after registration must be borne by the guest and their companions, and paid before the date of journey.
                                </li>
                                <li>Additional costs of food, water bottles, etc., are not included.</li>
                                <li>
                                Any demurrage or penalties for delays in Train/Air/Bus due to the customer or damage to public/private property will be borne by the concerned customer or companions.
                                </li>
                                <li>Alcohol and other beverages.</li>
                            </ol>
                            </>
                        }
                    />

                    <Section
                        title="8. Cancellation & Refund Policy"
                        content={
                            <>
                            <p className="text-gray-700">
                                M/s L2G Cruise & Cure Travel Management Private Limited is functioning as an agent of the guest and their accompanying persons for booking tickets, accommodations, transportation, etc. in advance by paying external service providers. Therefore, any cancellation leads to financial losses depending on when the cancellation is communicated. Hence, refund amounts are variable and not uniform. The following terms apply:
                            </p>

                            <p className="mt-4 font-semibold text-gray-800">A) Cancellation Terms against cancellation by Tourist:</p>

                            <div className="overflow-x-auto mt-2">
                                <table className="min-w-full border border-gray-300 text-sm text-left text-gray-700">
                                <thead className="bg-gray-100">
                                    <tr>
                                    <th className="border px-4 py-2">Number of Days Before Departure</th>
                                    <th className="border px-4 py-2">Cancellation Charge (% of Principal Tour Cost)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                    <td className="border px-4 py-2">120 to 70 days before journey</td>
                                    <td className="border px-4 py-2">0% (100% refund)</td>
                                    </tr>
                                    <tr>
                                    <td className="border px-4 py-2">69 to 31 days before journey</td>
                                    <td className="border px-4 py-2">50% (50% refund)</td>
                                    </tr>
                                    <tr>
                                    <td className="border px-4 py-2">30 days or less before journey</td>
                                    <td className="border px-4 py-2">100% (Zero refund)</td>
                                    </tr>
                                </tbody>
                                </table>
                            </div>

                            <p className="mt-6 font-semibold text-gray-800">B) Cancellation Terms against cancellation by L2G CRUISE & CURE TRAVEL MANAGEMENT PVT. LTD.:</p>
                            <p className="text-gray-700 mt-2">
                                Due to natural calamities, pandemics, non-confirmation of hotel or vehicle, border unrest, or other situations beyond control, bookings may be canceled with short or advance notice depending on government orders or emergency conditions. A flexible policy will be followed to ensure maximum possible refund to the customer.
                            </p>

                            <div className="overflow-x-auto mt-4">
                                <table className="min-w-full border border-gray-300 text-sm text-left text-gray-700">
                                <thead className="bg-gray-100">
                                    <tr>
                                    <th className="border px-4 py-2">Number of Days Before Departure</th>
                                    <th className="border px-4 py-2">Refundable Amount Against Cancellation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                    <td className="border px-4 py-2">120 to 45 days before journey</td>
                                    <td className="border px-4 py-2">100% refund</td>
                                    </tr>
                                    <tr>
                                    <td className="border px-4 py-2">45 days to date of departure</td>
                                    <td className="border px-4 py-2">50% refund</td>
                                    </tr>
                                </tbody>
                                </table>
                            </div>

                            <p className="mt-4 text-gray-700">
                                <strong>*</strong> For Short Tours (1 night 2 days or 2 nights 3 days), booking amounts are non-refundable.
                                <br />
                                <strong>**</strong> If a tour must be rescheduled due to uncontrollable factors, no refund applies. Guests must accept the revised itinerary. Any fines or penalties levied by airlines, railway authorities, or governments are the guest's responsibility. No refunds are allowed for untraveled portions of the tour.
                            </p>
                            </>
                        }
                    />

                    <Section
                        title="9. Journey by Bus, Accommodation, and Other Rules & Regulations"
                        content={
                            <>
                            <ul className="pl-6 space-y-2 text-gray-700">
                                <li><strong>I)</strong> The company provides comfortable vehicles/coaches with allocated seats on a rotation basis. These seats will be provided to tourists on a rotation basis as per the booking.</li>
                                <li><strong>II)</strong> Rooms and hotels are allocated to tourists on a lottery basis. Any other requests from the tourist may not be entertained.</li>
                                <li><strong>III)</strong> If there is an increase in fuel costs for transportation after booking, the agreed package cost may increase accordingly.</li>
                                <li><strong>IV)</strong> The company will make efforts to accommodate senior citizens or disabled tourists, but cooperation from the tourists is requested.</li>
                                <li><strong>V)</strong> If any incidents occur or any adverse situation arises due to misbehavior or illegal acts, the tour manager has the authority to take appropriate action. All tourists are bound by the tour manager’s decisions.</li>
                                <li><strong>VI)</strong> In the case of single occupancy, the tourist must bear the full cost of the double room. If sharing with another person, both parties must consent, and the arrangement will depend on availability.</li>
                                <li><strong>VII)</strong> If the tour is extended due to unavoidable circumstances, any extra expenses incurred will need to be borne by the tourists. These extra costs must be paid to the tour manager during the tour itself.</li>
                                <li><strong>VIII)</strong> Tourists are requested to carry one suitcase (22” to 24”) and one small hand bag to avoid extra luggage charges. The company is not responsible for additional luggage charges.</li>
                                <li><strong>IX)</strong> Enrolment of child tourists is mandatory. Tourists are advised to carry proof of age for children for verification if required.</li>
                                <li><strong>X)</strong> The company charges the following tour costs for children:
                                <ul className="pl-6 space-y-1">
                                    <li><strong>A)</strong> 30% of the tour cost for children up to 3 years (for food only).</li>
                                    <li><strong>B)</strong> 50% of the tour cost for children above 3 years and up to 5 years (food and bus seat, no bed).</li>
                                    <li><strong>C)</strong> 80% of the tour cost for children above 5 years and below 10 years (food, bus seat, room sharing with a parent, and extra mattress/cot provided).</li>
                                    <li><strong>D)</strong> Full charges apply for children above 10 years of age.</li>
                                </ul>
                                </li>
                                <li><strong>XII)</strong> Passengers traveling by other modes of transport (other than by train) are not eligible for a refund in case of tour postponement due to the cancellation of the train by the railway authority or the airline authority.</li>
                                <li><strong>XIII)</strong> Tourists must provide a valid voter ID card, Aadhar card, or passport during registration.</li>
                                <li><strong>XIV)</strong> All tourists are required to carry a photo identity card during the tour.</li>
                                <li><strong>XV)</strong> Luggage should be handled and taken care of by the tourists themselves at all railway stations and airports.</li>
                                <li><strong>XVI)</strong> The tour manager and staff of the company are not responsible for handling porter charges at railway stations or airports.</li>
                                <li><strong>XVII)</strong> The company is not responsible for any delays, cancellations, or rescheduling of trains, flights, or buses for any reason.</li>
                                <li><strong>XVIII)</strong> If any sightseeing or tour program is missed or curtailed due to sudden notices issued by the concerned authorities, the company is not responsible, and all tourists must comply with the changes.</li>
                                <li><strong>XIX)</strong> Any personal injury, sickness, accident, loss of personal belongings, baggage, or any burglary is the sole responsibility of the tourist.</li>
                                <li><strong>XX)</strong> For tourists eligible for LTC claims from their employer, the company provides an LTC/LFC certificate for submission to their organization after the completion of the tour.</li>
                                <li><strong>XXI)</strong> All cancellation requests will be entertained only between 2:00 PM to 6:00 PM.</li>
                                <li><strong>XXII)</strong> In case of unfortunate death or serious injury of any guest or accompanying person during the tour, the guest must handle the necessary formalities. The company and the tour manager will not be responsible for any additional expenditure incurred due to such incidents.</li>
                                <li><strong>XXIII)</strong> Rescheduling of the tour due to factors beyond control or without negligence on the part of the company may occur. In such cases, no refund is applicable, and guests must adhere to the new itinerary. Any fines or penalties imposed by railway, airport, airline authorities, or the Government of India will be borne by the guest.</li>
                                <li><strong>XXIV)</strong> If a guest or any accompanying person fails to join the tour on the scheduled day, it will be treated as a “No Show,” and no refund will be provided for the other services. All services will be canceled for the “No Show.”</li>
                            </ul>
                            </>
                        }
                    />

                    <Section
                        title="10. Force Majeure – Unavoidable Circumstances & Others"
                        content={
                            <>
                            <ul className="pl-6 space-y-2 text-gray-700">
                                <li>
                                <strong>I)</strong> The company shall be excused from the performance or punctual performance of any terms, conditions, services, or tours if the performance is prevented or delayed by circumstances beyond its reasonable control, including but not limited to acts of God, war, accidents, embargoes, terrorist attacks, coups, strikes, natural calamities or disasters (such as the recent COVID-19 pandemic), or delays caused by independent service providers like airlines or train services due to the above-mentioned circumstances.
                                </li>
                                <li>
                                <strong>II)</strong> Any additional costs or expenses incurred by the company for service providers during a force majeure event shall be borne by the travelers or tourists.
                                </li>
                                <li>
                                <strong>III)</strong> All disputes related to these terms and conditions, the tour, and services will be subject to the jurisdiction of the courts in Ranchi.
                                </li>
                                <li>
                                <strong>IV)</strong> Upon signing the registration form and paying the registration charges or the cost of the tour, these terms and conditions become binding on both the company and the guest, along with any accompanying tourists, and shall be the sole basis for the relationship between the parties.
                                </li>
                                <li>
                                <strong>V)</strong> The company reserves the right to terminate the contract and/or cancel any tour due to reasons beyond its control, prior to the commencement of the tour, without providing any reason. In such cases, the company will offer alternative dates for the tour.
                                </li>
                                <li>
                                <strong>VI)</strong> If the alternate tour date is not suitable or acceptable to the tourists with valid reasons, the company will refund the amount paid by the tourists (excluding Visa fees and other actual expenses), without bearing any interest, within 90 days from the date of the alternative tour.
                                </li>
                                <li>
                                <strong>VII)</strong> If the guest/tourist cancels the tour without accepting the company’s offer of an alternative date, the company will not be responsible for any damages, substantial losses, or other expenses incurred by the tourist/guest in connection with the tour.
                                </li>
                                <li>
                                <strong>VIII)</strong> None of the employees, agents of the company, or tourists have the authority to alter or amend any terms and conditions outlined in this document.
                                </li>
                                <li>
                                <strong>IX)</strong> Tourists are earnestly requested to clarify any doubts regarding the terms and conditions before registration and until the commencement of the tour.
                                </li>
                                <li>
                                <strong>X)</strong> By signing below, I declare that I have read, understood, and voluntarily accept the terms and conditions outlined by M/s L2G Cruise & Cure Travel Management Private Limited. I agree to comply with these terms, including the terms on behalf of my guests for whom I am purchasing services.
                                </li>
                                <li>
                                <strong>XI)</strong> I, 
                                {/* <input type="text" className="border-0 border-b-2 border-black w-72 focus:outline-none placeholder-gray-400" placeholder="Your Full Name" /> */}
                                &nbsp; hereby declare that I have read, understood, and voluntarily accept the terms and conditions outlined in the Terms & Conditions provided by M/s L2G Cruise & Cure Travel Management Private Limited and shall be bound by them, including for my guests.
                                </li>
                                <li>
                                <strong>XII)</strong> I, 
                                {/* <input type="text" className="border-0 border-b-2 border-black w-72 focus:outline-none placeholder-gray-400" placeholder="Your Full Name" /> */}
                                &nbsp; hereby declare that the information provided in this document is accurate, complete, and true to the best of my knowledge. I acknowledge that all facts and supporting information provided have been thoroughly reviewed and verified for correctness.
                                </li>
                                <li>
                                <strong>XIII)</strong> By submitting this declaration, I affirm that all information in the document is true and accurate. I have not intentionally omitted or misrepresented any information. I understand that any false statements or omissions may result in invalidation of the document or legal penalties, as per applicable laws and regulations.
                                </li>
                                <li>
                                <strong>XIV)</strong> I take full responsibility for the accuracy of the details provided and understand that any updates or changes must be promptly reported to the relevant parties.
                                </li>
                                {/* <li>
                                <strong>XVI)</strong> Date:
                                <input type="date" className="border border-gray-300 p-2 mt-2" />
                                </li>
                                <li>
                                <strong>XVII)</strong> Name:
                                <input type="text" placeholder="Your Full Name" className="border border-gray-300 p-2 mt-2" />
                                </li>
                                <li>
                                <strong>XVIII)</strong> Signature:
                                <input type="file" className="border border-gray-300 p-2 mt-2" accept="image/*" />
                                </li> */}
                            </ul>
                            </>
                        }
                    />

                </div>

                <div className="mt-10 text-sm text-center text-gray-500 italic">
                    These terms are subject to change without prior notice. By proceeding with the booking, you agree to all the conditions mentioned above.
                </div>

                <div className="mt-8 flex items-center justify-between">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={accepted}
                            onChange={(e) => setAccepted(e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700 font-medium">I accept the terms and conditions</span>
                    </label>

                    <button
                        disabled={!accepted}
                        onClick={() => window.location.href = paymentUrl}
                        className={`px-6 py-2 rounded-md text-white font-semibold transition duration-200 ${
                            accepted ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                        Proceed to Payment
                    </button>
                </div>
            </div>
        </div>
    );
}

function Section({ title, content }) {
    return (
        <section className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">{title}</h2>
            <div className="text-gray-700 space-y-2">{content}</div>
        </section>
    );
}
