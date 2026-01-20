import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bell, LogOut, Menu, Moon, Search, Sun } from "lucide-react";
import { logout } from "../../store/authSlice";
import authService from "../../services/authService";
import { fetchCompanyProfile } from "../../store/slices/companySlice";

export default function DashboardLayout({ title, children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((s) => s.auth.user);
  const accessToken = useSelector((s) => s.auth.accessToken);
  const company = useSelector((s) => s.company.profile);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const token = accessToken || localStorage.getItem("access_token");
    if (!user && !token) {
      navigate("/login");
      return;
    }
    if (token) {
      dispatch(fetchCompanyProfile());
    }
  }, [dispatch, user, accessToken, navigate]);

  const userInitials = useMemo(() => {
    const name = user?.full_name || user?.fullName || "User";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }, [user]);

  const industry = company?.industry || "Not specified";

  const sidebarItems = [
    { key: "dashboard", label: "Dashboard", icon: "📊", path: "/dashboard" },
    { key: "company", label: "Company Info", icon: "🏢", path: "/company-profile" },
    { key: "inquiries", label: "Inquiries", icon: "📧", path: "/inquiries" },
    { key: "analytics", label: "Analytics", icon: "📈", path: "/analytics" },
    { key: "settings", label: "Settings", icon: "⚙️", path: "/settings" },
  ];

  const handleLogout = () => {
    authService.logout();
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        dark
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100"
          : "bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 text-slate-900"
      }`}
    >
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
                  {userInitials?.[0] || "U"}
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
                            dark ? "hover:bg-slate-700 text-slate-300" : "hover:bg-blue-50 text-slate-700"
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
          <header
            className={`${
              dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
            } border-b px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm`}
          >
            <div className="flex items-center gap-4 flex-1">
              <button
                className={`p-2 rounded-lg transition hover:scale-110 cursor-pointer ${
                  dark ? "hover:bg-slate-700" : "hover:bg-gray-100"
                }`}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu size={20} />
              </button>

              <div className="hidden sm:block flex-1 max-w-xs relative">
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
              <button
                className={`p-2 rounded-lg transition hover:scale-110 relative ${
                  dark ? "hover:bg-slate-700" : "hover:bg-gray-100"
                }`}
              >
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

              <div
                className={`flex items-center gap-2 sm:gap-3 px-3 py-2 rounded-full ${
                  dark
                    ? "bg-gradient-to-r from-slate-700 to-slate-600"
                    : "bg-gradient-to-r from-blue-50 to-indigo-50"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-400 flex items-center justify-center text-white font-semibold text-sm">
                  {userInitials || "U"}
                </div>
                <div className="hidden md:block text-sm">
                  <div className="font-medium">{user?.full_name || user?.fullName || "User"}</div>
                  <div className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{user?.email}</div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto w-full">
              {title && (
                <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${dark ? "text-slate-100" : "text-slate-900"}`}>
                  {title}
                </h2>
              )}
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

