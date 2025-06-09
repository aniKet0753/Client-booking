import { useState } from 'react'
import {
    FiSearch,
    FiPlusCircle,
    FiHeart,
    FiMessageSquare,
    FiShare2,
    FiBookmark
} from 'react-icons/fi'

import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const ForumPage = () => {
    // State for forum functionality
    const [activeCategory, setActiveCategory] = useState('All Topics')
    const [searchQuery, setSearchQuery] = useState('')
    const [showNewPostForm, setShowNewPostForm] = useState(false)
    const [expandedPosts, setExpandedPosts] = useState([])
    const [showReplyForms, setShowReplyForms] = useState([])
    const [bookmarkedPosts, setBookmarkedPosts] = useState([])
    const [likedPosts, setLikedPosts] = useState([2]) // Post with ID 2 is liked by default
    const [likeCounts, setLikeCounts] = useState({
        1: 24,
        2: 15,
        3: 32
    })
    const [newPostTitle, setNewPostTitle] = useState('')
    const [newPostCategory, setNewPostCategory] = useState('Destination Tips')
    const [newPostContent, setNewPostContent] = useState('')
    const [replyTexts, setReplyTexts] = useState({})

    // Forum data
    const forumCategories = [
        'All Topics',
        'Destination Tips',
        'Travel Deals',
        'Accommodation',
        'Transportation',
        'Travel Stories',
        'Questions'
    ]

    const forumPosts = [
        {
            id: 1,
            title: 'Best beaches in Thailand for families',
            author: 'TravelMom42',
            date: '2 days ago',
            category: 'Destination Tips',
            content: 'Looking for recommendations for family-friendly beaches in Thailand. We have two kids (5 and 8) and want somewhere with calm waters and good amenities. We prefer areas with medical facilities nearby just in case and places that have kid-friendly activities. Any suggestions would be greatly appreciated! We are planning our trip for next summer.',
            replies: 12,
        },
        {
            id: 2,
            title: 'Is travel insurance really necessary?',
            author: 'Wanderlust23',
            date: '5 days ago',
            category: 'Questions',
            content: 'I\'m planning a 2-week trip to Europe and wondering if travel insurance is worth the cost. What has been your experience? Did anyone actually need to use it? I\'m visiting France, Italy, and Switzerland if that makes any difference.',
            replies: 8,
        },
        {
            id: 3,
            title: 'Just returned from an amazing safari in Kenya!',
            author: 'AdventureSeeker',
            date: '1 week ago',
            category: 'Travel Stories',
            content: 'Sharing our incredible experience at Maasai Mara. Saw the Big Five and stayed at a wonderful eco-lodge. The guides were extremely knowledgeable and we felt completely safe the entire time. The wildebeest migration was happening during our visit which was spectacular to witness. Happy to answer any questions about planning a similar trip!',
            replies: 5,
        }
    ]

    // Filter posts based on active category and search query
    const filteredPosts = forumPosts.filter(post => {
        const matchesCategory = activeCategory === 'All Topics' || post.category === activeCategory
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    // Toggle post expansion
    const togglePostExpansion = (postId) => {
        if (expandedPosts.includes(postId)) {
            setExpandedPosts(expandedPosts.filter(id => id !== postId))
        } else {
            setExpandedPosts([...expandedPosts, postId])
        }
    }

    // Toggle reply form visibility
    const toggleReplyForm = (postId) => {
        if (showReplyForms.includes(postId)) {
            setShowReplyForms(showReplyForms.filter(id => id !== postId))
        } else {
            setShowReplyForms([...showReplyForms, postId])
        }
    }

    // Toggle bookmark
    const toggleBookmark = (postId) => {
        if (bookmarkedPosts.includes(postId)) {
            setBookmarkedPosts(bookmarkedPosts.filter(id => id !== postId))
        } else {
            setBookmarkedPosts([...bookmarkedPosts, postId])
        }
    }

    // Toggle like
    const toggleLike = (postId) => {
        if (likedPosts.includes(postId)) {
            setLikedPosts(likedPosts.filter(id => id !== postId))
            setLikeCounts({ ...likeCounts, [postId]: likeCounts[postId] - 1 })
        } else {
            setLikedPosts([...likedPosts, postId])
            setLikeCounts({ ...likeCounts, [postId]: likeCounts[postId] + 1 })
        }
    }

    // Handle new post submission
    const handleNewPostSubmit = (e) => {
        e.preventDefault()
        // In a real app, you would send this data to your backend
        console.log('New post submitted:', {
            title: newPostTitle,
            category: newPostCategory,
            content: newPostContent
        })
        // Reset form
        setNewPostTitle('')
        setNewPostContent('')
        setShowNewPostForm(false)
    }

    // Handle reply submission
    const handleReplySubmit = (e, postId) => {
        e.preventDefault()
        // In a real app, you would send this data to your backend
        console.log('Reply submitted for post', postId, ':', replyTexts[postId] || '')
        // Reset form
        setReplyTexts({ ...replyTexts, [postId]: '' })
        setShowReplyForms(showReplyForms.filter(id => id !== postId))
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Sidebar */}
                        <div className="w-full md:w-64 flex-shrink-0">
                            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
                                <h3 className="font-bold text-lg mb-4 text-gray-800">Categories</h3>
                                <ul className="space-y-2">
                                    {forumCategories.map(category => (
                                        <li key={category}>
                                            <button
                                                onClick={() => setActiveCategory(category)}
                                                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeCategory === category ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}
                                            >
                                                {category}
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-8">
                                    <h3 className="font-bold text-lg mb-3 text-gray-800">Forum Rules</h3>
                                    <ul className="text-sm text-gray-600 space-y-2">
                                        <li>• Be respectful to others</li>
                                        <li>• No spam or self-promotion</li>
                                        <li>• Keep discussions travel-related</li>
                                        <li>• Share your experiences</li>
                                    </ul>
                                </div>

                                <div className="mt-6 p-3 bg-blue-50 rounded-md border border-blue-100">
                                    <p className="text-sm text-blue-800">
                                        Need help? Our travel experts are happy to answer your questions!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                <h1 className="text-3xl font-bold text-gray-800 mb-6">Travel Community Forum</h1>

                                {/* Search and New Post */}
                                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                                    <div className="relative flex-1">
                                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search forum posts..."
                                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={() => setShowNewPostForm(true)}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <FiPlusCircle /> New Post
                                    </button>
                                </div>

                                {/* New Post Form */}
                                {showNewPostForm && (
                                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                        <h3 className="text-lg font-semibold mb-3">Create New Post</h3>
                                        <form onSubmit={handleNewPostSubmit}>
                                            <div className="mb-3">
                                                <label className="block text-gray-700 mb-1">Title</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-2 border border-gray-300 rounded"
                                                    value={newPostTitle}
                                                    onChange={(e) => setNewPostTitle(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="block text-gray-700 mb-1">Category</label>
                                                <select
                                                    className="w-full p-2 border border-gray-300 rounded"
                                                    value={newPostCategory}
                                                    onChange={(e) => setNewPostCategory(e.target.value)}
                                                >
                                                    {forumCategories.filter(cat => cat !== 'All Topics').map(category => (
                                                        <option key={category} value={category}>{category}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label className="block text-gray-700 mb-1">Content</label>
                                                <textarea
                                                    rows="4"
                                                    className="w-full p-2 border border-gray-300 rounded"
                                                    value={newPostContent}
                                                    onChange={(e) => setNewPostContent(e.target.value)}
                                                    required
                                                ></textarea>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPostForm(false)}
                                                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                >
                                                    Post
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Posts List */}
                                <div className="space-y-6">
                                    {filteredPosts.length > 0 ? (
                                        filteredPosts.map(post => (
                                            <div key={post.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                                                <div className="bg-white p-5">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mb-2">
                                                                {post.category}
                                                            </span>
                                                            <h3 className="text-xl font-semibold text-gray-800">{post.title}</h3>
                                                        </div>
                                                        <button
                                                            onClick={() => toggleBookmark(post.id)}
                                                            className={`p-2 rounded-full ${bookmarkedPosts.includes(post.id) ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-600'}`}
                                                        >
                                                            <FiBookmark />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                                        <span className="font-medium text-gray-700">{post.author}</span>
                                                        <span className="mx-2">•</span>
                                                        <span>{post.date}</span>
                                                    </div>

                                                    <p className={`text-gray-700 mb-4 ${!expandedPosts.includes(post.id) ? 'line-clamp-3' : ''}`}>
                                                        {post.content}
                                                    </p>

                                                    {post.content.length > 150 && (
                                                        <button
                                                            onClick={() => togglePostExpansion(post.id)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4"
                                                        >
                                                            {expandedPosts.includes(post.id) ? 'Show less' : 'Read more'}
                                                        </button>
                                                    )}

                                                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                                        <div className="flex items-center space-x-4">
                                                            <button
                                                                onClick={() => toggleLike(post.id)}
                                                                className={`flex items-center space-x-1 ${likedPosts.includes(post.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                                                            >
                                                                <FiHeart className={likedPosts.includes(post.id) ? 'fill-current' : ''} />
                                                                <span>{likeCounts[post.id] || 0}</span>
                                                            </button>
                                                            <button
                                                                onClick={() => toggleReplyForm(post.id)}
                                                                className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
                                                            >
                                                                <FiMessageSquare />
                                                                <span>{post.replies}</span>
                                                            </button>
                                                        </div>
                                                        <button className="text-gray-500 hover:text-gray-700">
                                                            <FiShare2 />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Reply Form */}
                                                {showReplyForms.includes(post.id) && (
                                                    <div className="bg-gray-50 p-5 border-t border-gray-200">
                                                        <form onSubmit={(e) => handleReplySubmit(e, post.id)}>
                                                            <textarea
                                                                value={replyTexts[post.id] || ''}
                                                                onChange={(e) => setReplyTexts({ ...replyTexts, [post.id]: e.target.value })}
                                                                placeholder="Write your reply..."
                                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                                                                rows="3"
                                                                required
                                                            />
                                                            <div className="flex justify-end space-x-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleReplyForm(post.id)}
                                                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    type="submit"
                                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                                >
                                                                    Post Reply
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10">
                                            <p className="text-gray-500">No posts found. Try a different search or category.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default ForumPage