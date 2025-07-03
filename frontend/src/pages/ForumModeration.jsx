import { useState, useEffect } from 'react';
import axios from '../api'; // Ensure this path is correct for your axios instance
import { FaCheck, FaTimes, FaTrash, FaSearch, FaComments, FaReply } from 'react-icons/fa';
import { FiAlertCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom'; // For redirection

const ForumModeration = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [expandedPosts, setExpandedPosts] = useState([]);

    const token = localStorage.getItem('Token');
    const userRole = localStorage.getItem('role');

    // Function to fetch all moderation content
    const fetchModerationContent = async () => {
        if (!token || userRole !== 'superadmin') {
            alert('Access Denied: You must be logged in as a superadmin to view this page.');
            navigate('/login');
            return;
        }

        try {
            const response = await axios.get('/api/posts/moderation', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching moderation content:', error);
            if (error.response && error.response.status === 403) {
                alert("You don't have permission to access this page.");
                navigate('/');
            } else {
                alert('Failed to load moderation content. Please try again.');
            }
        }
    };

    useEffect(() => {
        fetchModerationContent();
    }, [token, userRole]);

    const togglePostExpansion = (id) => {
        if (expandedPosts.includes(id)) {
            setExpandedPosts(expandedPosts.filter(postId => postId !== id));
        } else {
            setExpandedPosts([...expandedPosts, id]);
        }
    };

    // Update Status: Send API request
    const updateContentStatus = async (postId, replyId, status) => {
        try {
            console.log(status)
            if (replyId) {
                await axios.put(`/api/posts/moderation/replies/${postId}/${replyId}/status`,  {status} , {
                    headers: { 
                        'Authorization': `Bearer ${token}` , 
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                await axios.put(`/api/posts/moderation/posts/${postId}/status`, { status }, {
                    headers: { 
                        'Authorization': `Bearer ${token}` , 
                        'Content-Type': 'application/json'
                    }
                }
            );
            }
            // Optimistic update: Update local state immediately for better UX
            setPosts(prevPosts => prevPosts.map(post => {
                if (post._id === postId) {
                    if (replyId) {
                        // Recursive function to find and update the nested reply status
                        const updateNestedReplyStatus = (currentReplies, targetReplyId, newStatus) => {
                            return currentReplies.map(r => {
                                if (r._id === targetReplyId) {
                                    return { ...r, status: newStatus };
                                }
                                if (r.replies && r.replies.length > 0) {
                                    return { ...r, replies: updateNestedReplyStatus(r.replies, targetReplyId, newStatus) };
                                }
                                return r;
                            });
                        };
                        return { ...post, replies: updateNestedReplyStatus(post.replies, replyId, status) };
                    } else {
                        // Update main post's status
                        return { ...post, status };
                    }
                }
                return post;
            }));
            alert('Status updated successfully!');
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status. Please try again.');
        }
    };

    const handleDeleteClick = (postId, replyId = null) => {
        setItemToDelete({ postId, replyId });
        setShowDeleteModal(true);
    };

    // Confirm Delete: Send API request
    const confirmDelete = async () => {
        try {
            if (itemToDelete.replyId) {
                await axios.delete(`/api/posts/moderation/replies/${itemToDelete.postId}/${itemToDelete.replyId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                await axios.delete(`/api/posts/moderation/posts/${itemToDelete.postId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
            fetchModerationContent(); // After successful delete, refetch all content to ensure UI is in sync
            alert('Item deleted successfully!');
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Failed to delete item. Please try again.');
        } finally {
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setItemToDelete(null);
    };

    const countAllContent = () => {
        return posts.reduce((total, post) => total + 1 + countAllReplies(post.replies), 0);
    };

    const countAllReplies = (replies) => {
        if (!replies) return 0;
        return replies.reduce((total, reply) => total + 1 + countAllReplies(reply.replies), 0);
    };

    const countByStatus = (status) => {
        let count = 0;
        posts.forEach(post => {
            if (post.status === status) count++;
            count += countRepliesByStatus(post.replies, status);
        });
        return count;
    };

    const countRepliesByStatus = (replies, status) => {
        if (!replies) return 0;
        let count = 0;
        replies.forEach(reply => {
            if (reply.status === status) count++;
            count += countRepliesByStatus(reply.replies, status);
        });
        return count;
    };

    // Helper to check for nested pending replies - MOVE THIS DEFINITION UP
    const hasNestedPending = (replies) => {
        if (!replies || replies.length === 0) return false;
        return replies.some(reply => reply.status === 'pending' || hasNestedPending(reply.replies));
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch =
            post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (post.title && post.title.toLowerCase().includes(searchTerm.toLowerCase()));

        const hasPendingContent = post.status === 'pending' || hasNestedPending(post.replies);

        return hasPendingContent && matchesSearch;
    });


    // Recursive render function for replies to ensure correct IDs are passed
    const renderReplies = (replies, postId, level = 0) => {
        if (!replies || replies.length === 0) return null;
        const indentClass = `pl-${Math.min(level * 4, 20)}`;

        return (
            <div className={`mt-4 ${level > 0 ? indentClass : ''}`}>
                <ul className="space-y-4">
                    {replies.map((reply) => (
                        <li key={reply._id} className="bg-gray-50 p-4 rounded-md">
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center mb-2">
                                        <h5 className="text-md font-medium text-gray-800 mr-3">
                                            {reply.author}
                                        </h5>
                                        {reply.status === 'pending' && (
                                            <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                                                Pending
                                            </span>
                                        )}
                                        {reply.status === 'approved' && (
                                            <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                                Approved
                                            </span>
                                        )}
                                        {reply.status === 'rejected' && (
                                            <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                                                Rejected
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-sm mb-2">{reply.content}</p>
                                    <span className="text-xs text-gray-400">
                                        Replied on {new Date(reply.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex space-x-2">
                                    {reply.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => updateContentStatus(postId, reply._id, 'approved')}
                                                className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md"
                                                title="Approve"
                                            >
                                                <FaCheck size={14} />
                                            </button>
                                            <button
                                                onClick={() => updateContentStatus(postId, reply._id, 'rejected')}
                                                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                                                title="Reject"
                                            >
                                                <FaTimes size={14} />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handleDeleteClick(postId, reply._id)}
                                        className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md"
                                        title="Delete"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            </div>
                            {reply.replies && reply.replies.length > 0 && renderReplies(reply.replies, postId, level + 1)}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <FaComments className="text-indigo-600 text-3xl mr-3" />
                        <h1 className="text-2xl font-bold text-gray-800">Customer Forum Moderation</h1>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search comments..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-4 rounded-lg shadow-sm border border-blue-50">
                        <h3 className="text-sm font-medium text-blue-800 mb-2">Total</h3>
                        <div className="text-2xl font-bold text-blue-900">
                            {countAllContent()}
                        </div>
                        <div className="mt-1 text-xs text-blue-600">All content</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-100 to-green-200 p-4 rounded-lg shadow-sm border border-green-50">
                        <h3 className="text-sm font-medium text-green-800 mb-2">Approved</h3>
                        <div className="text-2xl font-bold text-green-900">
                            {countByStatus('approved')}
                        </div>
                        <div className="mt-1 text-xs text-green-600">Approved content</div>
                    </div>
                    <div className="bg-gradient-to-r from-amber-100 to-amber-200 p-4 rounded-lg shadow-sm border border-amber-50">
                        <h3 className="text-sm font-medium text-amber-800 mb-2">Pending</h3>
                        <div className="text-2xl font-bold text-amber-900">
                            {countByStatus('pending')}
                        </div>
                        <div className="mt-1 text-xs text-amber-600">Needs review</div>
                    </div>
                    <div className="bg-gradient-to-r from-rose-100 to-rose-200 p-4 rounded-lg shadow-sm border border-rose-50">
                        <h3 className="text-sm font-medium text-rose-800 mb-2">Rejected</h3>
                        <div className="text-2xl font-bold text-rose-900">
                            {countByStatus('rejected')}
                        </div>
                        <div className="mt-1 text-xs text-rose-600">Removed content</div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <FiAlertCircle className="text-yellow-500 mr-2" />
                            <span className="font-medium">
                                {countByStatus('pending')} content items awaiting moderation
                            </span>
                        </div>
                    </div>

                    {filteredPosts.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No pending content to moderate
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {filteredPosts.map((post) => (
                                <li key={post._id} className="p-6 hover:bg-gray-50">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center mb-2">
                                                <h3 className="text-lg font-medium text-gray-900 mr-3">
                                                    {post.author}
                                                </h3>
                                                {post.status === 'pending' && (
                                                    <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                                                        Pending
                                                    </span>
                                                )}
                                                {post.status === 'approved' && (
                                                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                                        Approved
                                                    </span>
                                                )}
                                                {post.status === 'rejected' && (
                                                    <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                                                        Rejected
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-semibold text-gray-700 mb-1">{post.title}</h4>
                                            <p className="text-gray-700 mb-3">{post.content}</p>
                                            <span className="text-sm text-gray-500">
                                                Posted on {new Date(post.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex space-x-2">
                                            {post.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => updateContentStatus(post._id, null, 'approved')}
                                                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md"
                                                        title="Approve Post"
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                    <button
                                                        onClick={() => updateContentStatus(post._id, null, 'rejected')}
                                                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                                                        title="Reject Post"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDeleteClick(post._id)}
                                                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md"
                                                title="Delete Post"
                                            >
                                                <FaTrash />
                                            </button>
                                            {post.replies && post.replies.length > 0 && (
                                                <button
                                                    onClick={() => togglePostExpansion(post._id)}
                                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                                                    title={expandedPosts.includes(post._id) ? "Hide replies" : "Show replies"}
                                                >
                                                    <FaReply className={expandedPosts.includes(post._id) ? "transform rotate-180" : ""} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Replies section */}
                                    {expandedPosts.includes(post._id) && post.replies && post.replies.length > 0 && (
                                        <div className="mt-4 pl-8 border-l-2 border-gray-200">
                                            <h4 className="text-sm font-medium text-gray-500 mb-3">Replies ({post.replies.length})</h4>
                                            {renderReplies(post.replies, post._id, 0)}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                            <h2 className="text-lg font-semibold mb-4">Are you sure?</h2>
                            <p className="mb-6">Do you really want to delete this {itemToDelete?.replyId ? 'reply' : 'post'}? This action cannot be undone.</p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={cancelDelete}
                                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
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

export default ForumModeration;