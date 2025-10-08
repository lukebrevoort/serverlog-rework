import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { ChevronLeft, ChevronRight, History, Lock, Unlock, RefreshCw } from 'lucide-react';
import { getLogs } from '../services/api';

export function LogsViewer({ clientLogs = [] }) {
  const [serverLogs, setServerLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  // Combine client-side logs with server logs
  const allLogs = [...clientLogs, ...serverLogs].sort((a, b) => b.timestamp - a.timestamp);
  const totalPages = Math.ceil(allLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = allLogs.slice(startIndex, endIndex);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const offset = 0;
      const size = 100; // Fetch more logs from server
      const response = await getLogs(size, offset);
      
      // Transform server logs to match the expected format
      const transformedLogs = response.logs.map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        ip: log.ip,
        data: log.data,
        type: log.operation // Map 'operation' to 'type'
      }));
      
      setServerLogs(transformedLogs);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load logs:', error);
      // Silently fail for logs - they're not critical to the app functionality
      // User can see client-side logs even if server is down
      if (error.isNetworkError || error.isConnectionRefused) {
        setServerLogs([]); // Clear server logs if can't connect
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const handleRefresh = async () => {
    await fetchLogs();
  };

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <div>
                <CardTitle className="text-lg sm:text-xl">Request Logs</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  View all encryption and decryption requests
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              size="sm"
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {allLogs.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">No logs yet</h3>
              <p className="text-sm text-muted-foreground">
                Encryption and decryption requests will appear here
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Type</TableHead>
                      <TableHead className="whitespace-nowrap hidden sm:table-cell">Timestamp</TableHead>
                      <TableHead className="whitespace-nowrap hidden md:table-cell">IP Address</TableHead>
                      <TableHead className="whitespace-nowrap">Description</TableHead>
                      <TableHead className="text-right whitespace-nowrap hidden lg:table-cell">Request ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      // Show skeleton rows while loading
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                          <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                          <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      currentLogs.map((log, index) => (
                        <motion.tr
                          key={log.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="group hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="py-3">
                            <Badge 
                              variant={log.type === 'encrypt' ? 'default' : 'secondary'}
                              className="flex items-center gap-1 w-fit text-xs"
                            >
                              {log.type === 'encrypt' ? (
                                <Lock className="h-3 w-3" />
                              ) : (
                                <Unlock className="h-3 w-3" />
                              )}
                              <span className="hidden sm:inline">{log.type === 'encrypt' ? 'Encrypt' : 'Decrypt'}</span>
                              <span className="sm:hidden">{log.type === 'encrypt' ? 'Enc' : 'Dec'}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs sm:text-sm hidden sm:table-cell">
                            {formatTimestamp(log.timestamp)}
                          </TableCell>
                          <TableCell className="font-mono text-xs hidden md:table-cell">
                            {log.ip}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm max-w-[200px] truncate">
                            {log.data}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-muted-foreground hidden lg:table-cell">
                            {log.id.slice(-8)}
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, allLogs.length)} of {allLogs.length} entries
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => goToPage(pageNum)}
                            className="w-8 h-8 p-0 text-xs sm:text-sm"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      {totalPages > 5 && (
                        <>
                          <span className="text-muted-foreground text-xs sm:text-sm">...</span>
                          <Button
                            variant={currentPage === totalPages ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => goToPage(totalPages)}
                            className="w-8 h-8 p-0 text-xs sm:text-sm"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
