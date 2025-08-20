// import React, { useState, useEffect, useRef } from 'react';
// import axios from '../api';

// const EditorToolbar = ({ onFormat, isBold, isItalic }) => {
//   return (
//     <div className="flex space-x-2 p-2 bg-gray-200 rounded-t-lg border border-gray-300">
//       <button
//         type="button"
//         onClick={() => onFormat('bold')}
//         className={`p-1 rounded font-bold ${isBold ? 'bg-blue-300' : 'hover:bg-gray-300'}`}
//         title="Bold"
//       >
//         B
//       </button>
//       <button
//         type="button"
//         onClick={() => onFormat('italic')}
//         className={`p-1 rounded italic ${isItalic ? 'bg-blue-300' : 'hover:bg-gray-300'}`}
//         title="Italic"
//       >
//         I
//       </button>
//       <button
//         type="button"
//         onClick={() => onFormat('insertUnorderedList')}
//         className="p-1 rounded hover:bg-gray-300"
//         title="Bullet List"
//       >
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//         </svg>
//       </button>
//     </div>
//   );
// };

// const RichTextEditor = ({ value, onChange, placeholder, className }) => {
//   const editorRef = useRef(null);
//   const [isBold, setIsBold] = useState(false);
//   const [isItalic, setIsItalic] = useState(false);
  
//   // Custom hook to save and restore the cursor selection
//   const useSelection = () => {
//     const rangeRef = useRef(null);
//     const saveSelection = () => {
//       const selection = window.getSelection();
//       if (selection.rangeCount > 0) {
//         rangeRef.current = selection.getRangeAt(0);
//       }
//     };
//     const restoreSelection = () => {
//       if (rangeRef.current) {
//         const selection = window.getSelection();
//         selection.removeAllRanges();
//         selection.addRange(rangeRef.current);
//       }
//     };
//     return { saveSelection, restoreSelection };
//   };

//   const { saveSelection, restoreSelection } = useSelection();

//   // Function to check the state of the formatting (e.g., if the current selection is bold)
//   const checkFormattingState = () => {
//     setIsBold(document.queryCommandState('bold'));
//     setIsItalic(document.queryCommandState('italic'));
//   };

//   useEffect(() => {
//     if (editorRef.current) {
//       editorRef.current.addEventListener('input', handleInput);
//       editorRef.current.addEventListener('mouseup', checkFormattingState);
//       editorRef.current.addEventListener('keyup', checkFormattingState);
//     }
//     return () => {
//       if (editorRef.current) {
//         editorRef.current.removeEventListener('input', handleInput);
//         editorRef.current.removeEventListener('mouseup', checkFormattingState);
//         editorRef.current.removeEventListener('keyup', checkFormattingState);
//       }
//     };
//   }, []);

//   useEffect(() => {
//     // This effect ensures the editor content is synced with state without losing focus
//     if (editorRef.current && editorRef.current.innerHTML !== value) {
//       saveSelection(); // Save cursor position
//       editorRef.current.innerHTML = value;
//       restoreSelection(); // Restore cursor position
//     }
//   }, [value]);

//   const handleInput = () => {
//     if (editorRef.current) {
//       onChange(editorRef.current.innerHTML);
//     }
//   };

//   const handleFormat = (command) => {
//     document.execCommand(command, false, null);
//     checkFormattingState(); // Update the button state immediately
//     handleInput(); // Update the parent component's state
//   };

//   return (
//     <div className={className}>
//       <EditorToolbar onFormat={handleFormat} isBold={isBold} isItalic={isItalic} />
//       <div
//         ref={editorRef}
//         className="shadow-inner appearance-none border border-gray-300 rounded-b-lg w-full py-4 px-5 text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg overflow-y-auto"
//         contentEditable="true"
//         onInput={handleInput}
//         style={{ minHeight: '12rem' }}
//         suppressContentEditableWarning={true}
//       ></div>
//     </div>
//   );
// };


// export default function EditTermsAndConditions() {
//   const [terms, setTerms] = useState({
//     mainHeader: 'Terms & Conditions',
//     introText: 'By proceeding with the payment, you agree to the terms and conditions outlined by the company. Please read all the clauses carefully.',
//     sections: [],
//     footerNotes: ['These terms are subject to change without prior notice. By proceeding with the booking, you agree to all the conditions mentioned above.']
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [message, setMessage] = useState('');

