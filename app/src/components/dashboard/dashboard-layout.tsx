"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Home, Users, Wallet, Settings, LogOut, Menu, X, Bell, User, Shield, ShoppingBag } from "lucide-react"
import { getCurrentUser, signOutUser } from "@/lib/supabase"
import { Spinner } from "@/components/ui/spinner"
import type { User as UserType } from "@/lib/types"
import toast from "react-hot-toast"

interface DashboardLayoutProps {
  children: React.ReactNode
  activeTab: string
}

export default function DashboardLayout({ children, activeTab }: DashboardLayoutProps) {
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/auth/signin")
        return
      }
      setUser(currentUser)
    } catch (error) {
      console.error("Error loading user:", error)
      router.push("/auth/signin")
    } finally {
      setIsLoading(false)
    }
  }

  // Simplified signout handler
  const handleSignOut = async () => {
    try {
      await signOutUser()
      toast.success("Signed out successfully")
      router.push("/auth/signin")
      router.refresh() // Force refresh to clear any cached data
    } catch (error) {
      console.error("Sign out error:", error)
      toast.error("Failed to sign out")
    }
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
    { id: "referrals", label: "Referrals", icon: Users, href: "/dashboard/referrals" },
    { id: "wallet", label: "Wallet", icon: Wallet, href: "/dashboard/wallet" },
    { id: "products", label: "Products", icon: ShoppingBag, href: "/dashboard/products" },
    { id: "settings", label: "Settings", icon: Settings, href: "/dashboard/settings" },
  ]

  if (user?.is_admin) {
    menuItems.splice(4, 0, { id: "admin", label: "Admin Panel", icon: Shield, href: "/admin" })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar - Fixed positioning */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 lg:z-auto
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-bold text-green-600">Taskona</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-col h-full">
          {/* Navigation Menu */}
          <nav className="px-4 py-6 space-y-2">
            {menuItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${
                    activeTab === item.id
                      ? "bg-green-100 text-green-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
                {item.id === "admin" && (
                  <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">Admin</span>
                )}
              </a>
            ))}
          </nav>

          {/* Spacer to push profile section down but not to bottom */}
          <div className="flex-1"></div>

          {/* User Profile Section - POSITIONED AFTER CONTENT WITH SPACING */}
          <div className="relative p-4 border-t border-gray-200 bg-white">
            {/* Profile Menu Dropdown */}
            {showProfileMenu && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  {user.is_admin && (
                    <span className="inline-block mt-1 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                      Administrator
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    router.push("/dashboard/settings")
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button>
                {user.is_admin && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      router.push("/admin")
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Panel
                  </button>
                )}
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}

            {/* Profile Button */}
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3 flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{user.is_admin ? "Administrator" : "Member"}</p>
              </div>
              <div className="ml-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Page Title - Hidden on mobile when sidebar button is shown */}
            <div className="hidden lg:block">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">{activeTab}</h2>
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-4">
              {/* Account Status */}
              {!user.is_activated && (
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  Account Not Activated
                </div>
              )}

              {/* Admin Badge */}
              {user.is_admin && (
                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Admin</div>
              )}

              {/* Balance Display */}
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ₦{user.balance.toLocaleString()}
              </div>

              {/* Notifications */}
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Quick Signout Button in Header */}
              <button
                onClick={handleSignOut}
                className="p-2 rounded-full hover:bg-red-50 transition-colors text-red-600"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Click outside to close profile menu */}
      {showProfileMenu && <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />}
    </div>
  )
}
