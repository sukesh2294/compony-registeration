import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-blue-100 text-blue-600">
            <BarChart3 size={40} />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Analytics Coming Soon
        </h1>

        <p className="text-gray-600 leading-relaxed">
          We’re currently working on building powerful analytics to help you
          track performance, gain insights, and make data-driven decisions.
          This feature will be available in an upcoming update.
        </p>

      </div>
    </div>
  );
}
