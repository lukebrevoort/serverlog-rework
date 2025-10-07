import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Loader2, Unlock, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { decryptData } from '../services/api';

export function DecryptionForm({ onLog }) {
  const [key, setKey] = useState('');
  const [payload, setPayload] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleDecrypt = async () => {
    if (!key.trim() || !payload.trim()) {
      setError('Please provide both decryption key and encrypted data');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');
    
    try {
      // Call actual API
      const response = await decryptData(key, payload);
      setResult(response.data);
    
      
      toast.success('Data decrypted successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Decryption failed. Please check your key and data.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      toast.success('Decrypted data copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Unlock className="h-5 w-5 text-primary" />
            <CardTitle>Decrypt Data</CardTitle>
          </div>
          <CardDescription>
            Decrypt your encrypted data using the corresponding private key
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="decrypt-key">Private Key (PEM format)</Label>
            <Textarea
              id="decrypt-key"
              placeholder="-----BEGIN PRIVATE KEY-----&#10;MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwgg...&#10;-----END PRIVATE KEY-----"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              disabled={isLoading}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="decrypt-payload">Encrypted Data</Label>
            <Textarea
              id="decrypt-payload"
              placeholder="Paste the encrypted data you want to decrypt"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              disabled={isLoading}
              rows={4}
              className="font-mono text-sm"
            />
            {payload && (
              <div className="text-sm text-muted-foreground">
                Data length: {payload.length} characters
              </div>
            )}
          </div>

          <Button 
            onClick={handleDecrypt}
            disabled={isLoading || !key.trim() || !payload.trim()}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Decrypting...
              </>
            ) : (
              <>
                <Unlock className="mr-2 h-4 w-4" />
                Decrypt Data
              </>
            )}
          </Button>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
            >
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </motion.div>
          )}

          {result && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <Label>Decrypted Result</Label>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Success
                </Badge>
              </div>
              <div className="relative">
                <Textarea
                  value={result}
                  readOnly
                  rows={6}
                  className="bg-muted"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
