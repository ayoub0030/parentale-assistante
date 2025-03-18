"use client";

export default function ChildTasksPage() {
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4 text-green-600">My Tasks</h1>
      <p className="text-gray-600 mb-4">View and complete your assigned tasks.</p>
      
      <div className="border rounded-lg p-4 shadow-sm bg-white mb-6">
        <h2 className="text-xl font-semibold mb-4 text-green-600">Today's Tasks</h2>
        <div className="space-y-3">
          <p className="text-gray-500">No tasks assigned for today.</p>
        </div>
      </div>
      
      <div className="border rounded-lg p-4 shadow-sm bg-white mb-6">
        <h2 className="text-xl font-semibold mb-4 text-green-600">Upcoming Tasks</h2>
        <div className="space-y-3">
          <p className="text-gray-500">No upcoming tasks.</p>
        </div>
      </div>
      
      <div className="border rounded-lg p-4 shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-4 text-green-600">Completed Tasks</h2>
        <div className="space-y-3">
          <p className="text-gray-500">No completed tasks yet.</p>
        </div>
      </div>
    </div>
  );
}
