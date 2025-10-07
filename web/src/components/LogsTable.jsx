import { useState, useEffect } from 'react';
import { getLogs } from '../services/api';
import Pagination from './Pagination';

function LogsTable() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const PAGE_SIZE = 10;

  const fetchLogs = async (page) => {
    setLoading(true);
    setError('');
    
    try {
      const offset = (page - 1) * PAGE_SIZE;
      const response = await getLogs(PAGE_SIZE, offset);
      setLogs(response.logs);
      setTotal(response.total);
    } catch (err) {
      setError('Failed to load logs. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">📋 Request Logs</h2>
        <button
          onClick={() => fetchLogs(currentPage)}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg font-semibold
                   hover:bg-primary-600 hover:-translate-y-0.5 transition-all duration-200
                   shadow-md hover:shadow-lg"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg mb-6">
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary-500"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading logs...</p>
        </div>
      ) : logs.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 text-lg">
            No logs found. Start by encrypting or decrypting some data!
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Timestamp</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Operation</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">IP Address</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Data</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">ID</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                          log.operation === 'encrypt'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-pink-100 text-pink-700'
                        }`}
                      >
                        {log.operation === 'encrypt' ? '🔒' : '🔓'} {log.operation}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                      {log.ip}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono max-w-xs truncate">
                      {log.data}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                      {log.id.substring(0, 8)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}

export default LogsTable;