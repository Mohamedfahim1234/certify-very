import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ShieldCheck, Search, FileUp, Loader2, Upload } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function Verify() {
  const [activeTab, setActiveTab] = useState<'id' | 'file'>('id');
  const [hash, setHash] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  // Route API calls to the correct backend path based on the user's role
  const getApiPrefix = () => {
    const role = localStorage.getItem('role');
    switch (role) {
      case 'lower': return '/officer';
      case 'mid': return '/senior-officer';
      case 'higher': return '/higher-officer';
      default: return '/user';
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required. Please login to verify certificates.');
      navigate('/');
    }
  }, [navigate]);

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (activeTab === 'id') {
      const trimmedHash = hash.trim();
      if (!trimmedHash) return;

      setLoading(true);
      setResult(null);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        const prefix = getApiPrefix();
        const response = await axios.get(`${API_URL}${prefix}/certificate/verify/${trimmedHash}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResult(response.data.certificate);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError(t('verify_not_found') || 'No certificate found with this security hash or ID.');
        } else {
          setError(t('verify_error') || 'Failed to verify certificate.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      if (!file) {
        toast.error('Please select a certificate file first.');
        return;
      }

      setLoading(true);
      setResult(null);
      setError(null);

      const formData = new FormData();
      formData.append('certificate', file);

      try {
        const token = localStorage.getItem('token');
        const prefix = getApiPrefix();
        const response = await axios.post(`${API_URL}${prefix}/certificate/verify-upload`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.data.status === 'valid') {
          setResult(response.data.verificationDetails);
        } else {
          setError('Certificate verification failed. Record not found.');
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('No matching certificate record found for this file.');
        } else {
          setError('Failed to process file verification. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-2"
            >
              <ShieldCheck className="h-10 w-10" />
            </motion.div>
            <h1 className="font-heading text-4xl font-bold">{t('verify_title') || 'Digital Verification'}</h1>
            <p className="text-muted-foreground">
              {t('verify_desc') || 'Verify the authenticity of any digital certificate using its ID or the file itself.'}
            </p>
          </div>

          <Card className="glass-card overflow-hidden shadow-xl border-t-4 border-t-indigo-500">
            <div className="flex border-b">
              <button
                onClick={() => { setActiveTab('id'); setResult(null); setError(null); }}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'id' ? 'bg-indigo-500/10 text-indigo-600' : 'hover:bg-slate-50'}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Search className="h-4 w-4" />
                  Verify by ID / Hash
                </div>
              </button>
              <button
                onClick={() => { setActiveTab('file'); setResult(null); setError(null); }}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'file' ? 'bg-indigo-500/10 text-indigo-600' : 'hover:bg-slate-50'}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FileUp className="h-4 w-4" />
                  Verify by File Upload
                </div>
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleVerify} className="space-y-4">
                {activeTab === 'id' ? (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Certificate Hash or ID
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. CERT-2024-0001"
                        className="font-mono"
                        value={hash}
                        onChange={(e) => setHash(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Upload Certificate File (PDF/Image)
                    </label>
                    <div className="relative group">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${file ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 group-hover:border-indigo-400'}`}>
                        {file ? (
                          <div className="space-y-2">
                            <CheckCircle2 className="h-10 w-10 text-indigo-600 mx-auto" />
                            <p className="font-medium text-indigo-600">{file.name}</p>
                            <p className="text-xs text-muted-foreground">Click to change file</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="h-10 w-10 text-slate-400 mx-auto group-hover:scale-110 transition-transform" />
                            <p className="text-sm font-medium">Click or drag & drop to upload</p>
                            <p className="text-xs text-muted-foreground">PDF, JPG, PNG allowed</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <Button type="submit" disabled={loading || (activeTab === 'id' ? !hash : !file)} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg">
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-5 w-5 mr-2" />
                      {t('verify_button') || 'Verify Authenticity'}
                    </>
                  )}
                </Button>
              </form>
            </div>
          </Card>

          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="p-8 border-2 border-emerald-500/30 bg-emerald-500/5 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                     <CheckCircle2 className="h-24 w-24 text-emerald-500" />
                  </div>
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="p-2 rounded-full bg-emerald-500/20">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">
                        {t('verify_success') || 'Authenticity Verified'}
                      </h3>
                      <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80">
                        This digital record matches our official blockchain database.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div className="space-y-1 bg-white/50 dark:bg-slate-900/50 p-3 rounded-lg border border-emerald-500/10">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Issued To</p>
                      <p className="text-lg font-semibold">{result.applicantName || result.issuedTo}</p>
                    </div>
                    <div className="space-y-1 bg-white/50 dark:bg-slate-900/50 p-3 rounded-lg border border-emerald-500/10">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Certificate Type</p>
                      <p className="text-lg font-semibold uppercase">{result.certificateType}</p>
                    </div>
                    <div className="space-y-1 bg-white/50 dark:bg-slate-900/50 p-3 rounded-lg border border-emerald-500/10">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Certificate ID</p>
                      <p className="text-md font-mono font-bold text-indigo-600">{result.certificateId}</p>
                    </div>
                    <div className="space-y-1 bg-white/50 dark:bg-slate-900/50 p-3 rounded-lg border border-emerald-500/10">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Blockchain Hash</p>
                      <p className="text-[11px] font-mono break-all opacity-70 italic">{result.blockchainHash}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="p-8 border-2 border-destructive/30 bg-destructive/5 text-center space-y-4 shadow-lg">
                  <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto">
                    <XCircle className="h-12 w-12 text-destructive" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-destructive">{t('verify_failed') || 'Verification Failed'}</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">{error}</p>
                  </div>
                  <Button variant="outline" onClick={() => setError(null)} className="border-destructive/20 text-destructive hover:bg-destructive/10">
                    Try another file
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
