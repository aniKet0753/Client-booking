import React, { useState, useEffect } from 'react'; // Import useEffect
import { useParams, useNavigate } from 'react-router-dom'; // Import useParams and useNavigate
import {
  FaUpload,
  FaSave,
  FaPenAlt,
  FaMapMarkerAlt,
  FaAlignLeft,
  FaDollarSign,
  FaCalendarAlt,
  FaUser,
  FaStar,
} from 'react-icons/fa';
import { MdCheck, MdWarning } from 'react-icons/md';
import { z } from 'zod';
import axios from '../api'; // Import Axios

// Import CKEditor components
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import LoadingSpinner from '../components/LoadingSpinner';
// Zod Schema with optional fields
const blogSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  category: z.enum(['medical', 'wellness', 'travel'], { message: "Invalid category selected" }),
  type: z.enum(['medical', 'wellness', 'travel'], { message: "Invalid type selected" }).optional(),
  location: z.string().min(3, "Location is required"),
  excerpt: z.string().min(50, "Excerpt must be at least 50 characters"),
  content: z.string().min(100, "Content must be at least 100 characters"),
  image: z
    .string()
    .optional()
    .refine((val) => {
      console.log(val);
      return !val || val.startsWith('data:image/');
    }, {
      message: "Image must be a valid base64 image string (e.g., data:image/png;base64,...)"
    })
    .refine((val) => {
        const MAX_BASE64_LENGTH = 7 * 1024 * 1024; // ~7MB for safety
        return !val || val.length <= MAX_BASE64_LENGTH;
    }, {
        message: "Image size exceeds 5MB limit."
    }),
  cost: z.string().optional(),
  author: z.string().optional(),
  authorTitle: z.string().optional(),
  date: z.string().optional(),
  rating: z.number().min(0, "Rating must be between 0 and 5").max(5, "Rating must be between 0 and 5").optional(),
  pros: z.string().optional().transform(val => val ? val.split('\n').map(p => p.trim()).filter(p => p.length > 0) : []),
  cons: z.string().optional().transform(val => val ? val.split('\n').map(c => c.trim()).filter(c => c.length > 0) : [])
});

