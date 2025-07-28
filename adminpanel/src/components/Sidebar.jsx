import { Link, useLocation } from "react-router-dom";
import {
  X,
  LayoutDashboard,
  ShoppingCart,
  Package as PackageIcon,
  Tag,
  User,
  Layers,
} from "lucide-react";
import { useState } from "react";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const [isUnitsOpen, setIsUnitsOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/orders", icon: ShoppingCart },
    { name: "Products", href: "/products", icon: PackageIcon },
    { name: "Categories", href: "/categories", icon: Tag },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/90 backdrop-blur-sm shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center">
            <div className="p-1 rounded-lg">
              <img
                src="assets/logo/nyraalogo.png"
                alt="NYRAA Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#C77096] to-[#A83E68] bg-clip-text text-transparent">
                NYRAA
              </h1>
              <p className="text-xs text-gray-600">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-[#C77096] to-[#A83E68] text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3" size={20} />
                {item.name}
              </Link>
            );
          })}

          {/* Units Dropdown */}
          <div className="mt-4">
            <button
              onClick={() => setIsUnitsOpen(!isUnitsOpen)}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100/80 hover:text-gray-900"
            >
              <Layers className="mr-3" size={20} />
              Units
              <svg
                className={`ml-auto h-5 w-5 transition-transform ${
                  isUnitsOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isUnitsOpen && (
              <div className="mt-2 space-y-1 pl-8">
                <Link
                  to="/colors/add"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setSidebarOpen(false)}
                >
                  Add Color
                </Link>
                <Link
                  to="/sizes/add"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setSidebarOpen(false)}
                >
                  Add Size
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;