import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCertificates, Certificate } from '@/contexts/CertificateContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Eye, Download, FileText } from 'lucide-react';

export default function MyCertificates() {
  const { user } = useAuth();
  const { getCertificatesByUserId } = useCertificates();
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const certificates = user ? getCertificatesByUserId(user.id) : [];

  const getCertificateLabel = (type: string) => {
    const labels: Record<string, string> = {
      caste: 'Caste Certificate',
      income: 'Income Certificate',
      domicile: 'Domicile Certificate',
      marriage: 'Marriage Certificate',
      birth: 'Birth Certificate',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">My Certificates</h1>
            <p className="text-muted-foreground">
              Track the status of all your certificate applications
            </p>
          </div>

          {certificates.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-heading text-xl font-semibold mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't submitted any certificate applications
              </p>
              <Button onClick={() => window.location.href = '/apply'}>
                Apply for Certificate
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {certificates.map((cert, index) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-card p-6 hover:shadow-xl transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-heading font-semibold text-lg">
                            {getCertificateLabel(cert.type)}
                          </h3>
                          <StatusBadge status={cert.status} />
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>Certificate ID: <span className="font-mono font-semibold text-foreground">{cert.id}</span></p>
                          <p>Submitted: {new Date(cert.submittedDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedCert(cert)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Certificate Detail Modal */}
      <Dialog open={!!selectedCert} onOpenChange={() => setSelectedCert(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">
              {selectedCert && getCertificateLabel(selectedCert.type)}
            </DialogTitle>
          </DialogHeader>

          {selectedCert && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Certificate ID</p>
                  <p className="font-mono font-semibold">{selectedCert.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={selectedCert.status} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applicant</p>
                  <p className="font-semibold">{selectedCert.applicantName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-semibold">{new Date(selectedCert.submittedDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="font-semibold mb-3">Uploaded Documents</h4>
                <div className="grid gap-2">
                  {selectedCert.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">{doc.name}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Approval Timeline */}
              <div>
                <h4 className="font-semibold mb-3">Approval Timeline</h4>
                <div className="space-y-4">
                  {selectedCert.approvalHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No approval actions yet
                    </p>
                  ) : (
                    selectedCert.approvalHistory.map((entry, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            entry.action === 'approved' ? 'bg-accent' : 'bg-destructive'
                          }`} />
                          {idx < selectedCert.approvalHistory.length - 1 && (
                            <div className="w-0.5 h-12 bg-border" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-semibold">{entry.level}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.action === 'approved' ? 'Approved' : 'Rejected'} by {entry.officer}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                          {entry.remarks && (
                            <p className="text-sm mt-2 p-2 bg-muted/50 rounded">
                              {entry.remarks}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Rejection Reason */}
              {selectedCert.rejectionReason && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <h4 className="font-semibold text-destructive mb-2">Rejection Reason</h4>
                  <p className="text-sm">{selectedCert.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
