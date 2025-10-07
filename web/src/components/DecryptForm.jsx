import { useState } from 'react';
import { decryptData } from '../services/api';

function DecryptForm() {
  const [key, setKey] = useState('');
  const [data, setData] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await decryptData(key, data);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Decryption failed. Please check your key and data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    alert('Copied to clipboard!');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        🔓 Decrypt Data
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label 
            htmlFor="decrypt-key" 
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Private Key (PEM format)
          </label>
          <textarea
            id="decrypt-key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="-----BEGIN PRIVATE KEY-----&#10;MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwgg...&#10;-----END PRIVATE KEY-----"
            rows="8"
            required
            disabled={loading}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-mono text-sm 
                     focus:border-pink-500 focus:ring-2 focus:ring-pink-200 
                     disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors
                     resize-y"
          />
        </div>

        <div>
          <label 
            htmlFor="decrypt-data" 
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Encrypted Data
          </label>
          <textarea
            id="decrypt-data"
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="Paste encrypted data here..."
            rows="4"
            required
            disabled={loading}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-mono text-sm 
                     focus:border-pink-500 focus:ring-2 focus:ring-pink-200 
                     disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors
                     resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-pink-500 to-red-500 
                   text-white font-semibold text-lg rounded-lg shadow-md
                   hover:shadow-xl hover:-translate-y-0.5 
                   disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                   transition-all duration-300"
        >
          {loading ? '🔄 Decrypting...' : '🔓 Decrypt'}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-red-700">
            <strong className="font-semibold">❌ Error:</strong> {error}
          </p>
        </div>
      )}

      {result && (
        <div className="mt-8 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              ✅ Decrypted Result
            </h3>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold
                       hover:bg-green-600 hover:-translate-y-0.5 transition-all duration-200
                       shadow-md hover:shadow-lg"
            >
              📋 Copy
            </button>
          </div>
          <textarea
            value={result}
            readOnly
            rows="6"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg 
                     font-mono text-sm text-gray-700 resize-y"
          />
        </div>
      )}
    </div>
  );
}

export default DecryptForm;