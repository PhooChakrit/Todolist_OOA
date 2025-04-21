import Navbar from "@/components/navbar";

export default function Dashboard() {
  // Mock data
  const monthlyStats = {
    completed: 42,
    pending: 18,
    overdue: 5,
    productivityTrend: 15.3, // percentage
  };

  const upcomingTasks = [
    { id: 1, title: "Project Review", date: "2024-03-25", progress: 75 },
    { id: 2, title: "Client Meeting", date: "2024-03-28", progress: 30 },
    { id: 3, title: "Report Submission", date: "2024-04-02", progress: 10 },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-Noto">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 shadow-xl">
          <Navbar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                March 2024 Summary
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
                    {monthlyStats.completed}
                  </div>
                  <div className="text-sm text-gray-500">Tasks Completed</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="text-amber-500 font-bold text-3xl">
                    {monthlyStats.pending}
                  </div>
                  <div className="text-sm text-gray-500">Pending Tasks</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="text-red-500 font-bold text-3xl">
                    {monthlyStats.overdue}
                  </div>
                  <div className="text-sm text-gray-500">Overdue Tasks</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="text-emerald-600 font-bold text-3xl">
                    ↑{monthlyStats.productivityTrend}%
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
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-sm text-gray-500 font-medium py-2"
                      >
                        {day}
                      </div>
                    )
                  )}
                  {/* Example calendar days */}
                  {Array.from({ length: 31 }).map((_, index) => (
                    <div
                      key={index}
                      className="p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="text-sm">{index + 1}</div>
                      <div className="flex justify-center mt-1">
                        {index % 5 === 0 && (
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
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
                      strokeDasharray={`${
                        (monthlyStats.completed /
                          (monthlyStats.completed + monthlyStats.pending)) *
                        283
                      } 283`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {(
                        (monthlyStats.completed /
                          (monthlyStats.completed + monthlyStats.pending)) *
                          100 || 0
                      ).toFixed(0)}
                      %
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
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {task.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(task.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-emerald-500 rounded-full"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-emerald-600">
                          {task.progress}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
