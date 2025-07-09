import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaUser, 
  FaArrowLeft, 
  FaShareAlt, 
  FaBookmark, 
  FaRegBookmark,
  FaMapMarkerAlt,
  FaHospital,
  FaPlane,
  FaMoneyBillWave,
  FaStar,
  FaClinicMedical
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  // Simulate API fetch with travel/medical tourism content
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data with medical tourism and travel content
        const mockBlogs = [
          {
            id: 1,
            title: 'Top 10 Dental Tourism Destinations in 2024',
            excerpt: 'Discover the best countries for affordable, high-quality dental care combined with vacation opportunities.',
            image: 'https://plus.unsplash.com/premium_photo-1718146019714-a7a0ab9e8e8d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            date: 'Jan 15, 2024',
            author: 'Dr. Sarah Johnson',
            authorTitle: 'Dental Tourism Specialist',
            category: 'Medical Tourism',
            location: 'Global',
            type: 'medical',
            rating: 4.8,
            cost: '$$ (Affordable)',
            content: `
              <div class="space-y-6">
                <section>
                  <h2 class="text-2xl font-bold mb-4 text-gray-800">Why Consider Dental Tourism?</h2>
                  <p class="mb-4 text-gray-700">Dental tourism has become increasingly popular as patients seek high-quality care at significantly lower costs. Many countries now offer world-class dental facilities at a fraction of Western prices, combined with the opportunity for a vacation.</p>
                  
                  <div class="bg-blue-50 p-4 rounded-lg mb-6">
                    <h3 class="font-semibold text-lg mb-2 text-blue-800">Key Benefits:</h3>
                    <ul class="list-disc pl-6 space-y-2 text-blue-700">
                      <li>Cost savings of 50-70% compared to US/EU prices</li>
                      <li>No waiting lists for procedures</li>
                      <li>Vacation opportunities in exotic locations</li>
                      <li>Internationally trained, English-speaking dentists</li>
                    </ul>
                  </div>
                </section>
                
                <section>
                  <h2 class="text-2xl font-bold mb-4 text-gray-800">Top Destinations</h2>
                  
                  <div class="grid md:grid-cols-2 gap-6 mb-6">
                    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <h3 class="font-bold text-lg mb-2 text-gray-800">1. Budapest, Hungary</h3>
                      <p class="text-gray-600 mb-3">Known as the "Dental Capital of Europe," Budapest offers exceptional quality at low prices with over 500 dental clinics.</p>
                      <div class="flex items-center text-sm text-gray-500">
                        <FaMoneyBillWave class="mr-1" /> Avg. savings: 60-70%
                      </div>
                    </div>
                    
                    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <h3 class="font-bold text-lg mb-2 text-gray-800">2. Cancun, Mexico</h3>
                      <p class="text-gray-600 mb-3">Combine dental work with a beach vacation at modern clinics catering to international patients.</p>
                      <div class="flex items-center text-sm text-gray-500">
                        <FaMoneyBillWave class="mr-1" /> Avg. savings: 50-65%
                      </div>
                    </div>
                  </div>
                </section>
                
                <section>
                  <h2 class="text-2xl font-bold mb-4 text-gray-800">What to Consider</h2>
                  <div class="bg-yellow-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-lg mb-2 text-yellow-800">Important Factors:</h3>
                    <ul class="list-disc pl-6 space-y-2 text-yellow-700">
                      <li>Verify dentist credentials and clinic certifications</li>
                      <li>Plan for recovery time in your itinerary</li>
                      <li>Check insurance coverage for follow-up care at home</li>
                      <li>Read patient reviews thoroughly</li>
                    </ul>
                  </div>
                </section>
              </div>
            `,
            pros: [
              'Significant cost savings',
              'High-quality facilities',
              'Combined with vacation',
              'No waiting periods'
            ],
            cons: [
              'Travel expenses',
              'Language barriers possible',
              'Limited recourse for complications'
            ]
          },
          // Other mock blogs would be here...
        ];
        
        const foundBlog = mockBlogs.find(blog => blog.id === parseInt(id));
        setBlog(foundBlog);
        
        // Simulate fetching related blogs
        await new Promise(resolve => setTimeout(resolve, 500));
        setRelatedBlogs(mockBlogs.filter(b => b.id !== parseInt(id)).slice(0, 3));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching blog:', error);
        setLoading(false);
      }
    };
    
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <LoadingSpinner />
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Article not found</h2>
          <Link to="/" className="text-primary hover:underline flex items-center justify-center">
            <FaArrowLeft className="mr-2" /> Back to all articles
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Link 
          to="/blog-list" 
          className="inline-flex items-center text-primary hover:text-primary-dark mb-6 transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Back to all articles
        </Link>
        
        <article className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Hero Image with Gradient Overlay */}
          <div className="h-64 md:h-96 overflow-hidden relative">
            <img 
              src={blog.image} 
              alt={blog.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
              <div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  blog.type === 'medical' ? 'bg-blue-600 text-white' : 
                  blog.type === 'wellness' ? 'bg-green-600 text-white' : 
                  'bg-teal-600 text-white'
                }`}>
                  {blog.category}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center flex-wrap gap-4 text-gray-500 text-sm">
                <span className="flex items-center">
                  <FaCalendarAlt className="mr-1" />
                  {blog.date}
                </span>
                <span className="flex items-center">
                  {blog.type === 'medical' ? <FaHospital className="mr-1" /> : <FaPlane className="mr-1" />}
                  {blog.location}
                </span>
                {blog.rating && (
                  <span className="flex items-center">
                    <FaStar className="mr-1 text-yellow-400" />
                    {blog.rating}/5
                  </span>
                )}
                {blog.cost && (
                  <span className="flex items-center">
                    <FaMoneyBillWave className="mr-1" />
                    {blog.cost}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setBookmarked(!bookmarked)}
                  className="text-gray-500 hover:text-primary transition-colors"
                  aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
                >
                  {bookmarked ? <FaBookmark className="text-primary" /> : <FaRegBookmark />}
                </button>
                <button className="text-gray-500 hover:text-primary transition-colors" aria-label="Share">
                  <FaShareAlt />
                </button>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">{blog.title}</h1>
            
            {/* Author Bio */}
            {blog.authorTitle && (
              <div className="flex items-center mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="mr-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center">
                    <FaUser size={20} />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{blog.author}</h4>
                  <p className="text-sm text-gray-600">{blog.authorTitle}</p>
                </div>
              </div>
            )}
            
            {/* Main Content */}
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }}></div>
            
            {/* Pros/Cons Section for Medical Tourism */}
            {blog.type === 'medical' && blog.pros && blog.cons && (
              <div className="mt-10 grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-green-800 flex items-center">
                    <FaClinicMedical className="mr-2" /> Advantages
                  </h3>
                  <ul className="space-y-3">
                    {blog.pros.map((pro, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-gray-700">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-red-800 flex items-center">
                    <FaClinicMedical className="mr-2" /> Considerations
                  </h3>
                  <ul className="space-y-3">
                    {blog.cons.map((con, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">⚠️</span>
                        <span className="text-gray-700">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </article>
        
        {relatedBlogs.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">You Might Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.map(blog => (
                <div 
                  key={blog.id} 
                  className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                    blog.type === 'medical' ? 'border-t-4 border-blue-500' : 
                    blog.type === 'wellness' ? 'border-t-4 border-green-500' : 
                    'border-t-4 border-teal-500'
                  }`}
                >
                  <div className="h-48 overflow-hidden relative">
                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        blog.type === 'medical' ? 'bg-blue-600 text-white' : 
                        blog.type === 'wellness' ? 'bg-green-600 text-white' : 
                        'bg-teal-600 text-white'
                      }`}>
                        {blog.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2 text-gray-800 line-clamp-2">{blog.title}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{blog.excerpt}</p>
                    <Link 
                      to={`/blog/${blog.id}`} 
                      className="text-primary hover:underline font-medium flex items-center group"
                    >
                      Read more
                      <FaArrowRight className="ml-1 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogDetails;