import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  Upload, X, Save, LogOut, Search, Sun, Moon, Menu,
  User, Plus, Briefcase, Building, Settings, Bell,
  Bold, Italic, Underline, Strikethrough, Link as LinkIcon,
  ListOrdered, List, Eye, EyeOff, MapPin, Mail, Calendar, Image as ImageIcon,
  Facebook, Twitter, Instagram, Youtube, Linkedin, Trash2, Globe, ChevronDown
} from "lucide-react";
import { logout } from "../store/authSlice";
import authService from "../services/authService";
import companyService from "../services/companyService";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { profile: company } = useSelector((s) => s.company);
  const user = useSelector((s) => s.auth.user);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");

  // State for company info
  const [companyInfo, setCompanyInfo] = useState({
    name: company?.company_name || "",
    description: company?.description || "",
  });

  // State for images
  const [logo, setLogo] = useState({
    name: "Logo.png",
    size: "3.5 MB",
    url: "https://via.placeholder.com/100x100/3B82F6/FFFFFF?text=L"
  });

  const [banner, setBanner] = useState({
    name: "Banner.png",
    size: "4.3 MB",
    url: "https://via.placeholder.com/400x100/1E40AF/FFFFFF?text=Banner+Image"
  });

  // State for Founding Info
  const [foundingInfo, setFoundingInfo] = useState({
    organizationType: "",
    industryTypes: "",
    teamSize: "",
    yearOfEstablishment: "",
    companyWebsite: "",
    companyVision: "",
  });

  // State for Social Media Links
  const [socialLinks, setSocialLinks] = useState([
    { id: 1, platform: "Facebook", url: "" },
    { id: 2, platform: "Twitter", url: "" },
    { id: 3, platform: "Instagram", url: "" },
  ]);

  // State for Account Settings
  const [accountSettings, setAccountSettings] = useState({
    mapLocation: "",
    phoneCountryCode: "+880",
    phoneNumber: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [activeTab, setActiveTab] = useState("company-info");

  // Social media platforms
  const socialPlatforms = [
    { value: "Facebook", label: "Facebook", icon: Facebook },
    { value: "Twitter", label: "Twitter", icon: Twitter },
    { value: "Instagram", label: "Instagram", icon: Instagram },
    { value: "Youtube", label: "Youtube", icon: Youtube },
    { value: "LinkedIn", label: "LinkedIn", icon: Linkedin },
  ];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Mock image upload handlers
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        const res = await companyService.uploadLogo(file);
        setLogo({
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
          url: res.data.logo_url || URL.createObjectURL(file)
        });
        setSuccess("Logo uploaded successfully!");
      } catch (err) {
        setError("Failed to upload logo: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        const res = await companyService.uploadBanner(file);
        setBanner({
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
          url: res.data.banner_url || URL.createObjectURL(file)
        });
        setSuccess("Banner uploaded successfully!");
      } catch (err) {
        setError("Failed to upload banner: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
  };

  const handleRemoveBanner = () => {
    setBanner(null);
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Save based on active tab
      if (activeTab === "company-info") {
        await companyService.updateCompanyInfo(companyInfo.name, companyInfo.description);
        setSuccess("Company info updated successfully!");
      } else if (activeTab === "founding-info") {
        await companyService.updateFoundingInfo(foundingInfo);
        setSuccess("Founding info updated successfully!");
      } else if (activeTab === "social-media") {
        await companyService.updateSocialLinks(socialLinks);
        setSuccess("Social media links updated successfully!");
      } else if (activeTab === "account-setting") {
        // Update contact information
        await authService.updateProfile({
          mobile_no: accountSettings.phoneNumber,
          email: accountSettings.email,
        });
        setSuccess("Contact information updated successfully!");
      }
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to save changes: " + (err.response?.data?.message || err.message));
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (accountSettings.newPassword !== accountSettings.confirmPassword) {
        setError("New password and confirm password do not match!");
        return;
      }
      if (accountSettings.newPassword.length < 6) {
        setError("Password must be at least 6 characters long!");
        return;
      }

      setLoading(true);
      setError("");
      setSuccess("");

      await authService.changePassword(
        accountSettings.currentPassword,
        accountSettings.newPassword
      );

      setSuccess("Password changed successfully!");
      setAccountSettings({
        ...accountSettings,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to change password: " + (err.response?.data?.message || err.message));
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    dispatch(logout());
    navigate("/login");
  };

  // Load company profile on mount
  useEffect(() => {
    const loadCompanyProfile = async () => {
      try {
        setLoading(true);
        const profile = await companyService.getProfile();
        if (profile?.data) {
          const data = profile.data;
          setCompanyInfo({
            name: data.company_name || "",
            description: data.description || "",
          });
          setFoundingInfo({
            organizationType: data.organization_type || "",
            industryTypes: data.industry || "",
            teamSize: data.team_size || "",
            yearOfEstablishment: data.founded_date || "",
            companyWebsite: data.website || "",
            companyVision: data.description || "",
          });
          setSocialLinks(data.social_links || []);
          if (data.logo_url) {
            setLogo({
              name: "Logo",
              size: "uploaded",
              url: data.logo_url,
            });
          }
          if (data.banner_url) {
            setBanner({
              name: "Banner",
              size: "uploaded",
              url: data.banner_url,
            });
          }
        }
      } catch (err) {
        console.log("Company profile not found or not loaded");
      } finally {
        setLoading(false);
      }
    };

    loadCompanyProfile();
  }, []);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Social Media Handlers
  const handleAddSocialLink = () => {
    setSocialLinks([...socialLinks, { id: Date.now(), platform: "Facebook", url: "" }]);
  };

  const handleRemoveSocialLink = (id) => {
    setSocialLinks(socialLinks.filter(link => link.id !== id));
  };

  const handleSocialLinkChange = (id, field, value) => {
    setSocialLinks(socialLinks.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  // Password visibility toggle
  const togglePasswordVisibility = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  // Delete company handler
  const handleDeleteCompany = async () => {
    if (window.confirm("Are you sure you want to delete your company? This action cannot be undone.")) {
      try {
        setLoading(true);
        setError("");
        // Call backend to delete account - this typically requires password confirmation
        // For now, we'll implement a basic version
        const password = window.prompt("Please enter your password to confirm account deletion:");
        if (password) {
          await authService.deleteAccount(password);
          setSuccess("Account deleted successfully. Redirecting...");
          setTimeout(() => navigate("/login"), 2000);
        }
      } catch (err) {
        setError("Failed to delete account: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  // Tabs for settings
  const tabs = [
    { id: "company-info", label: "Company Info", icon: User },
    { id: "founding-info", label: "Founding Info", icon: Building },
    { id: "social-media", label: "Social Media Profile", icon: Globe },
    { id: "account-setting", label: "Account Setting", icon: Settings },
  ];

  // Sidebar menu items
  const sidebarItems = [
    { key: "dashboard", label: "Dashboard", icon: "📊", path: "/dashboard" },
    { key: "company", label: "Company Info", icon: "🏢", path: "/company-profile" },
    { key: "inquiries", label: "Inquiries", icon: "📧", path: "/inquiries" },
    { key: "analytics", label: "Analytics", icon: "📈", path: "/analytics" },
    { key: "settings", label: "Settings", icon: "⚙️", path: "/settings" },
  ];

  // User initials
  const userInitials =
    user?.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase() || 
    user?.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U";

  const companyName = company?.company_name || "Company Portal";
  const industry = company?.industry || "Not specified";

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      dark 
        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100" 
        : "bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 text-slate-900"
    }`}>
      <div className="flex h-screen overflow-hidden">
        
        {/* Sidebar */}
        <aside
          className={`flex-shrink-0 ${
            dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
          } border-r transition-all duration-300 overflow-y-auto ${
            sidebarOpen ? "w-64" : "w-20"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Logo */}
            <div className={`px-4 py-6 border-b ${dark ? "border-slate-700" : "border-gray-200"}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {userInitials[0]}
                </div>
                {sidebarOpen && (
                  <div>
                    <div className="font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {user?.full_name || user?.fullName || "User"}
                    </div>
                    <div className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
                      {industry}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1">
              {sidebarItems.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-3 py-3 rounded-lg transition transform hover:scale-105 ${
                      !sidebarOpen && "justify-center"
                    } ${
                      isActive
                        ? `${
                            dark
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                              : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                          }`
                        : `${
                            dark
                              ? "hover:bg-slate-700 text-slate-300"
                              : "hover:bg-blue-50 text-slate-700"
                          }`
                    }`
                  }
                  end={item.key === "dashboard"}
                >
                  <span className="text-lg">{item.icon}</span>
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </NavLink>
              ))}
            </nav>

            {/* Logout Button */}
            <div className={`p-4 border-t ${dark ? "border-slate-700" : "border-gray-200"}`}>
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-2 px-3 py-3 rounded-lg transition ${
                  !sidebarOpen && "justify-center"
                } hover:bg-red-50 dark:hover:bg-slate-700 text-red-600`}
              >
                <LogOut size={18} />
                {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto flex flex-col">
          
          {/* Header */}
          <header className={`${
            dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
          } border-b px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm`}>
            <div className="flex items-center gap-4 flex-1">
              <button
                className={`p-2 rounded-lg transition hover:scale-110 cursor-pointer ${
                  dark ? "hover:bg-slate-700" : "hover:bg-gray-100"
                }`}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu size={20} />
              </button>

              <div className={`relative hidden sm:block flex-1 max-w-xs`}>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className={`pl-10 pr-4 py-2 rounded-lg border transition ${
                    dark
                      ? "bg-slate-700 border-slate-600 focus:border-blue-500"
                      : "bg-gray-50 border-gray-200 focus:border-blue-500"
                  } focus:ring-2 focus:ring-blue-500/20 w-full`}
                />
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <button className={`p-2 rounded-lg transition hover:scale-110 relative ${
                dark ? "hover:bg-slate-700" : "hover:bg-gray-100"
              }`}>
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              <button
                className={`p-2 rounded-lg transition hover:scale-110 ${
                  dark ? "hover:bg-slate-700" : "hover:bg-gray-100"
                }`}
                onClick={() => setDark(!dark)}
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <div className={`flex items-center gap-2 sm:gap-3 px-3 py-2 rounded-full ${
                dark
                  ? "bg-gradient-to-r from-slate-700 to-slate-600"
                  : "bg-gradient-to-r from-blue-50 to-indigo-50"
              }`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-400 flex items-center justify-center text-white font-semibold text-sm">
                  {userInitials}
                </div>
                <div className="hidden md:block text-sm">
                  <div className="font-medium">{user?.full_name || user?.fullName || "User"}</div>
                  <div className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full">
              <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${
                dark ? "text-slate-100" : "text-slate-900"
              }`}>Settings</h2>

              {/* Success/Error Notifications */}
              {success && (
                <div className={`mb-6 p-4 rounded-lg border-l-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                  dark
                    ? "bg-green-900/20 border-green-700 text-green-300"
                    : "bg-green-50 border-green-500 text-green-800"
                }`}>
                  <div className="text-xl">✓</div>
                  <div className="flex-1">{success}</div>
                  <button
                    onClick={() => setSuccess("")}
                    className="p-1 hover:bg-green-200/20 rounded-lg transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {error && (
                <div className={`mb-6 p-4 rounded-lg border-l-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                  dark
                    ? "bg-red-900/20 border-red-700 text-red-300"
                    : "bg-red-50 border-red-500 text-red-800"
                }`}>
                  <div className="text-xl">✕</div>
                  <div className="flex-1">{error}</div>
                  <button
                    onClick={() => setError("")}
                    className="p-1 hover:bg-red-200/20 rounded-lg transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {loading && (
                <div className={`mb-6 p-4 rounded-lg border-l-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                  dark
                    ? "bg-blue-900/20 border-blue-700 text-blue-300"
                    : "bg-blue-50 border-blue-500 text-blue-800"
                }`}>
                  <div className="inline-block animate-spin">
                    <div className="w-5 h-5 border-2 rounded-full border-current border-t-transparent"></div>
                  </div>
                  <div className="flex-1">Saving changes...</div>
                </div>
              )}

              {/* Tab Navigation */}
            <div className={`flex items-center gap-4 md:gap-8 mb-8 border-b ${
              dark ? "border-slate-700" : "border-gray-200"
            } overflow-x-auto`}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-1 pb-4 cursor-pointer transition-colors whitespace-nowrap ${
                      isActive
                        ? `text-blue-600 border-b-2 border-blue-600 font-semibold ${
                            dark ? "dark:text-blue-400 dark:border-blue-400" : ""
                          }`
                        : `${
                            dark
                              ? "text-slate-400 hover:text-slate-300"
                              : "text-gray-600 hover:text-gray-900"
                          } font-medium`
                    }`}
                  >
                    <Icon size={18} className={isActive ? (dark ? "text-blue-400" : "text-blue-600") : (dark ? "text-slate-400" : "text-gray-500")} />
                    <span className="text-sm md:text-base">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {/* Company Info Tab */}
              {activeTab === "company-info" && (
                <>
                  {/* Logo & Banner Image Section */}
                  <div className={`rounded-lg border mb-4 p-4 md:p-6 ${
                    dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
                  }`}>
                    <h3 className={`text-lg font-semibold mb-6 ${
                      dark ? "text-slate-100" : "text-gray-900"
                    }`}>Logo & Banner Image</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Logo Upload */}
                      <div>
                        <label className={`block text-sm font-medium mb-3 ${
                          dark ? "text-slate-300" : "text-gray-700"
                        }`}>
                          Upload Logo
                        </label>
                        {logo ? (
                          <div className={`border rounded-lg p-4 ${
                            dark ? "border-slate-600 bg-slate-700" : "border-gray-200 bg-white"
                          }`}>
                            <div className={`w-full aspect-square rounded-lg mb-3 flex items-center justify-center overflow-hidden ${
                              dark ? "bg-slate-600" : "bg-gray-50"
                            }`}>
                              <img 
                                src={logo.url} 
                                alt="Logo" 
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={`text-sm ${
                                dark ? "text-slate-400" : "text-gray-600"
                              }`}>{logo.size}</span>
                              <div className="flex gap-4">
                                <button
                                  onClick={handleRemoveLogo}
                                  className="text-blue-600 text-sm font-medium hover:text-blue-700"
                                >
                                  Remove
                                </button>
                                <button
                                  onClick={() => document.getElementById('logo-upload').click()}
                                  className="text-blue-600 text-sm font-medium hover:text-blue-700"
                                >
                                  Replace
                                </button>
                              </div>
                            </div>
                            <input
                              type="file"
                              id="logo-upload"
                              className="hidden"
                              accept="image/*"
                              onChange={handleLogoUpload}
                            />
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 font-medium">Click to upload logo</p>
                          </div>
                        )}
                      </div>

                      {/* Banner Upload */}
                      <div>
                        <label className={`block text-sm font-medium mb-3 ${
                          dark ? "text-slate-300" : "text-gray-700"
                        }`}>
                          Banner Image
                        </label>
                        {banner ? (
                          <div className={`border rounded-lg p-4 ${
                            dark ? "border-slate-600 bg-slate-700" : "border-gray-200 bg-white"
                          }`}>
                            <div className={`w-full aspect-[16/6] rounded-lg mb-3 flex items-center justify-center overflow-hidden ${
                              dark ? "bg-slate-600" : "bg-gray-50"
                            }`}>
                              <img 
                                src={banner.url} 
                                alt="Banner" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={`text-sm ${
                                dark ? "text-slate-400" : "text-gray-600"
                              }`}>{banner.size}</span>
                              <div className="flex gap-4">
                                <button
                                  onClick={handleRemoveBanner}
                                  className="text-blue-600 text-sm font-medium hover:text-blue-700"
                                >
                                  Remove
                                </button>
                                <button
                                  onClick={() => document.getElementById('banner-upload').click()}
                                  className="text-blue-600 text-sm font-medium hover:text-blue-700"
                                >
                                  Replace
                                </button>
                              </div>
                            </div>
                            <input
                              type="file"
                              id="banner-upload"
                              className="hidden"
                              accept="image/*"
                              onChange={handleBannerUpload}
                            />
                          </div>
                        ) : (
                          <div className={`border-2 border-dashed rounded-lg p-8 text-center ${
                            dark ? "border-slate-600" : "border-gray-300"
                          }`}>
                            <Upload className={`w-8 h-8 mx-auto mb-2 ${
                              dark ? "text-slate-400" : "text-gray-400"
                            }`} />
                            <p className={`text-sm font-medium ${
                              dark ? "text-slate-400" : "text-gray-600"
                            }`}>Click to upload banner</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Company Information Form */}
                  <div className={`rounded-lg border mb-4 p-4 md:p-6 ${
                    dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
                  }`}>
                    <div className="mb-6">
                      <label className={`block text-sm font-medium mb-2 ${
                        dark ? "text-slate-300" : "text-gray-700"
                      }`}>
                        Company name
                      </label>
                      <input
                        type="text"
                        value={companyInfo.name}
                        onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                        className={`w-full px-4 py-2.5 border rounded-lg outline-none ${
                          dark
                            ? "bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            : "border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                        placeholder="Enter your company name"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        dark ? "text-slate-300" : "text-gray-700"
                      }`}>
                        About us
                      </label>
                      
                      {/* Rich Text Editor Toolbar */}
                      <div className={`flex items-center gap-2 mb-2 p-2 rounded-t-lg overflow-x-auto ${
                        dark
                          ? "bg-slate-700 border border-slate-600"
                          : "bg-gray-50 border border-gray-200"
                      }`}>
                        <button className={`p-1.5 rounded transition-colors ${
                          dark ? "hover:bg-slate-600 text-slate-300" : "hover:bg-gray-200 text-gray-600"
                        }`} title="Bold">
                          <Bold size={16} />
                        </button>
                        <button className={`p-1.5 rounded transition-colors ${
                          dark ? "hover:bg-slate-600 text-slate-300" : "hover:bg-gray-200 text-gray-600"
                        }`} title="Italic">
                          <Italic size={16} />
                        </button>
                        <button className={`p-1.5 rounded transition-colors ${
                          dark ? "hover:bg-slate-600 text-slate-300" : "hover:bg-gray-200 text-gray-600"
                        }`} title="Underline">
                          <Underline size={16} />
                        </button>
                        <button className={`p-1.5 rounded transition-colors ${
                          dark ? "hover:bg-slate-600 text-slate-300" : "hover:bg-gray-200 text-gray-600"
                        }`} title="Strikethrough">
                          <Strikethrough size={16} />
                        </button>
                        <div className={`w-px h-6 mx-1 ${dark ? "bg-slate-600" : "bg-gray-300"}`}></div>
                        <button className={`p-1.5 rounded transition-colors ${
                          dark ? "hover:bg-slate-600 text-slate-300" : "hover:bg-gray-200 text-gray-600"
                        }`} title="Link">
                          <LinkIcon size={16} />
                        </button>
                        <div className={`w-px h-6 mx-1 ${dark ? "bg-slate-600" : "bg-gray-300"}`}></div>
                        <button className={`p-1.5 rounded transition-colors ${
                          dark ? "hover:bg-slate-600 text-slate-300" : "hover:bg-gray-200 text-gray-600"
                        }`} title="Numbered List">
                          <ListOrdered size={16} />
                        </button>
                        <button className={`p-1.5 rounded transition-colors ${
                          dark ? "hover:bg-slate-600 text-slate-300" : "hover:bg-gray-200 text-gray-600"
                        }`} title="Bulleted List">
                          <List size={16} />
                        </button>
                      </div>
                      
                      <textarea
                        value={companyInfo.description}
                        onChange={(e) => setCompanyInfo({...companyInfo, description: e.target.value})}
                        rows="6"
                        className={`w-full px-4 py-3 border rounded-b-lg rounded-t-none outline-none resize-none ${
                          dark
                            ? "bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            : "border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                        placeholder="Write down about your company here. Let the candidate know who we are..."
                      />
                    </div>
                  </div>

                  {/* Save Change Button */}
                  <div className="flex justify-start">
                    <button
                      onClick={handleSaveChanges}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm cursor-pointer"
                    >
                      Save Change
                    </button>
                  </div>
                </>
              )}

              {/* Founding Info Tab */}
              {activeTab === "founding-info" && (
                <>
                  <div className={`rounded-lg border mb-4 p-4 md:p-6 ${
                    dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
                  }`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          dark ? "text-slate-300" : "text-gray-700"
                        }`}>
                          Organization Type
                        </label>
                        <div className="relative">
                          <select
                            value={foundingInfo.organizationType}
                            onChange={(e) => setFoundingInfo({...foundingInfo, organizationType: e.target.value})}
                            className={`w-full px-4 py-2.5 border rounded-lg outline-none appearance-none ${
                              dark
                                ? "bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                : "border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                          >
                            <option value="">Select...</option>
                            <option value="private">Private</option>
                            <option value="public">Public</option>
                            <option value="nonprofit">Non-profit</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          dark ? "text-slate-300" : "text-gray-700"
                        }`}>
                          Industry Types
                        </label>
                        <div className="relative">
                          <select
                            value={foundingInfo.industryTypes}
                            onChange={(e) => setFoundingInfo({...foundingInfo, industryTypes: e.target.value})}
                            className={`w-full px-4 py-2.5 border rounded-lg outline-none appearance-none ${
                              dark
                                ? "bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                : "border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                          >
                            <option value="">Select...</option>
                            <option value="tech">Technology</option>
                            <option value="finance">Finance</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="education">Education</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          dark ? "text-slate-300" : "text-gray-700"
                        }`}>
                          Team Size
                        </label>
                        <div className="relative">
                          <select
                            value={foundingInfo.teamSize}
                            onChange={(e) => setFoundingInfo({...foundingInfo, teamSize: e.target.value})}
                            className={`w-full px-4 py-2.5 border rounded-lg outline-none appearance-none ${
                              dark
                                ? "bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                : "border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                          >
                            <option value="">Select...</option>
                            <option value="1-10">1-10</option>
                            <option value="11-50">11-50</option>
                            <option value="51-200">51-200</option>
                            <option value="201-500">201-500</option>
                            <option value="500+">500+</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          dark ? "text-slate-300" : "text-gray-700"
                        }`}>
                          Year of Establishment
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={foundingInfo.yearOfEstablishment}
                            onChange={(e) => setFoundingInfo({...foundingInfo, yearOfEstablishment: e.target.value})}
                            className={`w-full px-4 py-2.5 pr-10 border rounded-lg  outline-none ${
                              dark
                                ? "bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                : "border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                            placeholder="dd/mm/yyyy"
                          />
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          dark ? "text-slate-300" : "text-gray-700"
                        }`}>
                          Company Website
                        </label>
                        <div className="relative">
                          <LinkIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                            dark ? "text-slate-400" : "text-gray-400"
                          }`} size={20} />
                          <input
                            type="text"
                            value={foundingInfo.companyWebsite}
                            onChange={(e) => setFoundingInfo({...foundingInfo, companyWebsite: e.target.value})}
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none ${
                              dark
                                ? "bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                : "border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                            placeholder="Website url..."
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        dark ? "text-slate-300" : "text-gray-700"
                      }`}>
                        Company Vision
                      </label>
                      
                      {/* Rich Text Editor Toolbar */}
                      <div className={`flex items-center gap-2 mb-2 p-2 rounded-t-lg overflow-x-auto ${
                        dark
                          ? "bg-slate-700 border border-slate-600"
                          : "bg-gray-50 border border-gray-200"
                      }`}>
                        <button className={`p-1.5 rounded transition-colors ${
                          dark ? "hover:bg-slate-600 text-slate-300" : "hover:bg-gray-200 text-gray-600"
                        }`} title="Bold">
                          <Bold size={16} />
                        </button>
                        <button className={`p-1.5 rounded transition-colors ${
                          dark ? "hover:bg-slate-600 text-slate-300" : "hover:bg-gray-200 text-gray-600"
                        }`} title="Italic">
                          <Italic size={16} />
                        </button>
                        <button className={`p-1.5 rounded transition-colors ${
                          dark ? "hover:bg-slate-600 text-slate-300" : "hover:bg-gray-200 text-gray-600"
                        }`} title="Underline">
                          <Underline size={16} />
                        </button>
                        <button className={`p-1.5 rounded transition-colors ${
                          dark ? "hover:bg-slate-600 text-slate-300" : "hover:bg-gray-200 text-gray-600"
                        }`} title="Strikethrough">
                          <Strikethrough size={16} />
                        </button>
                        <div className={`w-px h-6 mx-1 ${dark ? "bg-slate-600" : "bg-gray-300"}`}></div>
                        <button className={`p-1.5 rounded transition-colors ${
                          dark ? "hover:bg-slate-600 text-slate-300" : "hover:bg-gray-200 text-gray-600"
                        }`} title="Link">
                          <LinkIcon size={16} />
                        </button>
                        <button className={`p-1.5 rounded transition-colors ${
                          dark ? "hover:bg-slate-600 text-slate-300" : "hover:bg-gray-200 text-gray-600"
                        }`} title="Image">
                          <ImageIcon size={16} />
                        </button>
                        <div className={`w-px h-6 mx-1 ${dark ? "bg-slate-600" : "bg-gray-300"}`}></div>
                        <button className={`p-1.5 rounded transition-colors ${
                          dark ? "hover:bg-slate-600 text-slate-300" : "hover:bg-gray-200 text-gray-600"
                        }`} title="Bulleted List">
                          <List size={16} />
                        </button>
                        <button className={`p-1.5 rounded transition-colors ${
                          dark ? "hover:bg-slate-600 text-slate-300" : "hover:bg-gray-200 text-gray-600"
                        }`} title="Numbered List">
                          <ListOrdered size={16} />
                        </button>
                      </div>
                      
                      <textarea
                        value={foundingInfo.companyVision}
                        onChange={(e) => setFoundingInfo({...foundingInfo, companyVision: e.target.value})}
                        rows="6"
                        className={`w-full px-4 py-3 border rounded-b-lg rounded-t-none outline-none resize-none ${
                          dark
                            ? "bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            : "border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                        placeholder="Tell us what Vision of your company..."
                      />
                    </div>
                  </div>

                  {/* Save Changes Button */}
                  <div className="flex justify-start ">
                    <button
                      onClick={handleSaveChanges}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </>
              )}

              {/* Social Media Profile Tab */}
              {activeTab === "social-media" && (
                <>
                  <div className={`rounded-lg border mb-4 p-4 md:p-6 ${
                    dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
                  }`}>
                    <div className="space-y-4">
                      {socialLinks.map((link, index) => {
                        const platformData = socialPlatforms.find(p => p.value === link.platform);
                        const PlatformIcon = platformData?.icon || Globe;
                        
                        return (
                          <div key={link.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                            <div className="flex-1 w-full sm:w-auto">
                              <label className={`block text-sm font-medium mb-2 ${
                                dark ? "text-slate-300" : "text-gray-700"
                              }`}>
                                Social Link {index + 1}
                              </label>
                              <div className={`flex gap-0 rounded-lg overflow-hidden border ${
                                dark ? "border-slate-600" : "border-gray-300"
                              }`}>
                                <div className="relative flex-shrink-0">
                                  <select
                                    value={link.platform}
                                    onChange={(e) => handleSocialLinkChange(link.id, 'platform', e.target.value)}
                                    className={`appearance-none px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                      dark
                                        ? "bg-slate-700 border-r border-slate-600 text-slate-100"
                                        : "bg-white border-r border-gray-300 text-gray-900"
                                    }`}
                                  >
                                    {socialPlatforms.map(platform => (
                                      <option key={platform.value} value={platform.value}>
                                        {platform.label}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                                <input
                                  type="text"
                                  value={link.url}
                                  onChange={(e) => handleSocialLinkChange(link.id, 'url', e.target.value)}
                                  className={`flex-1 px-4 py-2.5 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    dark
                                      ? "bg-slate-700 text-slate-100"
                                      : "bg-white text-gray-900"
                                  }`}
                                  placeholder="Profile link/url..."
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveSocialLink(link.id)}
                              className={`mt-6 sm:mt-8 w-10 h-10 flex items-center justify-center border rounded-full transition-colors ${
                                dark
                                  ? "border-slate-600 hover:bg-slate-700 text-slate-400"
                                  : "border-gray-300 hover:bg-gray-50 text-gray-600"
                              }`}
                            >
                              <X size={18} />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={handleAddSocialLink}
                      className={`mt-6 w-full sm:w-auto px-6 py-3 border rounded-lg transition-colors flex items-center justify-center gap-2 font-medium ${
                        dark
                          ? "border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-300"
                          : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <Plus size={20} />
                      Add New Social Link
                    </button>
                  </div>

                  {/* Save Changes Button */}
                  <div className="flex justify-start">
                    <button
                      onClick={handleSaveChanges}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </>
              )}

              {/* Account Setting Tab */}
              {activeTab === "account-setting" && (
                <>
                  {/* Contact Information Section */}
                  <div className={`rounded-lg border mb-4 p-4 md:p-6 mb-6 ${
                    dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
                  }`}>
                    <h3 className={`text-lg font-semibold mb-6 ${
                      dark ? "text-slate-100" : "text-gray-900"
                    }`}>Contact Information</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          dark ? "text-slate-300" : "text-gray-700"
                        }`}>
                          Map Location
                        </label>
                        <div className="relative">
                          <MapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                            dark ? "text-slate-400" : "text-gray-400"
                          }`} size={20} />
                          <input
                            type="text"
                            value={accountSettings.mapLocation}
                            onChange={(e) => setAccountSettings({...accountSettings, mapLocation: e.target.value})}
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none ${
                              dark
                                ? "bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                : "border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                            placeholder="Enter map location"
                          />
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          dark ? "text-slate-300" : "text-gray-700"
                        }`}>
                          Phone
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-shrink-0 w-32">
                            <select
                              value={accountSettings.phoneCountryCode}
                              onChange={(e) => setAccountSettings({...accountSettings, phoneCountryCode: e.target.value})}
                              className={`w-full px-4 py-2.5 pr-8 border rounded-lg outline-none appearance-none ${
                                dark
                                  ? "bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  : "border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              }`}
                            >
                              <option value="+880">🇧🇩 +880</option>
                              <option value="+1">🇺🇸 +1</option>
                              <option value="+44">🇬🇧 +44</option>
                              <option value="+91">🇮🇳 +91</option>
                            </select>
                            <ChevronDown className={`absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none ${
                              dark ? "text-slate-400" : "text-gray-400"
                            }`} size={16} />
                          </div>
                          <input
                            type="tel"
                            value={accountSettings.phoneNumber}
                            onChange={(e) => setAccountSettings({...accountSettings, phoneNumber: e.target.value})}
                            className={`flex-1 px-4 py-2.5 border rounded-lg outline-none ${
                              dark
                                ? "bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                : "border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                            placeholder="Phone number.."
                          />
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          dark ? "text-slate-300" : "text-gray-700"
                        }`}>
                          Email
                        </label>
                        <div className="relative">
                          <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                            dark ? "text-slate-400" : "text-gray-400"
                          }`} size={20} />
                          <input
                            type="email"
                            value={accountSettings.email}
                            onChange={(e) => setAccountSettings({...accountSettings, email: e.target.value})}
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none ${
                              dark
                                ? "bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                : "border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                            placeholder="Email address"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={handleSaveChanges}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>

                  {/* Change Password Section */}
                  <div className={`rounded-lg border p-4 md:p-6 mb-6 ${
                    dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
                  }`}>
                    <h3 className={`text-lg font-semibold mb-6 ${
                      dark ? "text-slate-100" : "text-gray-900"
                    }`}>Change Password</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          dark ? "text-slate-300" : "text-gray-700"
                        }`}>
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            value={accountSettings.currentPassword}
                            onChange={(e) => setAccountSettings({...accountSettings, currentPassword: e.target.value})}
                            className={`w-full px-4 py-2.5 pr-10 border rounded-lg outline-none ${
                              dark
                                ? "bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                : "border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                            placeholder="Password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                              dark ? "text-slate-400 hover:text-slate-300" : "text-gray-400 hover:text-gray-600"
                            }`}
                          >
                            {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          dark ? "text-slate-300" : "text-gray-700"
                        }`}>
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            value={accountSettings.newPassword}
                            onChange={(e) => setAccountSettings({...accountSettings, newPassword: e.target.value})}
                            className={`w-full px-4 py-2.5 pr-10 border rounded-lg outline-none ${
                              dark
                                ? "bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                : "border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                            placeholder="Password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                              dark ? "text-slate-400 hover:text-slate-300" : "text-gray-400 hover:text-gray-600"
                            }`}
                          >
                            {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          dark ? "text-slate-300" : "text-gray-700"
                        }`}>
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            value={accountSettings.confirmPassword}
                            onChange={(e) => setAccountSettings({...accountSettings, confirmPassword: e.target.value})}
                            className={`w-full px-4 py-2.5 pr-10 border rounded-lg outline-none ${
                              dark
                                ? "bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                : "border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                            placeholder="Password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                              dark ? "text-slate-400 hover:text-slate-300" : "text-gray-400 hover:text-gray-600"
                            }`}
                          >
                            {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={handleSaveChanges}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>

                  {/* Delete Your Company Section */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Your Company</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      If you delete your Jobpilot account, you will no longer be able to get information about the matched jobs, following employers, and job alert, shortlisted jobs and more. You will be abandoned from all the services of Jobpilot.com.
                    </p>
                    <button
                      onClick={handleDeleteCompany}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm flex items-center gap-2"
                    >
                      <Trash2 size={18} />
                      Close Account
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          </div>

        </main>

      </div>
    </div>
  );
}
