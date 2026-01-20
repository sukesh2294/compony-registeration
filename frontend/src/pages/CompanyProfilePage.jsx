import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Edit2,
  Save,
  X,
  Upload,
  Users,
  Calendar,
  Briefcase,
  Link,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Image,
  FileText,
  Shield,
} from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import companyService from "../services/companyService";

const SOCIAL_MEDIA_PLATFORMS = [
  { id: "facebook", label: "Facebook", icon: Facebook, placeholder: "https://facebook.com/yourcompany" },
  { id: "twitter", label: "Twitter", icon: Twitter, placeholder: "https://twitter.com/yourcompany" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, placeholder: "https://linkedin.com/company/yourcompany" },
  { id: "instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/yourcompany" },
];

const INDUSTRY_CATEGORIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Retail",
  "Education",
  "Real Estate",
  "Hospitality",
  "Transportation",
  "Construction",
  "Consulting",
  "Marketing",
  "Other",
];

const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
];

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const user = useSelector((s) => s.auth.user);
  const [progress, setProgress] = useState({
    basicInfo: 0,
    contactInfo: 0,
    about: 0,
    social: 0,
    overall: 0,
  });

  // Fetch company profile
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await companyService.getCompanyProfile();
      setProfile(response.data);
      
      // Calculate completion progress
      calculateProgress(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load company profile");
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Calculate completion progress
  const calculateProgress = useCallback((profileData) => {
    if (!profileData) return;

    const basicInfoFields = ['name', 'industry', 'companySize', 'foundedYear'];
    const contactInfoFields = ['email', 'phone', 'website', 'address'];
    const aboutFields = ['description', 'mission', 'values'];
    const socialFields = ['socialMedia'];

    const calculate = (fields) => {
      let filled = 0;
      fields.forEach(field => {
        if (field === 'socialMedia') {
          const hasSocial = profileData.socialMedia && 
            Object.values(profileData.socialMedia).some(val => val && val.trim());
          if (hasSocial) filled++;
        } else if (profileData[field] && profileData[field].toString().trim()) {
          filled++;
        }
      });
      return Math.round((filled / fields.length) * 100);
    };

    const basicInfo = calculate(basicInfoFields);
    const contactInfo = calculate(contactInfoFields);
    const about = calculate(aboutFields);
    const social = calculate(socialFields);
    const overall = Math.round((basicInfo + contactInfo + about + social) / 4);

    setProgress({ basicInfo, contactInfo, about, social, overall });
  }, []);

  // Enter edit mode
  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      ...profile,
      socialMedia: profile?.socialMedia || {},
    });
    setLogoPreview(profile?.logo);
    setSuccess("");
    setError("");
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
    setLogoPreview(null);
    setLogoFile(null);
    setError("");
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle social media changes
  const handleSocialChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value,
      },
    }));
  };

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, GIF, WebP)");
      return;
    }

    if (file.size > maxSize) {
      setError("Image size should be less than 5MB");
      return;
    }

    setLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setFormData(prev => ({ ...prev, logo: null }));
  };

  // Save profile
  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Prepare form data for file upload
      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'socialMedia') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key]);
        }
      });

      // Add logo file if selected
      if (logoFile) {
        submitData.append('logoFile', logoFile);
      }

      // Update profile
      const response = await companyService.updateCompanyProfile(submitData);
      
      // Update local state
      setProfile(response.data);
      setIsEditing(false);
      setLogoFile(null);
      setSuccess("Company profile updated successfully!");
      
      // Recalculate progress
      calculateProgress(response.data);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to update profile");
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
    }
  };

  // Progress bar component
  const ProgressBar = ({ percentage, label, color = "bg-blue-600" }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );

  // View mode - Company Profile Display
  const renderViewMode = () => (
    <>
      {/* Header with Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {profile?.logo ? (
              <img 
                src={profile.logo} 
                alt={profile.name} 
                className="w-20 h-20 rounded-xl object-cover border border-gray-300"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center border border-gray-300">
                <Building className="w-10 h-10 text-purple-600" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile?.name || "Your Company"}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile?.industry && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {profile.industry}
                  </span>
                )}
                {profile?.companySize && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {profile.companySize}
                  </span>
                )}
                {profile?.foundedYear && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    Est. {profile.foundedYear}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="lg:text-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
              <Shield className="w-4 h-4" />
              Profile Visibility: {profile?.isPublic ? "Public" : "Private"}
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="mt-8 pt-8 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-xl font-bold text-gray-900">{progress.overall}%</span>
              </div>
              <ProgressBar percentage={progress.overall} color="bg-blue-600" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Basic Info</span>
                <span className="text-lg font-semibold text-gray-900">{progress.basicInfo}%</span>
              </div>
              <ProgressBar percentage={progress.basicInfo} color="bg-green-600" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Contact Info</span>
                <span className="text-lg font-semibold text-gray-900">{progress.contactInfo}%</span>
              </div>
              <ProgressBar percentage={progress.contactInfo} color="bg-purple-600" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">About Section</span>
                <span className="text-lg font-semibold text-gray-900">{progress.about}%</span>
              </div>
              <ProgressBar percentage={progress.about} color="bg-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contact & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">About Company</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {progress.about}% Complete
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Company Description</h4>
                <p className="text-gray-700 whitespace-pre-line">
                  {profile?.description || "No description provided yet."}
                </p>
              </div>
              
              {profile?.mission && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Our Mission
                  </h4>
                  <p className="text-gray-700">{profile.mission}</p>
                </div>
              )}
              
              {profile?.values && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Core Values</h4>
                  <p className="text-gray-700">{profile.values}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile?.email && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <a href={`mailto:${profile.email}`} className="text-gray-900 font-medium hover:text-blue-600">
                      {user.email}
                    </a>
                  </div>
                </div>
              )}
              
              {profile?.phone && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <a href={`tel:${profile.phone}`} className="text-gray-900 font-medium hover:text-green-600">
                      {user.mobile_no}
                    </a>
                  </div>
                </div>
              )}
              
              {profile?.website && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <a 
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 font-medium hover:text-purple-600 flex items-center gap-1"
                    >
                      {profile.website.replace(/^https?:\/\//, '')}
                      <Link className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
              
              {profile?.address && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-gray-900 font-medium">{profile.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleEdit}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Edit2 className="w-5 h-5" />
                Edit Company Profile
              </button>
              
              <button
                onClick={fetchProfile}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50"
              >
                <Eye className="w-5 h-5" />
                {loading ? "Refreshing..." : "Refresh Profile"}
              </button>
            </div>
          </div>

          {/* Social Media */}
          {profile?.socialMedia && Object.values(profile.socialMedia).some(val => val) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
              <div className="space-y-3">
                {SOCIAL_MEDIA_PLATFORMS.map(platform => {
                  const url = profile.socialMedia[platform.id];
                  if (!url) return null;
                  
                  const PlatformIcon = platform.icon;
                  return (
                    <a
                      key={platform.id}
                      href={url.startsWith('http') ? url : `https://${url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition"
                    >
                      <PlatformIcon className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700 font-medium">{platform.label}</span>
                      <Link className="w-4 h-4 ml-auto text-gray-400" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Company Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Details</h3>
            <div className="space-y-4">
              {profile?.industry && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Industry</span>
                  <span className="font-medium">{profile.industry}</span>
                </div>
              )}
              
              {profile?.companySize && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Company Size</span>
                  <span className="font-medium">{profile.companySize}</span>
                </div>
              )}
              
              {profile?.foundedYear && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Founded Year</span>
                  <span className="font-medium">{profile.foundedYear}</span>
                </div>
              )}
              
              {profile?.legalName && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Legal Name</span>
                  <span className="font-medium">{profile.legalName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Edit mode - Company Profile Form
  const renderEditMode = () => (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Edit Company Profile</h3>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Profile Completion</span>
            <span className="text-lg font-bold text-blue-600">{progress.overall}%</span>
          </div>
          <ProgressBar percentage={progress.overall} color="bg-blue-600" />
        </div>
      </div>

      {/* Form Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter company name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Industry *
                </label>
                <select
                  name="industry"
                  value={formData.industry || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Industry</option>
                  {INDUSTRY_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Company Size
                </label>
                <select
                  name="companySize"
                  value={formData.companySize || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Size</option>
                  {COMPANY_SIZES.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Founded Year
                </label>
                <input
                  type="number"
                  name="foundedYear"
                  value={formData.foundedYear || ""}
                  onChange={handleInputChange}
                  min="1800"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 1999"
                />
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">About Company</h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Company Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your company, what you do, and what makes you unique..."
                />
                <p className="text-sm text-gray-500">This will be displayed on your public profile</p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mission Statement
                </label>
                <textarea
                  name="mission"
                  value={formData.mission || ""}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What is your company's mission?"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Core Values
                </label>
                <textarea
                  name="values"
                  value={formData.values || ""}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="List your company's core values (comma separated)"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="contact@company.com"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://company.com"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123 Main St, City, Country"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Logo & Social */}
        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Company Logo</h4>
            
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                {logoPreview ? (
                  <div className="relative">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="w-48 h-48 rounded-xl object-cover border-4 border-gray-100"
                    />
                    <button
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
                    <Image className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-500">No logo uploaded</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer font-medium">
                  <Upload className="w-5 h-5" />
                  {logoPreview ? "Change Logo" : "Upload Logo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Recommended: 500×500px, Max 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h4>
            
            <div className="space-y-4">
              {SOCIAL_MEDIA_PLATFORMS.map(platform => {
                const PlatformIcon = platform.icon;
                return (
                  <div key={platform.id} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <PlatformIcon className="w-4 h-4" />
                      {platform.label}
                    </label>
                    <input
                      type="url"
                      value={formData.socialMedia?.[platform.id] || ""}
                      onChange={(e) => handleSocialChange(platform.id, e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={platform.placeholder}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Legal Name
                </label>
                <input
                  type="text"
                  name="legalName"
                  value={formData.legalName || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Full legal name of the company"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tax ID / Registration Number
                </label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional"
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Make profile public
                  </span>
                </label>
                <p className="text-sm text-gray-500">
                  When checked, your company profile will be visible to potential customers and partners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout id="CompanyProfile">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
            <p className="text-gray-600 mt-1">
              {isEditing 
                ? "Edit your company information and branding" 
                : "Manage and showcase your company information"}
            </p>
          </div>
          
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Edit2 className="w-5 h-5" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 rounded-lg border-l-4 flex items-start gap-3 bg-green-50 border-green-500 text-green-800">
            <CheckCircle className="mt-0.5" size={18} />
            <div className="flex-1 text-sm">{success}</div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg border-l-4 flex items-start gap-3 bg-red-50 border-red-500 text-red-800">
            <AlertCircle className="mt-0.5" size={18} />
            <div className="flex-1 text-sm">{error}</div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && !isEditing ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading company profile...</p>
        </div>
      ) : profile && !isEditing ? (
        renderViewMode()
      ) : (
        renderEditMode()
      )}
    </DashboardLayout>
  );
}

// You'll need to add these functions to your companyService.js:
/*
companyService.getCompanyProfile = async () => {
  return api.get('/company/profile');
}

companyService.updateCompanyProfile = async (formData) => {
  return api.put('/company/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
*/