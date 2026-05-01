export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600">RateMe</h1>
          <p className="text-gray-500 mt-2">Rate and be rated by people you trust</p>
        </div>
        {children}
      </div>
    </div>
  )
}
