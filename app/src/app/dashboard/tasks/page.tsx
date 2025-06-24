"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import TaskCard from "@/components/tasks/task-card"
import TaskModal from "@/components/tasks/task-modal"
import { getCurrentUser } from "@/lib/supabase"
import { supabase } from "@/lib/supabase"
import type { Task, User, UserTask } from "@/lib/types"
import { Spinner } from "@/components/ui/spinner"
import { Search, Filter } from "lucide-react"

export default function TasksPage() {
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [completedTasks, setCompletedTasks] = useState<UserTask[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) return

      setUser(currentUser)

      // Load available tasks
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      // Load completed tasks for this user
      const { data: completedTasksData } = await supabase.from("user_tasks").select("*").eq("user_id", currentUser.id)

      setTasks(tasksData || [])
      setCompletedTasks(completedTasksData || [])
    } catch (error) {
      console.error("Error loading tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartTask = (task: Task) => {
    setSelectedTask(task)
    setIsModalOpen(true)
  }

  const handleTaskComplete = () => {
    loadData() // Reload data to update completed tasks
  }

  const isTaskCompleted = (taskId: string) => {
    return completedTasks.some((ct) => ct.task_id === taskId)
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || task.task_type === filterType
    return matchesSearch && matchesFilter
  })

  if (isLoading) {
    return (
      <DashboardLayout activeTab="tasks">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user?.is_activated) {
    return (
      <DashboardLayout activeTab="tasks">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Not Activated</h2>
          <p className="text-gray-600">Please activate your account to access tasks.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeTab="tasks">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Available Tasks</h1>
            <p className="text-gray-600">Complete tasks to earn money</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Types</option>
              <option value="daily">Daily</option>
              <option value="social">Social</option>
              <option value="survey">Survey</option>
              <option value="referral">Referral</option>
            </select>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} onStart={handleStartTask} isCompleted={isTaskCompleted(task.id)} />
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Task Modal */}
        <TaskModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onComplete={handleTaskComplete}
          userId={user?.id || ""}
        />
      </div>
    </DashboardLayout>
  )
}
