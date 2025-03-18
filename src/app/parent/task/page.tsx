"use client";

export default function ParentTaskPage() {
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Task Management</h1>
      <p className="text-gray-600 mb-4">Create and manage tasks for your child.</p>
      
      <div className="border rounded-lg p-4 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-2">Create New Task</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Enter task title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              rows={3}
              placeholder="Enter task description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Create Task
          </button>
        </div>
      </div>
      
      <div className="border rounded-lg p-4 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Active Tasks</h2>
        <div className="space-y-2">
          <p className="text-gray-700">No active tasks available.</p>
        </div>
      </div>
    </div>
  );
}
