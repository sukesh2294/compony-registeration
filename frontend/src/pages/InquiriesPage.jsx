

export default function InquiriesPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-green-100 text-green-600">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path   
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Inquiries Feature Coming Soon
        </h1>
        <p className="text-gray-600 leading-relaxed">
          We’re currently working on building an inquiries feature to help you
          manage and respond to customer questions and requests efficiently.
            This feature will be available in an upcoming update.
        </p>
      </div>
    </div>
  );
}