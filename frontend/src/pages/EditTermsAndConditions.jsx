import { useState } from 'react';
import { FiPlus, FiEdit2, FiSave, FiTrash2, FiChevronUp, FiChevronDown, FiX } from 'react-icons/fi';

const TermsAndConditionsBuilder = () => {
    const [sections, setSections] = useState([
        {
            id: 1,
            title: 'Introduction',
            content: 'These terms and conditions outline the rules and regulations for the use of our website.',
            isEditing: false,
            isExpanded: true,
            hasTable: false,
            tableData: []
        }
    ]);
    const [deleteModal, setDeleteModal] = useState({ open: false, sectionId: null });
    const [tableModal, setTableModal] = useState({ open: false, sectionId: null, action: 'add', rowIndex: null });

    const addSection = () => {
        const newSection = {
            id: Date.now(),
            title: 'New Section',
            content: 'Enter your content here...',
            isEditing: true,
            isExpanded: true,
            hasTable: false,
            tableData: []
        };
        setSections([...sections, newSection]);
    };

    const deleteSection = (id) => {
        setSections(sections.filter(section => section.id !== id));
        setDeleteModal({ open: false, sectionId: null });
    };

    const toggleEdit = (id) => {
        setSections(sections.map(section =>
            section.id === id ? { ...section, isEditing: !section.isEditing } : section
        ));
    };

    const toggleExpand = (id) => {
        setSections(sections.map(section =>
            section.id === id ? { ...section, isExpanded: !section.isExpanded } : section
        ));
    };

    const handleChange = (id, field, value) => {
        setSections(sections.map(section =>
            section.id === id ? { ...section, [field]: value } : section
        ));
    };

    const moveSection = (id, direction) => {
        const index = sections.findIndex(section => section.id === id);
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= sections.length) return;

        const newSections = [...sections];
        [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
        setSections(newSections);
    };

    const toggleTable = (sectionId) => {
        setSections(sections.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    hasTable: !section.hasTable,
                    tableData: !section.hasTable ? [{ id: Date.now(), key: '', value: '' }] : []
                };
            }
            return section;
        }));
    };

    const openTableModal = (sectionId, action, rowIndex = null) => {
        setTableModal({ open: true, sectionId, action, rowIndex });
    };

    const closeTableModal = () => {
        setTableModal({ open: false, sectionId: null, action: 'add', rowIndex: null });
    };

    const handleTableAction = (formData) => {
        setSections(sections.map(section => {
            if (section.id === tableModal.sectionId) {
                if (tableModal.action === 'add') {
                    return {
                        ...section,
                        tableData: [...section.tableData, { id: Date.now(), ...formData }]
                    };
                } else if (tableModal.action === 'edit') {
                    return {
                        ...section,
                        tableData: section.tableData.map((row, index) =>
                            index === tableModal.rowIndex ? { ...row, ...formData } : row
                        )
                    };
                }
            }
            return section;
        }));
        closeTableModal();
    };

    const deleteTableRow = (sectionId, rowId) => {
        setSections(sections.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    tableData: section.tableData.filter(row => row.id !== rowId)
                };
            }
            return section;
        }));
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-100">
            <div className="mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">Edit Terms & Conditions</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Create and organize your terms with this interactive editor. Add sections, edit content, and rearrange as needed.
                    </p>
                </div>

                <div className='bg-white rounded-xl shadow-sm p-8 border border-gray-200'>
                    <div className="space-y-4">
                        {sections.map((section, index) => (
                            <div
                                key={section.id}
                                className={`transition-all duration-300 overflow-hidden ${section.isExpanded ? 'border-indigo-200' : ''}`}
                            >
                                <div
                                    className="flex items-center justify-between p-5 cursor-pointer"
                                    onClick={() => toggleExpand(section.id)}
                                >
                                    <div className="flex items-center">
                                        <span className="text-gray-400 font-mono mr-4 w-6 text-right">{index + 1}.</span>
                                        <h3 className={`font-semibold ${section.isEditing ? 'text-indigo-600' : 'text-gray-700'}`}>
                                            {section.title || 'Untitled Section'}
                                        </h3>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveSection(section.id, 'up');
                                            }}
                                            disabled={index === 0}
                                            className={`p-2 rounded-lg ${index === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                                        >
                                            <FiChevronUp />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveSection(section.id, 'down');
                                            }}
                                            disabled={index === sections.length - 1}
                                            className={`p-2 rounded-lg ${index === sections.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                                        >
                                            <FiChevronDown />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleExpand(section.id);
                                            }}
                                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                        >
                                            {section.isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                        </button>
                                    </div>
                                </div>

                                {section.isExpanded && (
                                    <div className="px-5 pb-5">
                                        {section.isEditing ? (
                                            <div className="space-y-4">
                                                <input
                                                    type="text"
                                                    value={section.title}
                                                    onChange={(e) => handleChange(section.id, 'title', e.target.value)}
                                                    placeholder="Section Title"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                                <textarea
                                                    value={section.content}
                                                    onChange={(e) => handleChange(section.id, 'content', e.target.value)}
                                                    placeholder="Section Content"
                                                    rows="5"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                                
                                                <div className="mt-4">
                                                    <label className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={section.hasTable}
                                                            onChange={() => toggleTable(section.id)}
                                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                        />
                                                        <span className="text-gray-700">Include a table in this section</span>
                                                    </label>
                                                </div>

                                                {section.hasTable && (
                                                    <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                                                        <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                                                            <h4 className="font-medium text-gray-700">Table Data</h4>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openTableModal(section.id, 'add');
                                                                }}
                                                                className="flex items-center px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
                                                            >
                                                                <FiPlus className="mr-1" /> Add Row
                                                            </button>
                                                        </div>
                                                        
                                                        {section.tableData.length > 0 ? (
                                                            <div className="overflow-x-auto">
                                                                <table className="min-w-full divide-y divide-gray-200">
                                                                    <thead className="bg-gray-50">
                                                                        <tr>
                                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                                        {section.tableData.map((row, rowIndex) => (
                                                                            <tr key={row.id}>
                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.key}</td>
                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.value}</td>
                                                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                                    <button
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            openTableModal(section.id, 'edit', rowIndex);
                                                                                        }}
                                                                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                                                    >
                                                                                        <FiEdit2 />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            deleteTableRow(section.id, row.id);
                                                                                        }}
                                                                                        className="text-red-600 hover:text-red-900"
                                                                                    >
                                                                                        <FiTrash2 />
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <div className="px-4 py-6 text-center text-gray-500">
                                                                No table rows added yet
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="prose max-w-none text-gray-700 whitespace-pre-line pl-10">
                                                {section.content}
                                                
                                                {section.hasTable && section.tableData.length > 0 && (
                                                    <div className="mt-4 overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {section.tableData.map((row) => (
                                                                    <tr key={row.id}>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.key}</td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.value}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                                            <button
                                                onClick={() => toggleEdit(section.id)}
                                                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${section.isEditing ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                            >
                                                {section.isEditing ? (
                                                    <>
                                                        <FiSave className="mr-2" /> Save Changes
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiEdit2 className="mr-2" /> Edit Section
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ open: true, sectionId: section.id })}
                                                className="flex items-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                            >
                                                <FiTrash2 className="mr-2" /> Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className='flex justify-end'>
                            <button
                                onClick={addSection}
                                className="bottom-6 right-6 z-50 flex items-center px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-all duration-300"
                            >
                                <FiPlus className="mr-2" />
                                <span className="font-medium">Add Section</span>
                            </button>
                        </div>
                    </div>

                    {sections.length > 0 && (
                        <div className="mt-10 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Preview</h2>
                            <div className="prose max-w-none">
                                {sections.map((section, index) => (
                                    <div key={`preview-${section.id}`} className="mb-6">
                                        <h3 className="text-lg font-medium text-gray-800">{index + 1}. {section.title}</h3>
                                        <p className="text-gray-600 mt-2 whitespace-pre-line">{section.content}</p>
                                        
                                        {section.hasTable && section.tableData.length > 0 && (
                                            <div className="mt-4 overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {section.tableData.map((row) => (
                                                            <tr key={`preview-${row.id}`}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.key}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.value}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {deleteModal.open && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                            <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full">
                                <h2 className="text-lg font-semibold mb-4 text-gray-800">Delete Section</h2>
                                <p className="mb-6 text-gray-600">Are you sure you want to delete this section? This action cannot be undone.</p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setDeleteModal({ open: false, sectionId: null })}
                                        className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => deleteSection(deleteModal.sectionId)}
                                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Table Row Modal */}
                    {tableModal.open && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        {tableModal.action === 'add' ? 'Add New Row' : 'Edit Row'}
                                    </h2>
                                    <button
                                        onClick={closeTableModal}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <FiX size={20} />
                                    </button>
                                </div>
                                
                                <TableRowForm 
                                    onSubmit={handleTableAction}
                                    onCancel={closeTableModal}
                                    initialData={
                                        tableModal.action === 'edit' && tableModal.rowIndex !== null
                                            ? sections.find(s => s.id === tableModal.sectionId)?.tableData[tableModal.rowIndex]
                                            : { key: '', value: '' }
                                    }
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TableRowForm = ({ onSubmit, onCancel, initialData }) => {
    const [formData, setFormData] = useState({
        key: initialData?.key || '',
        value: initialData?.value || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                <input
                    type="text"
                    id="key"
                    name="key"
                    value={formData.key}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>
            
            <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <textarea
                    id="value"
                    name="value"
                    value={formData.value}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                >
                    {initialData?.id ? 'Update Row' : 'Add Row'}
                </button>
            </div>
        </form>
    );
};

export default TermsAndConditionsBuilder;