//   useEffect(() => {
//     const fetchTerms = async () => {
//       try {
//         const response = await axios.get('/api/terms');
//         setTerms(response.data);
//       } catch (err) {
//         if (axios.isAxiosError(err) && err.response && err.response.status === 404) {
//           setMessage('No existing policy found. You can create a new one with the default values.');
//         } else {
//           setError(`Failed to load terms for editing: ${axios.isAxiosError(err) ? err.response?.data?.message || err.message : err.message}`);
//         }
//         console.error("Failed to fetch terms for editing:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchTerms();
//   }, []);

//   const handleHeaderChange = (e) => {
//     setTerms({ ...terms, mainHeader: e.target.value });
//   };

//   const handleIntroTextChange = (value) => {
//     setTerms({ ...terms, introText: value });
//   };

//   const handleSectionChange = (sectionIndex, field, value) => {
//     const newSections = [...terms.sections];
//     newSections[sectionIndex] = { ...newSections[sectionIndex], [field]: value };
//     setTerms({ ...terms, sections: newSections });
//   };

//   const addSection = (type) => {
//     if (type === 'paragraph') {
//       setTerms({
//         ...terms,
//         sections: [...terms.sections, { heading: '', type: 'paragraph', content: '' }]
//       });
//     } else if (type === 'table') {
//       setTerms({
//         ...terms,
//         sections: [...terms.sections, { heading: '', type: 'table', tableData: { headers: ['Header 1', 'Header 2'], rows: [['', '']] } }]
//       });
//     }
//   };

//   const removeSection = (sectionIndex) => {
//     const newSections = terms.sections.filter((_, i) => i !== sectionIndex);
//     setTerms({ ...terms, sections: newSections });
//   };

//   const handleTableHeaderChange = (sectionIndex, headerIndex, value) => {
//     const newSections = [...terms.sections];
//     newSections[sectionIndex].tableData.headers[headerIndex] = value;
//     setTerms({ ...terms, sections: newSections });
//   };

//   const addTableHeader = (sectionIndex) => {
//     const newSections = [...terms.sections];
//     newSections[sectionIndex].tableData.headers.push('New Header');
//     newSections[sectionIndex].tableData.rows.forEach(row => row.push(''));
//     setTerms({ ...terms, sections: newSections });
//   };

//   const removeTableHeader = (sectionIndex, headerIndex) => {
//     const newSections = [...terms.sections];
//     newSections[sectionIndex].tableData.headers.splice(headerIndex, 1);
//     newSections[sectionIndex].tableData.rows.forEach(row => row.splice(headerIndex, 1));
//     setTerms({ ...terms, sections: newSections });
//   };

//   const handleTableCellChange = (sectionIndex, rowIndex, colIndex, value) => {
//     const newSections = [...terms.sections];
//     newSections[sectionIndex].tableData.rows[rowIndex][colIndex] = value;
//     setTerms({ ...terms, sections: newSections });
//   };

//   const addTableRow = (sectionIndex) => {
//     const newSections = [...terms.sections];
//     const numColumns = newSections[sectionIndex].tableData.headers.length;
//     newSections[sectionIndex].tableData.rows.push(Array(numColumns).fill(''));
//     setTerms({ ...terms, sections: newSections });
//   };

//   const removeTableRow = (sectionIndex, rowIndex) => {
//     const newSections = [...terms.sections];
//     newSections[sectionIndex].tableData.rows.splice(rowIndex, 1);
//     setTerms({ ...terms, sections: newSections });
//   };

//   const handleFooterNoteChange = (index, value) => {
//     const newNotes = [...terms.footerNotes];
//     newNotes[index] = value;
//     setTerms({ ...terms, footerNotes: newNotes });
//   };

//   const addFooterNote = () => {
//     setTerms({ ...terms, footerNotes: [...terms.footerNotes, ''] });
//   };

//   const removeFooterNote = (index) => {
//     const newNotes = terms.footerNotes.filter((_, i) => i !== index);
//     setTerms({ ...terms, footerNotes: newNotes });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage('');
//     setError('');

