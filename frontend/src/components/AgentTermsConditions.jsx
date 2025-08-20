import { useState, useEffect } from 'react';
import axios from '../api'; // Import axios

const API_URL = '/api/terms/latest?type=agents';

export default function AgentTermsConditions() {
  const [termsData, setTermsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await axios.get(API_URL);
        console.log(response)
        // Axios automatically parses the JSON, so the data is in response.data
        setTermsData(response.data);
      } catch (e) {
        // Axios handles non-2xx responses as errors, which are caught here.
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTerms();
  }, []); // The empty dependency array ensures this runs only once on mount.

  // --- Conditional rendering for loading, error, and content states ---
  
  if (loading) {
    return (
      <>
        <div className="max-w-4xl mx-auto p-6 my-5 text-center text-gray-500">
          Loading terms and conditions...
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="max-w-4xl mx-auto p-6 my-5 text-center text-red-500">
          Error: {error}. Could not load terms and conditions.
        </div>
      </>
    );
  }

  if (!termsData) {
    return (
      <>
        <div className="max-w-4xl mx-auto p-6 my-5 text-center text-gray-500">
          No terms and conditions found.
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden p-6 my-5">
        <h1 className="text-2xl font-bold text-blue-600 mb-6">{termsData.mainHeader}</h1>
        
        <div className="prose">
          {termsData.introText && <p>{termsData.introText}</p>}
          
          {/* Dynamically render sections based on their type */}
          {termsData.sections.map((section, index) => (
            <div key={index} className="mt-6">
              <h2 className="underline text-lg font-semibold">{section.heading}</h2>
              
              {/* Render content based on section type */}
              {section.type === 'paragraph' && (
                <p>{section.content}</p>
              )}
              
              {section.type === 'table' && section.tableData && (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border-collapse border border-gray-400 mt-2">
                    <thead className="bg-gray-200">
                      <tr>
                        {section.tableData.headers.map((header, headerIndex) => (
                          <th key={headerIndex} className="p-2 border border-gray-400 text-left">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.tableData.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="even:bg-gray-50">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="p-2 border border-gray-400">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

          {/* Dynamically render footer notes */}
          {termsData.footerNotes && termsData.footerNotes.length > 0 && (
            <div className="mt-6 text-sm text-gray-600">
              {termsData.footerNotes.map((note, index) => (
                <p key={index} className="mt-1">{note}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

