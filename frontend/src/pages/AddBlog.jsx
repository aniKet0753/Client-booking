import { useState } from 'react';
import { 
  FaUpload, 
  FaSave, 
  FaPenAlt, 
  FaMapMarkerAlt, 
  FaAlignLeft, 
  FaNewspaper,
  FaDollarSign,
  FaCalendarAlt,
  FaUser,
  FaStar,
  FaHospital,
  FaPlane,
  FaClinicMedical
} from 'react-icons/fa';
import { MdCategory, MdCheck, MdWarning } from 'react-icons/md';
import { z } from 'zod';

// Zod Schema with optional fields
const blogSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  category: z.enum(['medical', 'wellness', 'travel']),
  type: z.enum(['medical', 'wellness', 'travel']).optional(),
  location: z.string().min(3, "Location is required"),
  excerpt: z.string().min(50, "Excerpt must be at least 50 characters"),
  content: z.string().min(100, "Content must be at least 100 characters").or(z.literal('')),
  image: z
    .instanceof(File)
    .refine(file => file.size <= 5_000_000, "Max image size is 5MB")
    .optional(),
  cost: z.string().optional(),
  author: z.string().optional(),
  authorTitle: z.string().optional(),
  date: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  pros: z.string().optional().transform(val => val ? val.split('\n') : []),
  cons: z.string().optional().transform(val => val ? val.split('\n') : [])
});

const BlogPostEditor = () => {
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
      setFormData(prev => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
      if (errors.image) setErrors(prev => ({ ...prev, image: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validatedData = blogSchema.parse(formData);
      console.log("Valid data:", validatedData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Blog post created successfully!");
      resetForm();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMap = {};
        error.errors.forEach(err => {
          if (err.path) errorMap[err.path[0]] = err.message;
        });
        setErrors(errorMap);
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

  return (
    <div className="p-6 w-full bg-gray-200 min-h-screen my-5 max-w-[1200px] mx-auto rounded-2xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Create New Blog Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
        {/* Basic Information Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
            <FaPenAlt className="mr-2" /> Basic Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Title */}
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

            {/* Category */}
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

            {/* Type */}
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

            {/* Location */}
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

        {/* Image Upload */}
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

        {/* Content Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
            <FaAlignLeft className="mr-2" /> Content
          </h2>
          <div className="space-y-6">
            {/* Excerpt */}
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

            {/* Main Content */}
            <div>
              <label className="block mb-2 font-medium">Content*</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={10}
                className={`w-full p-3 border rounded-lg font-mono ${errors.content ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your content (HTML allowed)"
              />
              <p className="text-sm text-gray-500 mt-1">You can use HTML tags for formatting</p>
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
            </div>
          </div>
        </section>

        {/* Optional Fields Section */}
        <section>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-primary hover:text-primary-dark mb-4"
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
                {/* Author */}
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

                {/* Author Title */}
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

                {/* Date */}
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

                {/* Rating */}
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

                {/* Cost */}
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

              {/* Pros and Cons (for Medical Tourism) */}
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

        {/* Form Actions */}
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
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-1.5"
          >
            {isSubmitting ? (
              'Publishing...'
            ) : (
              <>
                <FaSave /> Publish Post
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogPostEditor;