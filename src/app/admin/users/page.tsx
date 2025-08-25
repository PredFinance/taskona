"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import AdminLayout from "@/components/admin/admin-layout"
import { supabase } from "@/lib/supabase"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Users, Search, Filter, UserCheck, UserX, Eye } from "lucide-react"
import type { User } from "@/lib/types"
import toast from "react-hot-toast"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data: usersData, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setUsers(usersData || [])
    } catch (error) {
      console.error("Error loading users:", error)
      toast.error("Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  const handleActivateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          is_activated: true,
          activation_date: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) throw error

      toast.success("User activated successfully")
      loadUsers()
    } catch (error) {
      console.error("Error activating user:", error)
      toast.error("Failed to activate user")
    }
  }

  const handleDeactivateUser = async (userId: string) => {
    try {
      const { error } = await supabase.from("users").update({ is_activated: false }).eq("id", userId)

      if (error) throw error

      toast.success("User deactivated successfully")
      loadUsers()
    } catch (error) {
      console.error("Error deactivating user:", error)
      toast.error("Failed to deactivate user")
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && user.is_activated) ||
      (filterStatus === "inactive" && !user.is_activated) ||
      (filterStatus === "admin" && user.is_admin)

    return matchesSearch && matchesFilter
  })

  if (isLoading) {
    return (
      <AdminLayout activeTab="users">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout activeTab="users">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage all user accounts</p>
          </div>
          <Button className="bg-red-600 hover:bg-red-700">
            <Users className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.referral_code && <div className="text-xs text-blue-600">Ref: {user.referral_code}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.is_activated ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {user.is_activated ? "Active" : "Inactive"}
                        </div>
                        {user.is_admin && (
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Admin
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₦{user.balance.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Earned: ₦{user.total_earned.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user)
                            setShowUserModal(true)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {user.is_activated ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeactivateUser(user.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActivateUser(user.id)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  )
}
