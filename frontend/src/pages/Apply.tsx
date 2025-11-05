import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCertificates, CertificateType } from '@/contexts/CertificateContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const certificateTypes = [
  { 
    value: 'caste' as CertificateType, 
    label: 'Caste Certificate',
    documents: ['Aadhaar Card', 'School/Parent\'s Certificate']
  },
  { 
    value: 'income' as CertificateType, 
    label: 'Income Certificate',
    documents: ['Aadhaar Card', 'Basic Income Declaration']
  },
  { 
    value: 'domicile' as CertificateType, 
    label: 'Domicile Certificate',
    documents: ['Aadhaar Card', 'Address Proof (Electricity Bill or Rental Agreement)']
  },
  { 
    value: 'marriage' as CertificateType, 
    label: 'Marriage Certificate',
    documents: ['Aadhaar Cards (Both)', 'Wedding Photo/Invitation', 'Witness ID Proof']
  },
  { 
    value: 'birth' as CertificateType, 
    label: 'Birth Certificate',
    documents: ['Hospital Birth Slip or Parent\'s Aadhaar', 'Application Form']
  },
];

export default function Apply() {
  const { user } = useAuth();
  const { addCertificate } = useCertificates();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<CertificateType | ''>('');
  const [uploads, setUploads] = useState<{ [key: string]: File | null }>({});

  const selectedCertificate = certificateTypes.find(c => c.value === selectedType);

  const handleFileUpload = (docName: string, file: File | null) => {
    if (file) {
      // Validate file
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type)) {
        toast.error('Only PDF, JPEG, and PNG files are allowed');
        return;
      }

      if (file.size > maxSize) {
        toast.error('File size must not exceed 10MB');
        return;
      }

      setUploads(prev => ({ ...prev, [docName]: file }));
      toast.success(`${file.name} uploaded successfully`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType || !user) return;

    const requiredDocs = selectedCertificate?.documents || [];
    const missingDocs = requiredDocs.filter(doc => !uploads[doc]);

    if (missingDocs.length > 0) {
      toast.error(`Please upload: ${missingDocs.join(', ')}`);
      return;
    }

    // Create certificate
    addCertificate({
      applicantId: user.id,
      applicantName: user.name,
      type: selectedType,
      status: 'pending_officer',
      submittedDate: new Date().toISOString().split('T')[0],
      documents: Object.entries(uploads).map(([name, file]) => ({
        name: file?.name || name,
        url: '#',
        type: file?.type || 'application/pdf'
      })),
      approvalHistory: []
    });

    toast.success('Application submitted successfully!');
    navigate('/my-certificates');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">Apply for Certificate</h1>
            <p className="text-muted-foreground">
              Select certificate type and upload required documents
            </p>
          </div>

          <Card className="glass-card p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Certificate Type Selection */}
              <div className="space-y-2">
                <Label>Certificate Type</Label>
                <Select value={selectedType} onValueChange={(value) => {
                  setSelectedType(value as CertificateType);
                  setUploads({});
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a certificate type" />
                  </SelectTrigger>
                  <SelectContent>
                    {certificateTypes.map((cert) => (
                      <SelectItem key={cert.value} value={cert.value}>
                        {cert.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Document Upload Section */}
              <AnimatePresence>
                {selectedCertificate && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-primary" />
                        Required Documents
                      </h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {selectedCertificate.documents.map((doc) => (
                          <li key={doc}>• {doc}</li>
                        ))}
                      </ul>
                    </div>

                    {selectedCertificate.documents.map((docName) => (
                      <div key={docName} className="space-y-2">
                        <Label>{docName}</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                          <input
                            type="file"
                            id={docName}
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(docName, e.target.files?.[0] || null)}
                          />
                          <label htmlFor={docName} className="cursor-pointer">
                            {uploads[docName] ? (
                              <div className="flex items-center justify-center gap-2 text-accent">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-medium">{uploads[docName]?.name}</span>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  PDF, JPEG, PNG (max 10MB)
                                </p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={!selectedType || Object.keys(uploads).length === 0}
              >
                <FileText className="h-5 w-5 mr-2" />
                Submit Application
              </Button>
            </form>
          </Card>
        </motion.div>
      </main>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
