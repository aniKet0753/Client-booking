import { useState } from 'react';
import { FiPlus, FiEdit2, FiSave, FiTrash2, FiChevronUp, FiChevronDown, FiX } from 'react-icons/fi';

const EditAgentTermsConditions = () => {
    const [sections, setSections] = useState([
        {
            id: 1,
            title: 'Introduction',
            content: 'These terms and conditions outline the rules and regulations for the use of our website.',
            isEditing: false,
            isExpanded: true,
            type: 'paragraph' // 'paragraph' or 'list'
        }
    ]);
    
    const [activeModal, setActiveModal] = useState({
        type: null, // 'delete' or 'table'
        sectionId: null,
        rowIndex: null,
        action: 'add' // 'add' or 'edit'
    });

    // Section management
    const addSection = () => {
        const newSection = {
            id: Date.now(),
            title: 'New Section',
            content: 'Enter your content here...',
            isEditing: true,
            isExpanded: true,
            type: 'paragraph'
        };
        setSections([...sections, newSection]);
    };

    const deleteSection = (id) => {
        setSections(sections.filter(section => section.id !== id));
        closeModal();
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

    const toggleSectionType = (id) => {
        setSections(sections.map(section => {
            if (section.id === id) {
                return {
                    ...section,
                    type: section.type === 'paragraph' ? 'list' : 'paragraph',
                    content: section.type === 'paragraph' ? ['First list item'] : 'Enter paragraph content...'
                };
            }
            return section;
        }));
    };

    // List item management (for list-type sections)
    const addListItem = (sectionId, item = 'New list item') => {
        setSections(sections.map(section => {
            if (section.id === sectionId && section.type === 'list') {
                return {
                    ...section,
                    content: [...section.content, item]
                };
            }
            return section;
        }));
    };

    const editListItem = (sectionId, itemIndex, newValue) => {
        setSections(sections.map(section => {
            if (section.id === sectionId && section.type === 'list') {
                const updatedContent = [...section.content];
                updatedContent[itemIndex] = newValue;
                return {
                    ...section,
                    content: updatedContent
                };
            }
            return section;
        }));
    };

    const removeListItem = (sectionId, itemIndex) => {
        setSections(sections.map(section => {
            if (section.id === sectionId && section.type === 'list') {
                const updatedContent = section.content.filter((_, index) => index !== itemIndex);
                return {
                    ...section,
                    content: updatedContent
                };
            }
            return section;
        }));
    };

    // Modal management
    const openModal = (type, sectionId, action = 'add', rowIndex = null) => {
        setActiveModal({ type, sectionId, action, rowIndex });
    };

    const closeModal = () => {
        setActiveModal({ type: null, sectionId: null, action: 'add', rowIndex: null });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms & Conditions Builder</h1>
                    <p className="text-lg text-gray-600">
                        Create and organize your terms with this interactive editor
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6">
                        <div className="space-y-4">
                            {sections.map((section, index) => (
                                <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div 
                                        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
                                        onClick={() => toggleExpand(section.id)}
                                    >
                                        <div className="flex items-center">
                                            <span className="text-gray-500 mr-3">{index + 1}.</span>
                                            <h3 className="font-medium text-gray-800">
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
                                                className={`p-1 rounded ${index === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-200'}`}
                                            >
                                                <FiChevronUp />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    moveSection(section.id, 'down');
                                                }}
                                                disabled={index === sections.length - 1}
                                                className={`p-1 rounded ${index === sections.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-200'}`}
                                            >
                                                <FiChevronDown />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleExpand(section.id);
                                                }}
                                                className="p-1 text-gray-500 hover:bg-gray-200 rounded"
                                            >
                                                {section.isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                            </button>
                                        </div>
                                    </div>

                                    {section.isExpanded && (
                                        <div className="p-4">
                                            {section.isEditing ? (
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Section Title
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={section.title}
                                                            onChange={(e) => handleChange(section.id, 'title', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={section.type === 'list'}
                                                                onChange={() => toggleSectionType(section.id)}
                                                                className="h-4 w-4 text-indigo-600"
                                                            />
                                                            <span className="text-sm text-gray-700">Display as bullet list</span>
                                                        </label>
                                                    </div>

                                                    {section.type === 'paragraph' ? (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Content
                                                            </label>
                                                            <textarea
                                                                value={section.content}
                                                                onChange={(e) => handleChange(section.id, 'content', e.target.value)}
                                                                rows={4}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                List Items
                                                            </label>
                                                            <div className="space-y-2">
                                                                {section.content.map((item, itemIndex) => (
                                                                    <div key={itemIndex} className="flex items-center">
                                                                        <span className="mr-2 text-gray-500">•</span>
                                                                        <input
                                                                            type="text"
                                                                            value={item}
                                                                            onChange={(e) => editListItem(section.id, itemIndex, e.target.value)}
                                                                            className="flex-1 px-2 py-1 border-b border-gray-300 focus:border-indigo-500 focus:outline-none"
                                                                        />
                                                                        <button
                                                                            onClick={() => removeListItem(section.id, itemIndex)}
                                                                            className="ml-2 text-red-500 hover:text-red-700"
                                                                        >
                                                                            <FiTrash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <button
                                                                onClick={() => addListItem(section.id)}
                                                                className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                                                            >
                                                                <FiPlus size={14} className="mr-1" />
                                                                Add item
                                                            </button>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-end space-x-3 pt-2">
                                                        <button
                                                            onClick={() => toggleEdit(section.id)}
                                                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                                        >
                                                            <FiSave className="mr-2" />
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => openModal('delete', section.id)}
                                                            className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                                                        >
                                                            <FiTrash2 className="mr-2" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="prose max-w-none">
                                                    {section.type === 'paragraph' ? (
                                                        <p>{section.content}</p>
                                                    ) : (
                                                        <ul>
                                                            {section.content.map((item, index) => (
                                                                <li key={index}>{item}</li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    <div className="flex justify-end mt-4">
                                                        <button
                                                            onClick={() => toggleEdit(section.id)}
                                                            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                                        >
                                                            <FiEdit2 className="mr-2" />
                                                            Edit
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="flex justify-center">
                                <button
                                    onClick={addSection}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    <FiPlus className="mr-2" />
                                    Add New Section
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Section */}
                {sections.length > 0 && (
                    <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Preview</h2>
                            <div className="prose max-w-none">
                                {sections.map((section, index) => (
                                    <div key={`preview-${section.id}`} className="mb-6">
                                        <h3 className="text-lg font-semibold">{index + 1}. {section.title}</h3>
                                        {section.type === 'paragraph' ? (
                                            <p className="mt-2">{section.content}</p>
                                        ) : (
                                            <ul className="mt-2 list-disc pl-5">
                                                {section.content.map((item, itemIndex) => (
                                                    <li key={itemIndex}>{item}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {activeModal.type === 'delete' && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Section</h3>
                            <p className="text-gray-600 mb-6">Are you sure you want to delete this section? This action cannot be undone.</p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteSection(activeModal.sectionId)}
                                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditAgentTermsConditions;