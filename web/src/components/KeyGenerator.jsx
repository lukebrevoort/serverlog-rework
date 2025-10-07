import { useState } from 'react';
import { generateKeys } from '../services/api';

function KeyGenerator() {
  const [keys, setKeys] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await generateKeys();
      setKeys(response);
    } catch (err) {
      setError('Failed to generate keys. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    alert(`${type} copied to clipboard!`);
  };

  const downloadKey = (text, filename) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              🔑 RSA Key Pair Generator
            </h3>
            <p className="text-sm text-gray-600">
              Generate a new RSA-2048 key pair for testing. Keys are generated securely and never stored.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white 
                     font-semibold rounded-lg shadow-md hover:shadow-xl hover:-translate-y-0.5
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                     transition-all duration-300 whitespace-nowrap"
          >
            {loading ? '🔄 Generating...' : '✨ Generate Keys'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {keys && (
          <div className="mt-6 space-y-4">
            {/* Public Key */}
            <div className="bg-white rounded-lg border-2 border-green-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔓</span>
                  <div>
                    <h4 className="font-bold text-gray-800">Public Key</h4>
                    <p className="text-xs text-gray-500">Use this for ENCRYPTION</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(keys.public_key, 'Public key')}
                    className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg 
                             hover:bg-green-600 transition-colors font-semibold"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={() => downloadKey(keys.public_key, 'public_key.pem')}
                    className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg 
                             hover:bg-blue-600 transition-colors font-semibold"
                  >
                    💾 Download
                  </button>
                </div>
              </div>
              <textarea
                value={keys.public_key}
                readOnly
                rows="6"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded 
                         font-mono text-xs text-gray-700 resize-none"
              />
            </div>

            {/* Private Key */}
            <div className="bg-white rounded-lg border-2 border-red-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔐</span>
                  <div>
                    <h4 className="font-bold text-gray-800">Private Key</h4>
                    <p className="text-xs text-red-600 font-semibold">
                      ⚠️ Use this for DECRYPTION - Keep it secret!
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(keys.private_key, 'Private key')}
                    className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg 
                             hover:bg-red-600 transition-colors font-semibold"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={() => downloadKey(keys.private_key, 'private_key.pem')}
                    className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg 
                             hover:bg-blue-600 transition-colors font-semibold"
                  >
                    💾 Download
                  </button>
                </div>
              </div>
              <textarea
                value={keys.private_key}
                readOnly
                rows="6"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded 
                         font-mono text-xs text-gray-700 resize-none"
              />
            </div>

            {/* Usage Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-gray-800 mb-2">📚 Quick Start:</h5>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Copy the <strong className="text-green-600">Public Key</strong> and paste it in the Encrypt tab</li>
                <li>Enter some data and click "Encrypt"</li>
                <li>Copy the encrypted result</li>
                <li>Go to the Decrypt tab and paste the <strong className="text-red-600">Private Key</strong></li>
                <li>Paste the encrypted data and click "Decrypt"</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default KeyGenerator;