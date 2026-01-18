import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate,NavLink, useLocation } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
  Area,
} from "recharts";
import { Bell, Search, Sun, Moon, Menu, LogOut, Edit2, AlertCircle, Award } from "lucide-react";
import { fetchCompanyProfile } from "../store/slices/companySlice";
import { logout } from "../store/authSlice";
import authService from "../services/authService";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);


  const location = useLocation();

  
  // Redux selectors
  const user = useSelector((s) => s.auth.user);
  const { profile: company, loading: companyLoading, error: companyError } = useSelector((s) => s.company);

  // Metrics data
  const getMetrics = () => [
    { 
      id: 1, 
      label: "Profile Completion", 
      value: company ? "100%" : "0%", 
      delta: company ? "+100%" : "Complete your profile",
      icon: company ? "✅" : "⏳"
    },
    { 
      id: 2, 
      label: "Company Views", 
      value: company ? "2.4k" : "—", 
      delta: company ? "+12%" : "No data yet",
      icon: "👀"
    },
    { 
      id: 3, 
      label: "Inquiries Received", 
      value: company ? "48" : "0", 
      delta: company ? "+3%" : "Awaiting inquiries",
      icon: "📧"
    },
    { 
      id: 4, 
      label: "Response Rate", 
      value: company ? "95%" : "—", 
      delta: company ? "⬆️ Excellent" : "Not available",
      icon: "📊"
    },
  ];

  // Chart data
  const chartData = [
    { month: "Jan", views: 400, inquiries: 24 },
    { month: "Feb", views: 500, inquiries: 32 },
    { month: "Mar", views: 450, inquiries: 28 },
    { month: "Apr", views: 650, inquiries: 45 },
    { month: "May", views: 720, inquiries: 52 },
    { month: "Jun", views: 890, inquiries: 68 },
  ];

  const pieData = company
    ? [
        { name: "Complete", value: 85 },
        { name: "Incomplete", value: 15 },
      ]
    : [{ name: "Incomplete", value: 100 }];

  const COLORS = ["#10B981", "#EF4444", "#6366F1"];

  // Activities
  const activities = [
    { id: 1, avatar: "AB", text: "Updated company profile", time: "1 hour ago", type: "success" },
    { id: 2, avatar: "SY", text: "New inquiry from John Ltd", time: "3 hours ago", type: "info" },
    { id: 3, avatar: "MK", text: "Viewed company details", time: "5 hours ago", type: "neutral" },
  ];

  // Mock inquiries data
  const inquiries = [
    { id: 1, name: "ABC Corp", email: "contact@abccorp.com", status: "Pending", date: "2025-12-08" },
    { id: 2, name: "XYZ Industries", email: "info@xyzind.com", status: "Responded", date: "2025-12-07" },
    { id: 3, name: "Tech Startup", email: "hey@techstartup.io", status: "Active", date: "2025-12-06" },
    { id: 4, name: "Global Solutions", email: "info@globalsol.com", status: "Pending", date: "2025-12-05" },
    { id: 5, name: "Innovate Inc", email: "contact@innovate.io", status: "Responded", date: "2025-12-04" },
  ];

  // Fetch profile on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");
    
    if (!user && !token) {
      navigate("/login");
      return;
    }
    
    // Fetch company profile
    if (token) {
      dispatch(fetchCompanyProfile()).finally(() => setLoading(false));
    }
  }, [dispatch, user, navigate]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleLogout = () => {
    authService.logout();
    dispatch(logout());
    navigate("/login");
  };

  const handleEditProfile = () => navigate("/company-registration");

  // Pagination
  const pageSize = 3;
  const pages = Math.ceil(inquiries.length / pageSize);
  const paginatedInquiries = inquiries.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // User initials
  const userInitials =
    user?.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase() || 
    user?.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U";

  const companyName = company?.company_name || "Company Portal";
  const industry = company?.industry || "Not specified";

  const metrics = getMetrics();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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


            {/* // Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1">
              {[
                { key: "dashboard", label: "Dashboard", icon: "📊", path: "/dashboard" },
                { key: "company", label: "Company Info", icon: "🏢", path: "/company-profile" },
                { key: "inquiries", label: "Inquiries", icon: "📧", path: "/inquiries" },
                { key: "analytics", label: "Analytics", icon: "📈", path: "/analytics" },
                { key: "settings", label: "Settings", icon: "⚙️", path: "/settings" },
              ].map((item) => (
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
                  end={item.key === "dashboard"} // Use exact match for dashboard
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
            <div className="flex items-center gap-4 flex-1 ">
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
            
            {/* Status Card */}
            {companyError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-300">Error Loading Profile</h3>
                  <p className="text-red-700 dark:text-red-400 text-sm">{companyError}</p>
                </div>
              </div>
            )}

            {/* Welcome Card */}
            <div className={`rounded-2xl p-2 sm:p-3 mb-2 text-white shadow-xl transition transform hover:shadow-2xl ${
              dark
                ? "bg-gradient-to-r from-blue-700 to-indigo-700"
                : "bg-gradient-to-r from-blue-600 to-indigo-600"
              }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-4xl font-bold mb-2">
                    Welcome, {user?.full_name?.split(" ")[0] || user?.fullName?.split(" ")[0]}! 👋
                  </h1>
                  <p className="text-blue-100 text-sm sm:text-base">
                    {company
                      ? `Manage "${companyName}" and grow your business`
                      : "Complete your company profile to get started"}
                  </p>
                </div>

                {!company && (
                  <button
                    onClick={handleEditProfile}
                    className="px-6 py-3 rounded-lg bg-white text-blue-600 font-semibold hover:bg-blue-50 transition transform hover:scale-105 shadow-lg whitespace-nowrap"
                  >
                    Complete Profile
                  </button>
                )}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
              {metrics.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl p-5 border shadow-sm transition transform hover:shadow-lg hover:-translate-y-1 ${
                    dark
                      ? "bg-slate-800 border-slate-700 hover:bg-slate-700"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className={`text-xs sm:text-sm font-medium ${dark ? "text-slate-400" : "text-slate-500"}`}>
                        {m.label}
                      </div>
                      <div className="flex items-baseline gap-2 mt-3">
                        <div className="text-2xl sm:text-3xl font-bold">{m.value}</div>
                      </div>
                      <div className={`text-xs mt-2 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                        {m.delta}
                      </div>
                    </div>
                    <span className="text-2xl">{m.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-2">
              
              {/* Line Chart */}
              <div className={`lg:col-span-2 rounded-xl p-6 border shadow-sm ${
                dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
              }`}>
                <h3 className="text-lg font-bold mb-4">Engagement Trend</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData}>
                    
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={dark ? "rgba(148,163,184,0.1)" : "#e5e7eb"}
                    />
                    <XAxis dataKey="month" stroke={dark ? "#94a3b8" : "#475569"} />
                    <YAxis stroke={dark ? "#94a3b8" : "#475569"} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: dark ? "#1e293b" : "#fff",
                        border: `1px solid ${dark ? "#475569" : "#e5e7eb"}`,
                        borderRadius: "0.5rem",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      }}
                    />
                     <Area type="monotone" dataKey="views" stroke="#3b82f6" fill="url(#colorViews)" strokeWidth={2} />
                    <Area type="monotone" dataKey="inquiries" stroke="#8b5cf6" fill="url(#colorInquiries)" strokeWidth={2} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={false}
                      name="Views"
                    />
                    <Line
                      type="monotone"
                      dataKey="inquiries"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      dot={false}
                      name="Inquiries"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div className={`rounded-xl p-6 border shadow-sm ${
                dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
              }`}>
                <h3 className="text-lg font-bold mb-4">Profile Status</h3>
                <div className="flex items-center justify-center h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={pieData} 
                        dataKey="value" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={80}
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                      >
                        {pieData.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Activity + Inquiries */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recent Activity */}
              <div className={`rounded-xl p-6 border shadow-sm ${
                dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
              }`}>
                <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                <ul className="space-y-3">
                  {activities.map((a) => (
                    <li key={a.id} className={`flex items-start gap-3 pb-3 border-b last:border-0 ${
                      dark ? "border-slate-700" : "border-gray-200"
                    }`}>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                          a.type === "success"
                            ? "bg-green-500"
                            : a.type === "info"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        }`}
                      >
                        {a.avatar[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{a.text}</div>
                        <div className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
                          {a.time}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Inquiries Table */}
              <div className={`lg:col-span-2 rounded-xl p-6 border shadow-sm ${
                dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
              }`}>

                <div className="flex items-center justify-between mb-4 gap-2">
                  <h3 className="text-lg font-bold">Recent Inquiries</h3>
                  {company && (
                    <button
                      onClick={handleEditProfile}
                      className="flex items-center cursor-pointer gap-2 px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition transform hover:scale-105"
                    >
                      <Edit2 size={16} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`text-left text-xs font-semibold uppercase border-b ${
                        dark ? "border-slate-700 text-slate-400" : "border-gray-200 text-slate-500"
                      }`}>
                        <th className="py-3 px-2">Company</th>
                        <th className="py-3 px-2 hidden sm:table-cell">Email</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2 hidden md:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedInquiries.map((inq) => (
                        <tr
                          key={inq.id}
                          className={`border-b transition hover:${dark ? "bg-slate-700/50" : "bg-gray-50"} ${
                            dark ? "border-slate-700" : "border-gray-200"
                          }`}
                        >
                          <td className="py-3 px-2 font-medium">{inq.name}</td>
                          <td className="py-3 px-2 hidden sm:table-cell text-slate-500">{inq.email}</td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                inq.status === "Active"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                  : inq.status === "Responded"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                              }`}
                            >
                              {inq.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 hidden md:table-cell text-slate-500">{inq.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 gap-2">
                  <span className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
                    Page {currentPage} of {pages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1.5 rounded-lg border transition disabled:opacity-50 ${
                        dark
                          ? "border-slate-600 hover:bg-slate-700"
                          : "border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(pages, p + 1))}
                      disabled={currentPage === pages}
                      className={`px-3 py-1.5 rounded-lg border transition disabled:opacity-50 ${
                        dark
                          ? "border-slate-600 hover:bg-slate-700"
                          : "border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      Next →
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </main>

      </div>
    </div>
  );
}