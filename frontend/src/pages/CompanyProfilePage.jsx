


export default function CompanyProfilePage() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-purple-100 text-purple-600">
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
                                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9 6 9-6M3 7l9-6 9 6"
                            />
                        </svg>
                    </div>
                </div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-3">
                    Company Info Page Coming Soon
                </h1>
                <p className="text-gray-600 leading-relaxed">
                    We’re currently working on building the Company Info Page to help you
                    manage and showcase your company's information effectively.
                    This feature will be available in an upcoming update.
                </p>
            </div>
        </div>
    );
}