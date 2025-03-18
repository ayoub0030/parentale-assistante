"use client";

export default function ParentChildPage() {
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Child Monitoring</h1>
      <p className="text-gray-600 mb-4">Monitor your child's activities and progress.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Recent Activities</h2>
          <div className="space-y-2">
            <p className="text-gray-700">No recent activities recorded.</p>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Child Profile</h2>
          <div className="space-y-2">
            <p className="text-gray-700">No profile information available.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
