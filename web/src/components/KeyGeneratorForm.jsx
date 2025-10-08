import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Loader2, Key, Copy, Download, CheckCircle, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { generateKeys } from '../services/api';

export function KeyGeneratorForm() {
  const [keys, setKeys] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedPrivate, setCopiedPrivate] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    
    try {
      const response = await generateKeys();
      setKeys(response);
      toast.success('RSA key pair generated successfully!');
    } catch (err) {
      // Handle network/connection errors with detailed messages
      if (err.isNetworkError || err.isConnectionRefused || err.isTimeoutError) {
        toast.error(err.message, { duration: 5000 });
      } else {
        toast.error('Failed to generate keys. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'public') {
        setCopiedPublic(true);
        setTimeout(() => setCopiedPublic(false), 2000);
      } else {
        setCopiedPrivate(true);
        setTimeout(() => setCopiedPrivate(false), 2000);
      }
      toast.success(`${type === 'public' ? 'Public' : 'Private'} key copied to clipboard`);
    } catch (_error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadKey = (text, filename) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filename} downloaded`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>RSA Key Pair Generator</CardTitle>
                <CardDescription>
                  Generate a new RSA-2048 key pair for testing. Keys are generated securely and never stored.
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Generate Keys
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {keys && (
          <CardContent className="space-y-6">
            {/* Public Key */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-600" />
                  <Label>Public Key</Label>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    For Encryption
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(keys.public_key, 'public')}
                  >
                    {copiedPublic ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="ml-2">Copy</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadKey(keys.public_key, 'public_key.pem')}
                  >
                    <Download className="h-4 w-4" />
                    <span className="ml-2">Download</span>
                  </Button>
                </div>
              </div>
              <Textarea
                value={keys.public_key}
                readOnly
                rows={6}
                className="font-mono text-xs bg-muted"
              />
            </motion.div>

            {/* Private Key */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Unlock className="h-4 w-4 text-red-600" />
                  <Label>Private Key</Label>
                  <Badge variant="destructive">
                    For Decryption - Keep Secret!
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(keys.private_key, 'private')}
                  >
                    {copiedPrivate ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="ml-2">Copy</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadKey(keys.private_key, 'private_key.pem')}
                  >
                    <Download className="h-4 w-4" />
                    <span className="ml-2">Download</span>
                  </Button>
                </div>
              </div>
              <Textarea
                value={keys.private_key}
                readOnly
                rows={6}
                className="font-mono text-xs bg-muted"
              />
            </motion.div>

            {/* Usage Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
            >
              <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                📚 Quick Start Guide
              </h5>
              <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-decimal list-inside">
                <li>Copy the <strong className="text-green-600 dark:text-green-400">Public Key</strong> and use it in the Encrypt tab</li>
                <li>Enter some data and click "Encrypt"</li>
                <li>Copy the encrypted result</li>
                <li>Switch to the Decrypt tab and paste the <strong className="text-red-600 dark:text-red-400">Private Key</strong></li>
                <li>Paste the encrypted data and click "Decrypt" to retrieve the original message</li>
              </ol>
            </motion.div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}
