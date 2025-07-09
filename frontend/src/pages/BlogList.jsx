import { useState, useEffect } from 'react';
import { FaFilter, FaSearch, FaCalendarAlt, FaUser, FaArrowRight, FaMapMarkerAlt, FaHospital, FaPlane } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import InnerBanner from '../components/InnerBanner';

const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Simulate API fetch with travel/medical tourism content
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));

                const mockBlogs = [
                    {
                        id: 1,
                        title: 'Top 10 Dental Tourism Destinations in 2024',
                        excerpt: 'Discover the best countries for affordable, high-quality dental care combined with vacation opportunities.',
                        image: 'https://plus.unsplash.com/premium_photo-1718146019714-a7a0ab9e8e8d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                        date: 'Jan 15, 2024',
                        author: 'Sarah Johnson',
                        category: 'Medical Tourism',
                        location: 'Global',
                        type: 'medical',
                        content: 'Detailed content about dental tourism...'
                    },
                    {
                        id: 2,
                        title: 'Bali Wellness Retreats: Healing Body and Soul',
                        excerpt: 'Explore the most luxurious and effective wellness retreats in Bali for complete rejuvenation.',
                        image: 'https://plus.unsplash.com/premium_photo-1718146019714-a7a0ab9e8e8d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                        date: 'Feb 2, 2024',
                        author: 'Michael Chen',
                        category: 'Wellness Travel',
                        location: 'Bali, Indonesia',
                        type: 'wellness',
                        content: 'Detailed content about Bali retreats...'
                    },
                    {
                        id: 3,
                        title: 'Cardiac Surgery Abroad: Best Hospitals & Costs',
                        excerpt: 'Comprehensive guide to world-class cardiac care at a fraction of Western prices.',
                        image: 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                        date: 'Feb 18, 2024',
                        author: 'Dr. Robert Kim',
                        category: 'Medical Tourism',
                        location: 'Various',
                        type: 'medical',
                        content: 'Detailed content about cardiac surgery...'
                    },
                    {
                        id: 4,
                        title: 'Costa Rica: The Eco-Tourism Paradise',
                        excerpt: 'Why Costa Rica leads the world in sustainable tourism and adventure travel.',
                        image: 'https://images.unsplash.com/photo-1465778893808-9b3d1b443be4?q=80&w=1175&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                        date: 'Mar 5, 2024',
                        author: 'Elena Rodriguez',
                        category: 'Eco Tourism',
                        location: 'Costa Rica',
                        type: 'travel',
                        content: 'Detailed content about Costa Rica...'
                    },
                    {
                        id: 5,
                        title: 'Plastic Surgery in South Korea: What to Expect',
                        excerpt: 'Your complete guide to cosmetic procedures in the world capital of plastic surgery.',
                        image: 'https://plus.unsplash.com/premium_photo-1683800241997-a387bacbf06b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                        date: 'Mar 22, 2024',
                        author: 'Jenny Park',
                        category: 'Medical Tourism',
                        location: 'South Korea',
                        type: 'medical',
                        content: 'Detailed content about plastic surgery...'
                    },
                    {
                        id: 6,
                        title: 'Ayurvedic Healing in Kerala: Ancient Wisdom for Modern Health',
                        excerpt: 'Experience traditional Indian medicine in its birthplace for holistic healing.',
                        image: 'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                        date: 'Apr 10, 2024',
                        author: 'Raj Patel',
                        category: 'Wellness Travel',
                        location: 'Kerala, India',
                        type: 'wellness',
                        content: 'Detailed content about Ayurveda...'
                    }
                ];

                setBlogs(mockBlogs);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching blogs:', error);
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    const categories = ['all', ...new Set(blogs.map(blog => blog.category))];

    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || blog.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Category color mapping
    const categoryColors = {
        'Medical Tourism': 'bg-blue-100 text-blue-800',
        'Wellness Travel': 'bg-green-100 text-green-800',
        'Eco Tourism': 'bg-teal-100 text-teal-800'
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <InnerBanner 
                title="Travel & Medical Tourism Insights" 
                subtitle="Explore our latest articles on travel and medical tourism" 
                backgroundImage={'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
            />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="relative w-full md:w-1/2">
                            <input
                                type="text"
                                placeholder="Search destinations or treatments..."
                                className="w-full py-2 px-4 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        </div>

                        <div className="relative w-full md:w-auto bg-gray-600 rounded-lg">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                <FaFilter /> Filter by Category
                            </button>

                            {showFilters && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                    <div className="py-1">
                                        {categories.map(category => (
                                            <button
                                                key={category}
                                                onClick={() => {
                                                    setCategoryFilter(category);
                                                    setShowFilters(false);
                                                }}
                                                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${categoryFilter === category ? 'bg-primary bg-opacity-10 text-primary' : 'text-gray-700'}`}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {categoryFilter !== 'all' && (
                        <div className="mb-4 flex items-center">
                            <span className="text-gray-600 mr-2">Filtering by:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[categoryFilter] || 'bg-gray-100 text-gray-800'}`}>
                                {categoryFilter}
                            </span>
                            <button
                                onClick={() => setCategoryFilter('all')}
                                className="ml-2 text-sm text-gray-500 hover:text-gray-700"
                            >
                                (Clear)
                            </button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : filteredBlogs.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-xl font-medium text-gray-600">No articles found matching your criteria</h3>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setCategoryFilter('all');
                            }}
                            className="mt-4 text-primary hover:underline"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredBlogs.map(blog => (
                            <div
                                key={blog.id}
                                className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fadeIn ${blog.type === 'medical' ? 'border-t-4 border-blue-500' :
                                        blog.type === 'wellness' ? 'border-t-4 border-green-500' :
                                            'border-t-4 border-teal-500'
                                    }`}
                            >
                                <div className="h-[220px] overflow-hidden relative">
                                    <img
                                        src={blog.image}
                                        alt={blog.title}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${blog.type === 'medical' ? 'bg-blue-600 text-white' :
                                                blog.type === 'wellness' ? 'bg-green-600 text-white' :
                                                    'bg-teal-600 text-white'
                                            }`}>
                                            {blog.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 bg-white">
                                    <div className="flex items-center text-xs text-gray-500 mb-3 space-x-4">
                                        <span className="flex items-center">
                                            <FaCalendarAlt className="mr-1" />
                                            {blog.date}
                                        </span>
                                        <span className="flex items-center">
                                            {blog.type === 'medical' ? <FaHospital className="mr-1" /> : <FaPlane className="mr-1" />}
                                            {blog.location}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold mb-3 text-gray-800 line-clamp-2">{blog.title}</h3>
                                    <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt}</p>

                                    <div className="flex justify-between items-center">
                                        <span className="flex items-center text-sm text-gray-500">
                                            <FaUser className="mr-1" />
                                            {blog.author}
                                        </span>

                                        <Link
                                            to={`/blog/${blog.id}`}
                                            className="flex items-center text-primary hover:text-primary-dark font-medium group"
                                        >
                                            Read More
                                            <FaArrowRight className="ml-1 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default BlogList;