//     // --- Validation Logic ---
//     if (!terms.mainHeader.trim()) {
//         setError('Main Header is required.');
//         return;
//     }
    
//     for (const section of terms.sections) {
//         if (!section.heading.trim()) {
//             setError('All section headings must be filled.');
//             return;
//         }
//         if (section.type === 'paragraph' && !section.content.trim()) {
//             setError('All paragraph sections must have content.');
//             return;
//         }
//         if (section.type === 'table') {
//             if (section.tableData.headers.some(h => !h.trim())) {
//                 setError('All table headers must be filled.');
//                 return;
//             }
//             for (const row of section.tableData.rows) {
//                 if (row.some(cell => !cell.trim())) {
//                     setError('All table cells must be filled.');
//                     return;
//                 }
//             }
//         }
//     }
    
//     if (terms.footerNotes.some(note => !note.trim())) {
//         setError('All footer notes must be filled.');
//         return;
//     }
//     // --- End Validation Logic ---

//     try {
//       const response = await axios.post('/api/terms', terms, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       setTerms(response.data);
//       setMessage('Terms and Conditions updated successfully!');
//     } catch (err) {
//       console.error("Failed to save terms:", err);
//       if (axios.isAxiosError(err) && err.response) {
//         setError(`Failed to save terms: ${err.response.data.message || err.response.statusText}`);
//       } else {
//         setError(`Failed to save terms: ${err.message}`);
//       }
//     }
//   };

//   if (loading) {
//     return <div className="text-center mt-10">Loading editor...</div>;
//   }

//   if (error) {
//     return <div className="text-center mt-10 text-red-600">{error}</div>;
//   }

//   return (
//     <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden p-10 my-10">
//       <h1 className="text-4xl font-extrabold text-blue-800 mb-10 text-center">Edit Terms & Conditions</h1>
      
//       {message && <div className="bg-green-100 border border-green-400 text-green-700 px-5 py-4 rounded-lg relative mb-6" role="alert">{message}</div>}
//       {error && <div className="bg-red-100 border border-red-400 text-red-700 px-5 py-4 rounded-lg relative mb-6" role="alert">{error}</div>}

//       <form onSubmit={handleSubmit}>
//         {/* Main Header */}
//         <div className="mb-8">
//           <label htmlFor="mainHeader" className="block text-gray-800 text-xl font-bold mb-3">Main Header</label>
//           <input
//             type="text"
//             id="mainHeader"
//             className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-4 px-5 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl"
//             value={terms.mainHeader}
//             onChange={handleHeaderChange}
//             required
//           />
//         </div>

//         {/* Intro Text - Now using custom rich text editor */}
//         <div className="mb-8">
//           <label className="block text-gray-800 text-xl font-bold mb-3">Introductory Paragraph</label>
//           <RichTextEditor
//             value={terms.introText}
//             onChange={handleIntroTextChange}
//             className="bg-white rounded-lg"
//           />
//         </div>

//         {/* Dynamic Sections */}
//         {terms.sections.map((section, sectionIndex) => (
//           <div key={sectionIndex} className="mb-10 p-8 border border-gray-200 rounded-xl bg-gray-50 shadow-md relative">
//             <h3 className="text-2xl font-bold text-gray-800 mb-5">Section {sectionIndex + 1} ({section.type === 'paragraph' ? 'Paragraph' : 'Table'})</h3>
            
//             <button
//               type="button"
//               onClick={() => removeSection(sectionIndex)}
//               className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-full text-sm focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
//               title="Remove Section"
//             >
//               &times;
//             </button>

//             <div className="mb-6">
//               <label htmlFor={`section-heading-${sectionIndex}`} className="block text-gray-800 text-lg font-semibold mb-3">Section Heading</label>
//               <input
//                 type="text"
//                 id={`section-heading-${sectionIndex}`}
//                 className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-3.5 px-4.5 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
//                 value={section.heading}
//                 onChange={(e) => handleSectionChange(sectionIndex, 'heading', e.target.value)}
//                 required
//               />
//             </div>

