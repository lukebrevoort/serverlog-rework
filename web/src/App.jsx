import { useState } from 'react';
import { motion } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { EncryptionForm } from './components/EncyptForm';
import { DecryptionForm } from './components/DecryptForm';
import { LogsViewer } from './components/LogsViewer';
import { ThemeToggle } from './components/ThemeToggle';
import { Toaster } from './components/ui/sonner';
import { Shield, Lock, Unlock, History, Key } from 'lucide-react';

function App() {
  const [logs, setLogs] = useState([]);

  const addLog = (newLog) => {
    setLogs(prevLogs => [newLog, ...prevLogs]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="p-1.5 sm:p-2 bg-primary rounded-lg"
              >
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </motion.div>
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-xl sm:text-2xl font-bold text-primary"
                >
                  SecureLog
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-xs sm:text-sm text-muted-foreground hidden sm:block"
                >
                  Advanced Encryption Services
                </motion.p>
              </div>
            </div>
            
            {/* Theme Toggle */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <ThemeToggle />
            </motion.div>
          </div>
        </div>
      </motion.header>


      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Tabs defaultValue="keys" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 gap-1 mb-6 sm:mb-8 bg-muted/50 h-auto">
              <TabsTrigger value="encrypt" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
                <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                Encrypt
              </TabsTrigger>
              <TabsTrigger value="decrypt" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
                <Unlock className="h-3 w-3 sm:h-4 sm:w-4" />
                Decrypt
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
                <History className="h-3 w-3 sm:h-4 sm:w-4" />
                Logs
                {logs.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full"
                  >
                    {logs.length}
                  </motion.span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="encrypt">
              <EncryptionForm onLog={addLog} />
            </TabsContent>

            <TabsContent value="decrypt">
              <DecryptionForm onLog={addLog} />
            </TabsContent>

            <TabsContent value="logs">
              <LogsViewer clientLogs={logs} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="border-t bg-card/30 mt-16"
      >
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              © 2025 SecureLog. A non-profit organization dedicated to encryption services.
            </p>
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <span>Requests: {logs.length}</span>
              <span>•</span>
              <span>Status: Operational</span>
            </div>
          </div>
        </div>
      </motion.footer>

      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'mt-16 sm:mt-20',
        }}
      />
    </div>
  );
}

export default App;
