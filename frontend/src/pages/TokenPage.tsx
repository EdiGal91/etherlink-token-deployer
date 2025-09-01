import { useParams } from "react-router-dom";

export function TokenPage() {
  const { address } = useParams<{ address: string }>();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <h1 className="text-2xl font-bold mb-4">Token Details</h1>
        <div className="text-sm font-mono text-gray-500 bg-gray-100 p-3 rounded">
          Contract Address: {address}
        </div>
        <p className="mt-4 text-gray-600">
          Token page for {address} - More details coming soon!
        </p>
      </div>
    </div>
  );
}
