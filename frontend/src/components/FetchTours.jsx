import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt,
  faCalendarAlt,
  faClock,
  faTag,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
// import { Link } from 'react-router-dom';

function FetchTours() {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [profile, setProfile] = useState(null);
  const [selectedTour, setSelectedTour] = useState(null);
  const [occupancy, setOccupancy] = useState('');
  const [kycLink, setKycLink] = useState('');
  const token = localStorage.getItem('Token');
  const role = localStorage.getItem('role');
  const fetchTours = async () => {
    try {
      const FetchToursRoute = role === 'superadmin' ? '/api/admin/tours' : '/api/agents/tours';
      const res = await axios.get(FetchToursRoute, {
        headers: {
          Authorization: `Bearer ${token}`,
          Role: role,
        },
      });
      console.log(res.data.tours);

      setTours(res.data.tours || []);
    } catch (err) {
      const message = err?.response?.data?.message;
      setError(
        message === 'Inactive user'
          ? 'Your account is inactive. Please contact support.'
          : message || 'Error fetching tours. Try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const route = role === 'superadmin' || role === 'admin' ? '/api/admin/profile' : '/api/agents/profile';
        const res = await axios.get(route, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('Token')}`,
            Role: role,
          },
        });
        setProfile(res.data);
      } catch (error) {
        console.error('Error fetching profile', error);
      }
    };
    fetchProfile();
  }, []);

  const handleGenerateLink = () => {
    const givenOccupancy = parseInt(occupancy);
    if (!givenOccupancy || givenOccupancy <= 0) {
      alert('Please enter a valid number of people');
      return;
    }
    
    if(selectedTour.remainingOccupancy == 0){
      alert("This tour is currently fully booked. Please check back later—if any cancellations occur, you may have an opportunity to join.");
      return;
    }

    if (givenOccupancy > selectedTour.remainingOccupancy) {
      alert(`Please enter less than or equal to ${selectedTour.remainingOccupancy} people`);
      return;
    }
  
    setGenerating(true);
    setKycLink('');
    
    const tourStartDate = new Date(selectedTour.startDate).toLocaleDateString();
    // const query = new URLSearchParams({
    //   agentID: profile?.agentID,
    //   tourName: selectedTour.name,
    //   tourID: selectedTour.tourID,
    //   tourPricePerHead: selectedTour.pricePerHead,
    //   tourActualOccupancy: selectedTour.occupancy,
    //   tourGivenOccupancy: givenOccupancy,
    //   tourStartDate: encodeURIComponent(tourStartDate)
    // }).toString();
    const query = new URLSearchParams({
      a: profile?.agentID,
      t: selectedTour.tourID,
      p: givenOccupancy
    })
    // Navigate to KYC page with state (not visible in URL)
    // navigate('/kyc', {
    //   state: {
    //     agentID: profile?.agentID,
    //     tourName: selectedTour.name,
    //     tourID: selectedTour.tourID,
    //     tourPricePerHead: selectedTour.pricePerHead,
    //     tourActualOccupancy: selectedTour.occupancy,
    //     tourGivenOccupancy: givenOccupancy,
    //     tourStartDate: encodeURIComponent(tourStartDate),
    //   },
    // });
    // console.log(tourStartDate)
    setTimeout(() => {
      const fullLink = `${window.location.origin}/kyc?${query}`;
      setKycLink(fullLink);
      setGenerating(false);
    }, 2000); 
  };
  
  const handleCopy = () => {
    if (kycLink) {
      navigator.clipboard.writeText(kycLink);
      const copyBtn = document.querySelector('.copyBtn');
      copyBtn.innerText = 'Copied';
      copyBtn.setAttribute('disabled', true);
  
      setTimeout(() => {
        copyBtn.innerText = 'Copy';
        copyBtn.removeAttribute('disabled');
      }, 3000);
    }
  };  
  
  // const handleGenerateLink = async () => {
  //   const givenOccupancy = parseInt(occupancy);
  //   if (!givenOccupancy || givenOccupancy <= 0) {
  //     alert('Please enter a valid number of people');
  //     return;
  //   }
  //   if (givenOccupancy > selectedTour.occupancy) {
  //     alert(`Please enter less than or equal to ${selectedTour.occupancy} number of people`);
  //     return;
  //   }

  //   setGenerating(true);
  //   try {
  //     const response = await axios.post(
  //       '/api/generate-payment-link',
  //       {
  //         agentID: profile.agentID,
  //         tourName: selectedTour.name,
  //         tourPricePerHead: selectedTour.pricePerHead,
  //         tourActualOccupancy: selectedTour.occupancy,
  //         tourGivenOccupancy: givenOccupancy,
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${localStorage.getItem('Token')}`,
  //         },
  //       }
  //     );

  //     setPaymentLinkData({
  //       name: profile.name,
  //       agentID: profile.agentID,
  //       url: response.data.url,
  //     });

  //     setSelectedTour(null);
  //     setOccupancy('');
  //   } catch (error) {
  //     console.error('Error generating payment link:', error);
  //     alert('Error generating payment link');
  //   } finally {
  //     setGenerating(false);
  //   }
  // };


  return (
    <main className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <h2 className="text-4xl font-bold mb-8 text-gray-800 text-center">Explore Our Tours</h2>
      {generating && (
        <div className="flex justify-center mb-4">
          <div className="w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500 text-lg">Loading tours...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : tours.length === 0 ? (
        <p className="text-gray-500">No tours available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-2 duration-300"
            >
              <img
                src={tour.image || 'https://via.placeholder.com/300'}
                alt={tour.name}
                className="w-full h-52 object-cover rounded-t-2xl"
              />

              <div className="p-4 space-y-3">
                <h3 className="text-2xl font-semibold text-gray-800">{tour.name}</h3>
                <p className="text-sm text-gray-500">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 text-indigo-500" />
                  {tour.categoryType} | {tour.country}
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
                    <FontAwesomeIcon icon={faTag} className="mr-2" />
                    {tour.tourType}
                  </span>
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                    ₹ {tour.pricePerHead?.toLocaleString()}
                  </span>
                </div>

                <p className="text-indigo-600 font-bold text-lg">
                  <FontAwesomeIcon icon={faTag} className="mr-2 text-indigo-500" />
                  ₹ {tour.pricePerHead}
                </p>
                <p className="text-sm text-gray-600">
                  <FontAwesomeIcon icon={faClock} className="mr-2 text-gray-400" />
                  Duration: {tour.duration ? `${tour.duration} days` : 'Not specified'}
                </p>
                <p className="text-sm text-gray-600">
                  <FontAwesomeIcon icon={faClock} className="mr-2 text-gray-400" />
                  Occupancy: {tour.occupancy ? `${tour.occupancy} people` : 'NA'}
                </p>
                <p className="text-sm text-gray-600">
                  <FontAwesomeIcon icon={faClock} className="mr-2 text-gray-400" />
                  Remaining Occupancy: {tour.remainingOccupancy ? `${tour.remainingOccupancy} people` : 0}
                </p>
                <p className="text-sm text-gray-600">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-400" />
                  Start: {new Date(tour.startDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-700">
                  <FontAwesomeIcon icon={faInfoCircle} className="mr-1 text-gray-400" />
                  {tour.description?.slice(0, 100)}...
                </p>

                <button
                  className="w-full bg-indigo-700 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-800 transition duration-300"
                  onClick={() => {
                    setSelectedTour(tour);
                    setOccupancy(tour.occupancy || 1); // optional default
                  }}
                >
                  Get KYC link
                </button>
                {/* <Link
                    to={`/kyc?agentID=${profile?.agentID}&tourName=${encodeURIComponent(tour.name)}&tourPricePerHead=${tour.pricePerHead}&tourActualOccupancy=${tour.occupancy}&tourGivenOccupancy=${occupancy}`}
                    className="w-full block text-center bg-indigo-700 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-800 transition duration-300"
                  >
                    Go to KYC
                </Link> */}
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedTour && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
            {/* Close Button */}
            <button
              className="absolute top-3 right-4 text-gray-600 hover:text-red-600 text-2xl font-bold"
              onClick={() => setSelectedTour(null)}
              aria-label="Close modal"
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold mb-4">
              Enter Number of People for: <span className="text-indigo-600">{selectedTour.name}</span>
            </h3>

            <input
              type="number"
              min="1"
              value={occupancy}
              onChange={(e) => setOccupancy(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter number of people"
            />

            {/* {kycLink && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded text-green-800 break-words">
                      <p className="font-medium">KYC Link:</p>
                      <a
                        href={kycLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {kycLink}
                      </a>
                    </div>
              )}

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setSelectedTour(null);
                  setOccupancy('');
                  setKycLink('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                // onClick={() => {
                //   const givenOccupancy = parseInt(occupancy);
                //   const tourStartDate = new Date(selectedTour.startDate).toLocaleDateString();
                //   const tourID = selectedTour.tourID;
                //   if (!givenOccupancy || givenOccupancy <= 0) {
                //     alert('Please enter a valid number of people');
                //     return;
                //   }
                //   if (givenOccupancy > selectedTour.occupancy) {
                //     alert(`Please enter less than or equal to ${selectedTour.occupancy} people`);
                //     return;
                //   }
                  
                //   alert(`https://frontend-agent-management-system.onrender.com/kyc?agentID=${profile.agentID}&tourName=${encodeURIComponent(selectedTour.name)}&tourID=${tourID}&tourPricePerHead=${selectedTour.pricePerHead}&tourActualOccupancy=${selectedTour.occupancy}&tourGivenOccupancy=${givenOccupancy}&tourStartDate=${encodeURIComponent(tourStartDate)}`)
                //   // navigate(`/kyc?agentID=${profile.agentID}&tourName=${encodeURIComponent(selectedTour.name)}&tourID=${tourID}&tourPricePerHead=${selectedTour.pricePerHead}&tourActualOccupancy=${selectedTour.occupancy}&tourGivenOccupancy=${givenOccupancy}&tourStartDate=${encodeURIComponent(tourStartDate)}`);

                // }}
                
                onClick={() => {
                  const givenOccupancy = parseInt(occupancy);
                  if (!givenOccupancy || givenOccupancy <= 0) {
                    return setKycLink('Please enter a valid number of people');
                  }
                  if (givenOccupancy > selectedTour.occupancy) {
                    return setKycLink(`Please enter less than or equal to ${selectedTour.occupancy} number of people`);
                  }
                
                  // Construct the KYC URL
                  const query = new URLSearchParams({
                    agentID: profile?.agentID,
                    tourName: selectedTour.name,
                    tourPricePerHead: selectedTour.pricePerHead,
                    tourActualOccupancy: selectedTour.occupancy,
                    tourGivenOccupancy: givenOccupancy,
                  }).toString();
                
                  const fullLink = `${window.location.origin}/kyc?${query}`;
                  setKycLink(fullLink);
                }}
                
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Confirm & generate KYC link
              </button>
            </div> */}
            {selectedTour && (
              generating ? (
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-500">Generating KYC link...</p>
                </div>
              ) : kycLink ? (
                <div className="mt-4 p-4 bg-green-50 border border-green-300 rounded text-green-800 break-words relative">
                  <p className="font-semibold">KYC Link:</p>
                  <a
                    href={kycLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline break-all block"
                  >
                    {kycLink}
                  </a>
                  <button
                    onClick={handleCopy}
                    className="copyBtn absolute top-2 right-2 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Copy
                  </button>
                  <p className="text-sm mt-2 text-gray-600">You can copy and share this link with the customer.</p>
                </div>
              ) : (
                <button
                  className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
                  onClick={handleGenerateLink}
                >
                  Generate KYC Link
                </button>
              )
            )}

          </div>
        </div>
      )}

    </main>
  );
}

export default FetchTours;