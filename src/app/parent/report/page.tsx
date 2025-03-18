"use client";

export default function ParentReportPage() {
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Progress Reports</h1>
      <p className="text-gray-600 mb-4">View detailed reports on your child's progress and activities.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Task Completion</h2>
          <div className="h-48 flex items-center justify-center bg-gray-100 rounded">
            <p className="text-gray-500">Task completion chart will appear here</p>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Activity Summary</h2>
          <div className="h-48 flex items-center justify-center bg-gray-100 rounded">
            <p className="text-gray-500">Activity summary chart will appear here</p>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg p-4 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Detailed Reports</h2>
        <div className="space-y-4">
          <div className="p-3 border rounded bg-gray-50">
            <p className="text-gray-700">No reports available yet. Reports will be generated as your child completes tasks.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
