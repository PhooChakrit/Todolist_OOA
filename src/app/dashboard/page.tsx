'use client';
import Navbar from "@/components/navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import type { User } from "next-auth";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  dueDate: string;
  status: string;
  userEmail: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/profile');
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        if (user?.email) {
          const response = await axios.get(`/api/getTodo?email=${encodeURIComponent(user.email)}`);
          setTodos(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch todos:', err);
      }
    };

    fetchTodos();
  }, [user]);

  // Calculate stats from real data
  const calculateStats = () => {
    const now = new Date();

    return todos.reduce((acc, todo) => {
      if (todo.completed) {
        acc.completed++;
      } else {
        acc.pending++;

        const dueDate = new Date(todo.dueDate);
        if (dueDate < now) {
          acc.overdue++;
        }
      }
      return acc;
    }, { completed: 0, pending: 0, overdue: 0 });
  };

  const stats = calculateStats();
  const completionRate = todos.length > 0
    ? Math.round((stats.completed / todos.length) * 100)
    : 0;

  // Get upcoming tasks (not completed and due date in the future)
  const getUpcomingTasks = () => {
    const now = new Date();
    return todos
      .filter(todo => !todo.completed && new Date(todo.dueDate) > now)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3); // Get top 3
  };

  const upcomingTasks = getUpcomingTasks();

  // Calculate productivity trend (mock for now)
  const productivityTrend = todos.length > 0
    ? Math.round(((stats.completed - stats.pending) / todos.length) * 100)
    : 0;


  const getTasksByDate = () => {
    const tasksByDate: Record<string, { total: number, completed: number }> = {};

    todos.forEach(todo => {
      if (!todo.dueDate) return;

      const date = new Date(todo.dueDate);
      const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

      if (!tasksByDate[dateStr]) {
        tasksByDate[dateStr] = { total: 0, completed: 0 };
      }

      tasksByDate[dateStr].total++;
      if (todo.completed) {
        tasksByDate[dateStr].completed++;
      }
    });

    return tasksByDate;
  };

  const getTasksForSelectedDate = () => {
    if (!selectedDate) return [];

    return todos.filter(todo => {
      if (!todo.dueDate) return false;
      const todoDate = new Date(todo.dueDate);
      return (
        todoDate.getDate() === selectedDate.getDate() &&
        todoDate.getMonth() === selectedDate.getMonth() &&
        todoDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-Noto">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 shadow-xl">
          <Navbar user={user} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-20 flex items-center justify-between p-8 bg-white border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Summary
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Monthly Productivity Overview
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700">
                <span>Export Report</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="text-emerald-600 font-bold text-3xl">
                    {stats.completed}
                  </div>
                  <div className="text-sm text-gray-500">Tasks Completed</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="text-amber-500 font-bold text-3xl">
                    {stats.pending}
                  </div>
                  <div className="text-sm text-gray-500">Pending Tasks</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="text-red-500 font-bold text-3xl">
                    {stats.overdue}
                  </div>
                  <div className="text-sm text-gray-500">Overdue Tasks</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="text-emerald-600 font-bold text-3xl">
                    ↑{productivityTrend}%
                  </div>
                  <div className="text-sm text-gray-500">
                    Productivity Trend
                  </div>
                </div>
              </div>

              {/* Calendar View */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Task Calendar</h2>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-sm text-gray-500 font-medium py-2">
                      {day}
                    </div>
                  ))}

                  {/* Days in month */}
                  {(() => {
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = now.getMonth();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const firstDayOfMonth = new Date(year, month, 1).getDay();

                    const tasksByDate = getTasksByDate();

                    // Blank days before first day of month
                    const blanks = [];
                    for (let i = 0; i < firstDayOfMonth; i++) {
                      blanks.push(<div key={`blank-${i}`} className="p-2"></div>);
                    }

                    // Days in month
                    const days = [];
                    for (let d = 1; d <= daysInMonth; d++) {
                      const dateStr = `${year}-${month}-${d}`;
                      const dayTasks = tasksByDate[dateStr];
                      const hasTasks = dayTasks?.total > 0;
                      const isToday = d === now.getDate() && month === now.getMonth();

                      days.push(
                        <div
                          key={`day-${d}`}
                          className={`p-2 border rounded-lg hover:bg-gray-50 cursor-pointer relative 
                            ${isToday ? 'border-blue-500 bg-blue-50' : ''}`}
                          onClick={() => {
                            const date = new Date(year, month, d);
                            setSelectedDate(date);
                            setShowTaskModal(true);
                          }}
                        >
                          <div className={`text-sm ${isToday ? 'font-bold text-blue-600' : ''}`}>
                            {d}
                          </div>
                          {hasTasks && (
                            <div className="flex justify-center items-center mt-1 space-x-1">
                              {dayTasks.completed > 0 && (
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              )}
                              {(dayTasks.total - dayTasks.completed) > 0 && (
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return [...blanks, ...days];
                  })()}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Progress Chart */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h2 className="text-lg font-semibold mb-6">Completion Rate</h2>
                <div className="relative w-full aspect-square">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      className="fill-none stroke-gray-200"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      className="fill-none stroke-emerald-500"
                      strokeWidth="10"
                      strokeDasharray={`${(completionRate / 100) * 283} 283`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {completionRate}%
                    </div>
                    <div className="text-sm text-gray-500">Completion</div>
                  </div>
                </div>
              </div>

              {/* Upcoming Tasks */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">
                  Upcoming Deadlines
                </h2>
                <div className="space-y-4">
                  {upcomingTasks.map((task) => {
                    // Calculate progress based on status (simplified)
                    let progress = 0;
                    if (task.status === 'in-progress') progress = 50;
                    else if (task.status === 'completed') progress = 100;

                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {task.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-emerald-500 rounded-full"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-emerald-600">
                            {progress}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Tasks for {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <button 
                onClick={() => setShowTaskModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {getTasksForSelectedDate().length > 0 ? (
                getTasksForSelectedDate().map(task => {
                  let statusColor = 'gray-400';
                  if (task.completed) {
                    statusColor = 'emerald-500';
                  } else if (task.status === 'in-progress') {
                    statusColor = 'amber-500';
                  }

                  return (
                    <div key={task.id} className="p-3 border rounded-lg flex items-center justify-between">
                      <div>
                        <h4 className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {task.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Status: {task.completed ? 'Completed' : task.status || 'Not started'}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-${statusColor}`}>
                          {task.completed ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">No tasks for this day</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}