//             {section.type === 'paragraph' && (
//               <div className="mb-6">
//                 <label className="block text-gray-800 text-lg font-semibold mb-3">Paragraph Content</label>
//                 <RichTextEditor
//                   value={section.content}
//                   onChange={(value) => handleSectionChange(sectionIndex, 'content', value)}
//                   className="bg-white rounded-lg"
//                 />
//               </div>
//             )}

//             {section.type === 'table' && section.tableData && (
//               <div className="mb-6">
//                 <h4 className="text-xl font-bold text-gray-700 mb-4">Table Data</h4>
                
//                 {/* Table Headers */}
//                 <div className="mb-4">
//                   <label className="block text-gray-800 text-lg font-semibold mb-3">Table Headers</label>
//                   <div className="flex flex-wrap gap-2">
//                     {section.tableData.headers.map((header, headerIndex) => (
//                       <div key={headerIndex} className="flex items-center space-x-2">
//                         <input
//                           type="text"
//                           className="shadow-inner appearance-none border border-gray-300 rounded-lg py-2 px-3 text-gray-800 text-md focus:outline-none focus:ring-1 focus:ring-blue-500"
//                           value={header}
//                           onChange={(e) => handleTableHeaderChange(sectionIndex, headerIndex, e.target.value)}
//                           required
//                         />
//                         <button
//                           type="button"
//                           onClick={() => removeTableHeader(sectionIndex, headerIndex)}
//                           className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded-full text-xs"
//                           title="Remove Column"
//                         >
//                           &times;
//                         </button>
//                       </div>
//                     ))}
//                     <button
//                       type="button"
//                       onClick={() => addTableHeader(sectionIndex)}
//                       className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm"
//                     >
//                       Add Column
//                     </button>
//                   </div>
//                 </div>

//                 {/* Table Rows */}
//                 <div className="overflow-x-auto border rounded-lg bg-white p-4">
//                   <label className="block text-gray-800 text-lg font-semibold mb-3">Table Rows</label>
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         {section.tableData.headers.map((header, hIndex) => (
//                           <th key={hIndex} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
//                         ))}
//                         <th className="px-3 py-2"></th> {/* For remove row button */}
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {section.tableData.rows.map((row, rowIndex) => (
//                         <tr key={rowIndex}>
//                           {row.map((cell, colIndex) => (
//                             <td key={colIndex} className="px-3 py-2 whitespace-nowrap">
//                               <input
//                                 type="text"
//                                 className="w-full border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
//                                 value={cell}
//                                 onChange={(e) => handleTableCellChange(sectionIndex, rowIndex, colIndex, e.target.value)}
//                                 required
//                               />
//                             </td>
//                           ))}
//                           <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
//                             <button
//                               type="button"
//                               onClick={() => removeTableRow(sectionIndex, rowIndex)}
//                               className="text-red-600 hover:text-red-900 ml-2"
//                               title="Remove Row"
//                             >
//                               Remove
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                   <button
//                     type="button"
//                     onClick={() => addTableRow(sectionIndex)}
//                     className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-sm"
//                   >
//                     Add Row
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         ))}

//         {/* Footer Notes */}
//         <div className="mb-8 p-8 border border-gray-200 rounded-xl bg-gray-50 shadow-md">
//           <h3 className="text-2xl font-bold text-gray-800 mb-5">Footer Notes</h3>
//           {terms.footerNotes.map((note, index) => (
//             <div key={index} className="mb-4 flex items-center">
//               <textarea
//                 className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-y text-md"
//                 value={note}
//                 onChange={(e) => handleFooterNoteChange(index, e.target.value)}
//                 required
//               ></textarea>
//               <button
//                 type="button"
//                 onClick={() => removeFooterNote(index)}
//                 className="ml-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//           <button
//             type="button"
//             onClick={addFooterNote}
//             className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
//           >
//             Add Footer Note
//           </button>
//         </div>

//         {/* Save Button */}
//         <button
//           type="submit"
//           className="bg-green-700 hover:bg-green-800 text-white font-bold py-4 px-8 rounded-lg focus:outline-none focus:shadow-outline w-full text-xl transition duration-300 ease-in-out transform hover:scale-105"
//         >
//           Save Terms
//         </button>
//       </form>
//     </div>
//   );
// }