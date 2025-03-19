"use client";

export default function ChildTasksPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6 text-green-600">My Tasks</h1>
      <p className="text-gray-600 mb-8">View and complete your assigned tasks.</p>
      
      <div className="border rounded-lg p-6 shadow-sm bg-white mb-8">
        <h2 className="text-xl font-semibold mb-6 text-green-600">Today's Tasks</h2>
        <div className="space-y-4">
          <p className="text-gray-500">No tasks assigned for today.</p>
        </div>
      </div>
      
      <div className="border rounded-lg p-6 shadow-sm bg-white mb-8">
        <h2 className="text-xl font-semibold mb-6 text-green-600">Upcoming Tasks</h2>
        <div className="space-y-4">
          <p className="text-gray-500">No upcoming tasks.</p>
        </div>
      </div>
      
      <div className="border rounded-lg p-6 shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-6 text-green-600">Completed Tasks</h2>
        <div className="space-y-4">
          <p className="text-gray-500">No completed tasks yet.</p>
        </div>
      </div>
    </div>
  );
}
