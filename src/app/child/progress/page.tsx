"use client";

export default function ChildProgressPage() {
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4 text-green-600">My Progress</h1>
      <p className="text-gray-600 mb-4">Track your progress and achievements.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border rounded-lg p-4 shadow-sm bg-white">
          <h2 className="text-lg font-semibold mb-2 text-green-600">Tasks Completed</h2>
          <div className="flex items-center justify-center">
            <span className="text-4xl font-bold">0</span>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 shadow-sm bg-white">
          <h2 className="text-lg font-semibold mb-2 text-green-600">Current Streak</h2>
          <div className="flex items-center justify-center">
            <span className="text-4xl font-bold">0</span>
            <span className="ml-2 text-gray-500">days</span>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 shadow-sm bg-white">
          <h2 className="text-lg font-semibold mb-2 text-green-600">Points Earned</h2>
          <div className="flex items-center justify-center">
            <span className="text-4xl font-bold">0</span>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg p-4 shadow-sm bg-white mb-6">
        <h2 className="text-xl font-semibold mb-4 text-green-600">Weekly Progress</h2>
        <div className="h-48 flex items-center justify-center bg-gray-100 rounded">
          <p className="text-gray-500">Progress chart will appear here</p>
        </div>
      </div>
      
      <div className="border rounded-lg p-4 shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-4 text-green-600">Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                <span className="text-gray-400">?</span>
              </div>
              <span className="text-sm text-gray-500">Locked</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