const BlogPostEditor = () => {
  const { id } = useParams(); // Get the ID from the URL (e.g., /edit-blog/:id)
  const navigate = useNavigate(); // For redirection after save

  const [formData, setFormData] = useState({
    title: '',
    category: 'medical',
    type: 'medical',
    location: '',
    excerpt: '',
    content: '',
    image: undefined,
    cost: '',
    author: '',
    authorTitle: '',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    rating: 0,
    pros: '',
    cons: ''
  });

  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoadingBlog, setIsLoadingBlog] = useState(false); // New state for loading existing blog

  // Effect to fetch blog data if ID is present (for editing)
  useEffect(() => {
    const fetchBlogForEdit = async () => {
      if (id) { // Only fetch if an ID is provided in the URL
        setIsLoadingBlog(true);
        try {
          const response = await axios.get(`/api/blogs/${id}`);
          console.log(response);
          const blogData = response.data;

          // Convert pros/cons arrays back to newline-separated strings for textareas
          const formattedPros = blogData.pros ? blogData.pros.join('\n') : '';
          const formattedCons = blogData.cons ? blogData.cons.join('\n') : '';

          setFormData({
            title: blogData.title || '',
            category: blogData.category || 'medical',
            type: blogData.type || 'medical',
            location: blogData.location || '',
            excerpt: blogData.excerpt || '',
            content: blogData.content || '', // CKEditor will display this HTML
            image: blogData.image || undefined, // Base64 image
            cost: blogData.cost || '',
            author: blogData.author || '',
            authorTitle: blogData.authorTitle || '',
            date: blogData.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            rating: blogData.rating || 0,
            pros: formattedPros,
            cons: formattedCons,
          });
          setPreviewImage(blogData.image || null); // Set preview image if available
        } catch (error) {
          console.error('Error fetching blog for edit:', error);
          alert('Failed to load blog for editing. Please try again.');
          navigate('/community-list'); // Redirect if blog not found or error
        } finally {
          setIsLoadingBlog(false);
        }
      }
    };

    fetchBlogForEdit();
  }, [id, navigate]); // Re-run when ID changes or navigate function changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: "Max image size is 5MB" }));
        setPreviewImage(null);
        setFormData(prev => ({ ...prev, image: undefined }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
        setPreviewImage(reader.result);
        if (errors.image) setErrors(prev => ({ ...prev, image: null }));
      };
      reader.onerror = () => {
        setErrors(prev => ({ ...prev, image: "Failed to read image file." }));
        setPreviewImage(null);
        setFormData(prev => ({ ...prev, image: undefined }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, image: undefined }));
      setPreviewImage(null);
    }
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setFormData(prev => ({ ...prev, content: data }));
    if (errors.content) setErrors(prev => ({ ...prev, content: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dataForValidation = {
        ...formData,
        pros: Array.isArray(formData.pros) ? formData.pros.join('\n') : formData.pros,
        cons: Array.isArray(formData.cons) ? formData.cons.join('\n') : formData.cons,
      };

      const validatedData = blogSchema.parse(dataForValidation);
      console.log("Valid data:", validatedData);

      let response;
      if (id) {
        // Update existing blog
        response = await axios.put(`/api/blogs/${id}`, validatedData, {
          headers: {
                    'Content-Type': 'application/json',
                     Authorization: `Bearer ${localStorage.getItem('Token')}` 
                },
        });
        alert(response.data.message || "Blog updated successfully!");
        navigate(`/community-list/${id}`); // Redirect to the updated blog detail page
      } else {
        // Create new blog
        response = await axios.post('/api/blogs', validatedData, {
          headers: {
                    'Content-Type': 'application/json',
                     Authorization: `Bearer ${localStorage.getItem('Token')}` 
                },
        });
        alert(response.data.message || "Blog created successfully!");
        resetForm(); // Reset form for new creation
        // Optionally navigate to the new blog's detail page:
        // navigate(`/community-list/${response.data.blog._id}`);
      }

    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMap = {};
        error.errors.forEach(err => {
          if (err.path) errorMap[err.path[0]] = err.message;
        });
        setErrors(errorMap);
      } else if (axios.isAxiosError(error)) {
        console.error("Submission error:", error.response?.data || error.message);
        alert(`Error: ${error.response?.data?.message || error.message}`);
      } else {
        console.error("Submission error:", error);
        alert(`Error: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'medical',
      type: 'medical',
      location: '',
      excerpt: '',
      content: '',
      image: undefined,
      cost: '',
      author: '',
      authorTitle: '',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      rating: 0,
      pros: '',
      cons: ''
    });
    setPreviewImage(null);
    setErrors({});
  };

  if (isLoadingBlog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl text-gray-700">Loading blog for editing...</p>
        <LoadingSpinner /> {/* Assuming you have this component */}
      </div>
    );
  }

  return (
    <div className="p-6 w-full bg-gray-200 min-h-screen my-5 max-w-[1200px] mx-auto rounded-2xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        {id ? 'Edit Blog Post' : 'Create New Blog Post'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
            <FaPenAlt className="mr-2" /> Basic Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium">Title*</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter blog post title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block mb-2 font-medium">Category*</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="medical">Medical Tourism</option>
                <option value="wellness">Wellness Travel</option>
                <option value="travel">Eco Tourism</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="medical">Medical</option>
                <option value="wellness">Wellness</option>
                <option value="travel">Travel</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Location*</label>
              <div className="relative">
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg pl-10 ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter location"
                />
                <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
            <FaUpload className="mr-2" /> Featured Image
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="cursor-pointer bg-gray-100 px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors">
                <FaUpload /> Choose Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
              {previewImage && (
                <div className="relative">
                  <img src={previewImage} alt="Preview" className="h-24 w-24 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      setFormData(prev => ({ ...prev, image: undefined }));
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">Recommended size: 1200x630px (5MB max)</p>
            {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
            <FaAlignLeft className="mr-2" /> Content
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block mb-2 font-medium">Excerpt*</label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={3}
                className={`w-full p-3 border rounded-lg ${errors.excerpt ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Short description that appears in blog listings"
              />
              {errors.excerpt && <p className="text-red-500 text-sm mt-1">{errors.excerpt}</p>}
            </div>

            <div>
              <label className="block mb-2 font-medium">Content*</label>
              <div className={errors.content ? 'border border-red-500 rounded-lg p-1' : ''}>
                <CKEditor
                  editor={ClassicEditor}
                  data={formData.content}
                  onChange={handleEditorChange}
                  config={{
                    toolbar: [
                      'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList',
                      'blockQuote', '|', 'undo', 'redo', 'insertTable'
                    ]
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Use the editor above to format your content.</p>
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
            </div>
          </div>
        </section>

        <section>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 font-medium"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            <svg
              className={`ml-2 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              width="16"
              height="16"
              viewBox="0 0 24 24"
            >
              <path fill="currentColor" d="M7 10l5 5 5-5z"/>
            </svg>
          </button>

          {showAdvanced && (
            <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Additional Information</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium">Author</label>
                  <div className="relative">
                    <input
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg pl-10"
                      placeholder="Author name"
                    />
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Author Title</label>
                  <input
                    name="authorTitle"
                    value={formData.authorTitle}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Author credentials/position"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Publish Date</label>
                  <div className="relative">
                    <input
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg pl-10"
                    />
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Rating (0-5)</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleNumberChange}
                      min="0"
                      max="5"
                      step="0.1"
                      className="w-full p-3 border border-gray-300 rounded-lg pl-10"
                    />
                    <FaStar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400" />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Cost Indicator</label>
                  <div className="relative">
                    <input
                      name="cost"
                      value={formData.cost}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg pl-10"
                      placeholder="e.g. $$ (Affordable)"
                    />
                    <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>

              {formData.category === 'medical' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 font-medium flex items-center">
                      <MdCheck className="mr-2 text-green-500" /> Advantages (one per line)
                    </label>
                    <textarea
                      name="pros"
                      value={formData.pros}
                      onChange={handleChange}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Enter advantages, one per line"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium flex items-center">
                      <MdWarning className="mr-2 text-yellow-500" /> Considerations (one per line)
                    </label>
                    <textarea
                      name="cons"
                      value={formData.cons}
                      onChange={handleChange}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Enter considerations, one per line"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1.5"
          >
            {isSubmitting ? (
              id ? 'Updating...' : 'Publishing...'
            ) : (
              <>
                <FaSave /> {id ? 'Update Post' : 'Publish Post'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogPostEditor;