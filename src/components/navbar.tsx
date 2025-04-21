"use client";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon, HomeIcon, ChartBarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState("");

  const navItems = [
    { name: "Home", icon: HomeIcon, path: "/" },
    { name: "Dashboard", icon: ChartBarIcon, path: "/dashboard" },
  ];

  // Set initial active item based on current path
  useEffect(() => {
    const currentPath =
      navItems.find((item) => item.path === pathname)?.name || "";
    setActiveItem(currentPath);
  }, [pathname]);

  const handleNavigation = (path: string, name: string) => {
    router.push(path);
    setActiveItem(name);
  };

  return (
    <aside className="h-screen flex flex-col">
      {/* User Profile Section */}
      <div className="flex items-center gap-4 p-6 pb-8">
        <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full">
          <UserCircleIcon className="h-8 text-gray-700 w-8" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">Chakrit Tokavan</h2>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => handleNavigation(item.path, item.name)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer w-full text-left",
              "text-gray-600 hover:bg-emerald-50 transition-all",
              activeItem === item.name &&
                "bg-gradient-to-r from-emerald-50 to-white font-semibold text-emerald-700"
            )}
          >
            <item.icon className="h-5 w-5" strokeWidth={2.5} />
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      {/* Settings Section */}
      <div className="border-t border-gray-100 mt-auto">
        <button className="flex items-center gap-3 w-full px-6 py-4 text-gray-600 hover:bg-gray-50 transition-colors group">
          <Cog6ToothIcon className="h-5 w-5 text-gray-500 group-hover:text-emerald-600" />
          <span className="group-hover:text-emerald-600">Settings</span>
        </button>
      </div>
    </aside>
  );
}
