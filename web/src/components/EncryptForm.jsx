import { useState } from 'react';
import { encryptData } from '../services/api';

function EncryptForm() {
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
      const response = await encryptData(key, data);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Encryption failed. Please check your key format.');
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
        🔒 Encrypt Data
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Public Key Input */}
        <div>
          <label 
            htmlFor="encrypt-key" 
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Public Key (PEM format)
          </label>
          <textarea
            id="encrypt-key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="-----BEGIN PUBLIC KEY-----&#10;MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...&#10;-----END PUBLIC KEY-----"
            rows="8"
            required
            disabled={loading}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-mono text-sm 
                     focus:border-primary-500 focus:ring-2 focus:ring-primary-200 
                     disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors
                     resize-y"
          />
        </div>

        {/* Data Input */}
        <div>
          <label 
            htmlFor="encrypt-data" 
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Data to Encrypt
          </label>
          <textarea
            id="encrypt-data"
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="Enter your sensitive data here..."
            rows="4"
            required
            disabled={loading}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-mono text-sm 
                     focus:border-primary-500 focus:ring-2 focus:ring-primary-200 
                     disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors
                     resize-y"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-pink-500 to-red-500 
                   text-white font-semibold text-lg rounded-lg shadow-md
                   hover:shadow-xl hover:-translate-y-0.5 
                   disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                   transition-all duration-300"
        >
          {loading ? '🔄 Encrypting...' : '🔒 Encrypt'}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-red-700">
            <strong className="font-semibold">❌ Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Result Display */}
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

export default EncryptForm;