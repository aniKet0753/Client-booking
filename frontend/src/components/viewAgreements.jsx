import React, { useState, useEffect } from 'react';
import axios from '../api';

const ViewAgreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [agreementType, setAgreementType] = useState('agents'); // State to switch between 'agents', 'tour', 'all_customers'
  const [tourId, setTourId] = useState(''); // State to hold the tourId for customer T&Cs
  const token = localStorage.getItem('Token');

  useEffect(() => {
    const fetchAgreements = async () => {
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }
      
      // Clear agreements when switching to a type that requires input
      if (agreementType === 'tour' && !tourId) {
        setAgreements([]);
        setLoading(false);
        setError("Please enter a Tour ID to view customer agreements.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let apiUrl = '';
        if (agreementType === 'all_customers') {
          // New API call for the "All Customers" option
          apiUrl = `/api/terms/all-agreements?userType=Customer`;
          // console.log(`Fetching all customer agreements from: ${apiUrl}`);
          const allAgreementsResponse = await axios.get(apiUrl, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAgreements(allAgreementsResponse.data);
        } else {
          // Existing logic for 'agents' and specific 'tour' T&Cs
          const latestTermsUrl = `/api/terms/latest?type=${agreementType}${agreementType === 'tour' ? `&tourId=${tourId}` : ''}`;
          // console.log(`Fetching latest terms from: ${latestTermsUrl}`);
          const latestTermsResponse = await axios.get(latestTermsUrl, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (latestTermsResponse.data && latestTermsResponse.data._id) {
            const latestTermsId = latestTermsResponse.data._id;
            const usersResponse = await axios.get(`/api/terms/agreed-users/${latestTermsId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setAgreements(usersResponse.data);
          } else {
            setAgreements([]);
          }
        }
      } catch (e) {
        console.error("Error fetching agreements:", e);
        if (e.response) {
            setError(e.response.data.message || "Failed to load agreements.");
        } else {
            setError("Failed to load agreements. Please check your network and try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAgreements();
  }, [agreementType, tourId, token]);

  const handleViewDetails = async (agreement) => {
    setError(null);
    try {
      // If we already have the termsDetails (from the new all_customers route), use it
      if (agreement.termsDetails) {
        setSelectedAgreement({ ...agreement, termsDetails: agreement.termsDetails });
      } else {
        // Otherwise, fetch it using the old method
        const termsResponse = await axios.get(`/api/terms/${agreement.termsId}`);
        setSelectedAgreement({ ...agreement, termsDetails: termsResponse.data });
      }
    } catch (e) {
      console.error("Error fetching detailed agreement:", e);
      setError("Failed to load agreement details.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg">
          <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading Agreements...</p>
        </div>
      </div>
    );
  }

  if (selectedAgreement) {
    const { termsDetails, agreedAt, name } = selectedAgreement;
    return (
      <div className="bg-gray-50 min-h-screen p-6 sm:p-10 font-sans">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <button
              onClick={() => setSelectedAgreement(null)}
              className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M19 12H5"></path>
                <path d="M12 19l-7-7 7-7"></path>
              </svg>
              Back to Agreements
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                Agreement for: <span className="text-indigo-600">{name || 'User Not Found'}</span>
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Agreed on: <span className="font-semibold">{formatDate(agreedAt)}</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md overflow-y-auto max-h-[70vh] border border-gray-200">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{termsDetails?.mainHeader || 'N/A'}</h2>
            <p className="text-gray-600 mb-6">{termsDetails?.introText || 'N/A'}</p>
            {termsDetails?.sections && termsDetails.sections.map((section, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">{section.header}</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{section.content}</p>
              </div>
            ))}
            <div className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-500">
              {termsDetails?.footerNotes && termsDetails.footerNotes.map((note, index) => (
                <p key={index} className="mb-1">{note}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div className="flex items-center mb-4 sm:mb-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 mr-4">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <path d="M8 12h8"></path>
              <path d="M8 16h8"></path>
              <path d="M10 20h4"></path>
            </svg>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {agreementType === 'agents' ? 'Agent Agreements' : 'Customer Agreements'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                A complete list of all {agreementType === 'agents' ? 'agents' : 'customers'} and the terms and conditions they have agreed to.
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <label htmlFor="agreement-type" className="text-sm font-medium text-gray-700 mr-2">View:</label>
            <select
              id="agreement-type"
              name="agreement-type"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={agreementType}
              onChange={(e) => {
                setAgreementType(e.target.value);
                setTourId(''); // Clear tourId when switching types
              }}
            >
              <option value="agents">Agents</option>
              <option value="tour">Customers (Tour T&C)</option>
              {/* New option to view all customer agreements */}
              <option value="all_customers">All Customers</option>
            </select>
            {agreementType === 'tour' && (
              <div className="ml-4">
                <label htmlFor="tour-id" className="text-sm font-medium text-gray-700 sr-only">Tour ID</label>
                <input
                  type="text"
                  id="tour-id"
                  name="tour-id"
                  placeholder="Enter Tour ID"
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={tourId}
                  onChange={(e) => setTourId(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {agreements.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl shadow-md border border-gray-200">
            <p className="text-xl font-semibold text-gray-700">No agreements found.</p>
            {agreementType === 'tour' && !tourId && (
              <p className="mt-2 text-red-500">
                Please enter a Tour ID to search for agreements.
              </p>
            )}
            {agreementType === 'tour' && tourId && (
              <p className="mt-2 text-gray-500">
                No agreements found for the specified Tour ID.
              </p>
            )}
             {agreementType === 'agents' && (
              <p className="mt-2 text-gray-500">
                There are no agent agreements to display at this time.
              </p>
            )}
             {agreementType === 'all_customers' && (
              <p className="mt-2 text-gray-500">
                There are no customer agreements to display at this time.
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {agreementType === 'agents' ? 'Agent Name' : 'Customer Name'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agreement Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Type
                    </th>
                    {agreementType !== 'agents' && (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        T&C Document ID
                      </th>
                    )}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agreements.map((agreement) => (
                    <tr key={agreement._id} className="hover:bg-gray-100 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {agreement.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(agreement.agreedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {agreement.userType || 'N/A'}
                      </td>
                      {agreementType !== 'agents' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {agreement.termsId || 'N/A'}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {agreement.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-center">
                        <button
                          onClick={() => handleViewDetails(agreement)}
                          className="text-indigo-600 hover:text-indigo-900 font-semibold mr-15"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAgreements;