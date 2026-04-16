export default function AccountLoading() {
  return (
    <div className="flex h-screen bg-black text-white">
      {/* Left Sidebar Navigation Skeleton */}
      <div className="fixed left-0 top-[60px] h-[calc(100vh-60px)] w-[50px] bg-black border-r border-gray-800 shadow-lg z-40">
        <div className="flex flex-col items-center py-6 space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-10 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar Skeleton */}
        <div className="fixed top-0 left-0 w-full h-[60px] bg-black border-b border-gray-800 z-50">
          <div className="flex items-center justify-between px-8 h-full">
            <div className="h-8 bg-gray-700 rounded animate-pulse w-32"></div>
            <div className="flex items-center gap-4">
              <div className="h-8 bg-gray-700 rounded animate-pulse w-8"></div>
              <div className="h-8 bg-gray-700 rounded animate-pulse w-32"></div>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto ml-[50px] mt-[60px]">
          <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
            {/* Welcome header skeleton */}
            <div className="text-center space-y-2">
              <div className="h-9 bg-gray-700 rounded-lg animate-pulse mx-auto w-80"></div>
              <div className="h-4 bg-gray-700 rounded animate-pulse mx-auto w-48"></div>
            </div>
            
            {/* Split layout container skeleton */}
            <div className="flex flex-col lg:flex-row gap-8 mt-8">
              {/* Left/Main content area skeleton */}
              <div className="flex-1 space-y-6">
                {/* Account Information skeleton */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
                  <div className="h-6 bg-gray-700 rounded animate-pulse w-48 mb-6"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                        <div className="w-5 h-5 bg-gray-700 rounded animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-700 rounded animate-pulse w-24"></div>
                          <div className="h-5 bg-gray-700 rounded animate-pulse w-32"></div>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2">
                      <div className="h-10 bg-gray-700 rounded animate-pulse w-32"></div>
                    </div>
                  </div>
                </div>

                {/* Account Settings skeleton */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
                  <div className="h-6 bg-gray-700 rounded animate-pulse w-40 mb-6"></div>
                  <div className="space-y-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-gray-700 rounded animate-pulse"></div>
                          <div className="space-y-2">
                            <div className="h-5 bg-gray-700 rounded animate-pulse w-32"></div>
                            <div className="h-4 bg-gray-700 rounded animate-pulse w-48"></div>
                          </div>
                        </div>
                        <div className="w-11 h-6 bg-gray-700 rounded-full animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coming Soon skeleton */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <div className="h-6 bg-gray-700 rounded animate-pulse w-32 mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-64"></div>
                </div>
              </div>
              
              {/* Right sticky balance panel skeleton */}
              <div className="lg:w-80 lg:sticky lg:top-8 lg:self-start">
                <div className="hidden md:block">
                  <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-2xl">
                    <div className="text-center space-y-6">
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-700 rounded animate-pulse mx-auto w-24"></div>
                        <div className="h-16 bg-gray-700 rounded-lg animate-pulse mx-auto w-32"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse mx-auto w-32"></div>
                      </div>
                      <div className="h-12 bg-gray-700 rounded-lg animate-pulse mx-auto w-full"></div>
                      <div className="h-3 bg-gray-700 rounded animate-pulse mx-auto w-24"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Parlay Cart Skeleton (hidden by default) */}
      <div className="fixed top-[60px] right-0 h-[calc(100vh-60px)] w-[400px] bg-black border-l border-gray-700 shadow-2xl translate-x-full">
        {/* Cart content skeleton would go here */}
      </div>
    </div>
  );
} 