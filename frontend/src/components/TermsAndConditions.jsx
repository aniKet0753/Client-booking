import React, { useState, useEffect } from 'react';
import axios from '../api';
import { useSearchParams } from 'react-router-dom';

function renderContent(content) {
  if (!content) return null;

  // Split the content by newlines to handle each line separately
  const lines = content.split('\n');
  
  return (
    <>
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          return null; // Skip empty lines
        }

        // Check for list item syntax: starts with '*', 'a)', 'b)', etc.
        if (trimmedLine.startsWith('*')) {
          // Unordered list item
          const contentWithoutBullet = trimmedLine.substring(1).trim();
          return (
            <li key={index} className="list-disc ml-6" dangerouslySetInnerHTML={{ __html: contentWithoutBullet }} />
          );
        } else if (trimmedLine.match(/^([a-z]|[A-Z])\)/)) {
            // Ordered list item (e.g., a), b), I), II))
            const match = trimmedLine.match(/^([a-z]|[A-Z])\)/);
            const contentWithoutBullet = trimmedLine.substring(match[0].length).trim();
            return (
              <li key={index} className="list-[lower-alpha] ml-6" dangerouslySetInnerHTML={{ __html: contentWithoutBullet }} />
            );
        } else {
          // Regular paragraph line
          return (
            <p key={index} className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: trimmedLine }} />
          );
        }
      })}
    </>
  );
}

// Component to render a single section
function Section({ section }) {
  if (!section) return null;

  const renderSectionContent = () => {
    if (section.type === 'paragraph') {
      return renderContent(section.content);
    } else if (section.type === 'table' && section.tableData) {
      return (
        <div className="overflow-x-auto mt-2">
          <table className="min-w-full border border-gray-300 text-sm text-left text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                {section.tableData.headers.map((header, index) => (
                  <th key={index} className="border px-4 py-2" dangerouslySetInnerHTML={{ __html: header }} />
                ))}
              </tr>
            </thead>
            <tbody>
              {section.tableData.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border px-4 py-2" dangerouslySetInnerHTML={{ __html: cell }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="border-b pb-6">
      <h2 className="text-xl font-semibold mb-3 text-gray-800" dangerouslySetInnerHTML={{ __html: section.heading }} />
      <div className="text-gray-700 space-y-2">{renderSectionContent()}</div>
    </section>
  );
}

export default function TermsAndConditions() {
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [searchParams] = useSearchParams();
  const paymentUrl = searchParams.get('redirect');

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await axios.get('/api/terms');
        setTerms(response.data);
      } catch (err) {
        setError('Failed to load terms and conditions. Please try again later.');
        console.error("Failed to fetch terms:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Loading terms and conditions...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  }
  
  if (!terms) {
    return <div className="text-center mt-10">No terms and conditions found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-4xl w-full p-8 bg-white shadow-lg rounded-xl border border-gray-200 mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800" dangerouslySetInnerHTML={{ __html: terms.mainHeader }} />
        <p className="text-gray-700 leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: terms.introText }} />

        <div className="space-y-10">
          {terms.sections.map((section, index) => (
            <Section key={index} section={section} />
          ))}
        </div>

        {terms.footerNotes.map((note, index) => (
          <div key={index} className="mt-10 text-sm text-center text-gray-500 italic" dangerouslySetInnerHTML={{ __html: note }} />
        ))}
        

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
            disabled={!accepted || !paymentUrl}
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