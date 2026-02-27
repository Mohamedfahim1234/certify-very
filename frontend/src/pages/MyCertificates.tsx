import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Eye, Download, FileText } from 'lucide-react';
import axios from 'axios';
import { CertificateStatus } from '@/contexts/CertificateContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface ApprovalHistoryItem {
  level: string;
  action: 'approved' | 'rejected';
  officer: string;
  timestamp: string | Date;
  remarks?: string;
  _id?: string;
}

interface Certificate {
  _id: string;
  userId: string;
  applicantName: string;
  certificateType: string;
  documentUrl?: string[];
  status: CertificateStatus;
  appliedAt: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  rejectionReason?: string | null;
  approvalHistory: ApprovalHistoryItem[];
  seniorapprovalhistory: ApprovalHistoryItem[];
  higherapprovalhistory: ApprovalHistoryItem[];
}

interface StatusBadgeProps {
  status: CertificateStatus;
}

export default function MyCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const { t } = useLanguage();

  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL;

  const getCertificateLabel = (type: string) => {
    const labels: Record<string, string> = {
      caste: t('cert_caste'),
      income: t('cert_income'),
      domicile: t('cert_domicile'),
      marriage: t('cert_marriage'),
      birth: t('cert_birth'),
    };
    return labels[type] || type;
  };

  // A cert is considered approved when status includes 'approved'
  // or when the higher authority has approved it
  const isApproved = (cert: Certificate) =>
    cert.status.includes('approved') ||
    (cert.higherapprovalhistory?.some((h) => h.action === 'approved') ?? false);

  // Trigger browser download for every document URL
  const handleDownloadAll = (cert: Certificate) => {
    const urls = cert.documentUrl;
    if (!urls || urls.length === 0) return;
    urls.forEach((url, idx) => {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${getCertificateLabel(cert.certificateType).replace(/\s+/g, '_')}_doc${idx + 1}.pdf`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await axios.get(`${API_URL}/user/certificates`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const certificate = response.data.certificates;
        const certify = Array.isArray(certificate) ? certificate : [];
        setCertificates(certify);
      } catch (error) {
        console.error('Error fetching certificates:', error);
      }
    };

    fetchCertificates();
  }, [API_URL, token]);

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
            <h1 className="font-heading text-3xl font-bold mb-2">{t('mycerts_title')}</h1>
            <p className="text-muted-foreground">
              {t('mycerts_desc')}
            </p>
          </div>

          {certificates.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-heading text-xl font-semibold mb-2">{t('mycerts_no_certs')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('mycerts_no_certs_desc')}
              </p>
              <Button onClick={() => window.location.href = '/apply'}>
                {t('mycerts_apply_now')}
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {certificates.map((cert, index) => (
                <motion.div
                  key={cert._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-card p-6 hover:shadow-xl transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-heading font-semibold text-lg">
                            {getCertificateLabel(cert.certificateType)}
                          </h3>
                          <StatusBadge status={cert.status} />
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>Certificate ID: <span className="font-mono font-semibold text-foreground">{cert._id}</span></p>
                          <p>Submitted: {new Date(cert.appliedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {isApproved(cert) && (
                          <Button
                            variant="outline"
                            className="border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            onClick={() => handleDownloadAll(cert)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {t('mycerts_view_details')}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => setSelectedCert(cert)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {t('mycerts_view_details')}
                        </Button>
                      </div>
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
              {selectedCert && getCertificateLabel(selectedCert.certificateType)}
            </DialogTitle>
          </DialogHeader>

          {selectedCert && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Certificate ID</p>
                  <p className="font-mono font-semibold">{selectedCert._id}</p>
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
                  <p className="font-semibold">{new Date(selectedCert.appliedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="font-semibold mb-3">Uploaded Documents</h4>
                <div className="grid gap-2">
                  {selectedCert.documentUrl && selectedCert.documentUrl.length > 0 ? (
                    selectedCert.documentUrl.map((url, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Document {idx + 1}</span>
                        <div className="flex gap-2">
                          <a
                            className="btn btn-sm btn-ghost flex items-center"
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </a>
                          <a
                            className="btn btn-sm btn-ghost flex items-center"
                            href={url}
                            download
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No documents uploaded</p>
                  )}
                </div>
              </div>

              {/* Approval Timeline */}
              <div className="space-y-4">
                <h4 className="font-semibold">Approval Timeline</h4>

                {/* No history at all */}
                {(!selectedCert.approvalHistory?.length &&
                  !selectedCert.seniorapprovalhistory?.length &&
                  !selectedCert.higherapprovalhistory?.length) && (
                    <p className="text-sm text-muted-foreground">No approval actions yet</p>
                  )}

                {/* Lower Officer */}
                {selectedCert.approvalHistory && selectedCert.approvalHistory.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-2">Lower Officer</h5>
                    <div className="space-y-2">
                      {selectedCert.approvalHistory.map((history, idx) => (
                        <div key={history._id || idx} className={`p-3 rounded-lg ${history.action === 'approved'
                          ? 'bg-emerald-50 dark:bg-emerald-900/20'
                          : 'bg-red-50 dark:bg-red-900/20'
                          }`}>
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${history.action === 'approved' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
                              }`}>
                              {history.level.charAt(0).toUpperCase() + history.level.slice(1)} Level: {history.action}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(history.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {history.remarks && (
                            <p className="text-sm mt-1 text-muted-foreground">{history.remarks}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mid / Senior Officer */}
                {selectedCert.seniorapprovalhistory && selectedCert.seniorapprovalhistory.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">Mid / Senior Officer</h5>
                    <div className="space-y-2">
                      {selectedCert.seniorapprovalhistory.map((history, idx) => (
                        <div key={history._id || idx} className={`p-3 rounded-lg ${history.action === 'approved'
                          ? 'bg-amber-50 dark:bg-amber-900/20'
                          : 'bg-red-50 dark:bg-red-900/20'
                          }`}>
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${history.action === 'approved' ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'
                              }`}>
                              {history.level.charAt(0).toUpperCase() + history.level.slice(1)} Level: {history.action}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(history.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {history.remarks && (
                            <p className="text-sm mt-1 text-muted-foreground">{history.remarks}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Higher Official */}
                {selectedCert.higherapprovalhistory && selectedCert.higherapprovalhistory.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-indigo-700 dark:text-indigo-400 uppercase tracking-wide mb-2">Higher Official</h5>
                    <div className="space-y-2">
                      {selectedCert.higherapprovalhistory.map((history, idx) => (
                        <div key={history._id || idx} className={`p-3 rounded-lg ${history.action === 'approved'
                          ? 'bg-indigo-50 dark:bg-indigo-900/20'
                          : 'bg-red-50 dark:bg-red-900/20'
                          }`}>
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${history.action === 'approved' ? 'text-indigo-700 dark:text-indigo-400' : 'text-red-700 dark:text-red-400'
                              }`}>
                              {history.level.charAt(0).toUpperCase() + history.level.slice(1)} Level: {history.action}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(history.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {history.remarks && (
                            <p className="text-sm mt-1 text-muted-foreground">{history.remarks}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Rejection Reason */}
              {selectedCert.rejectionReason && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <h4 className="font-semibold text-destructive mb-2">Rejection Reason</h4>
                  <p className="text-sm">{selectedCert.rejectionReason}</p>
                </div>
              )}

              {/* Download Certificate — shown when fully approved */}
              {isApproved(selectedCert) && selectedCert.documentUrl && selectedCert.documentUrl.length > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-4">
                  <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Your Certificate
                  </h4>
                  <div className="space-y-2">
                    {selectedCert.documentUrl.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        download={`${getCertificateLabel(selectedCert.certificateType).replace(/\s+/g, '_')}_doc${idx + 1}.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-white dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-800/40 transition-colors cursor-pointer"
                      >
                        <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Document {idx + 1}</span>
                        <span className="flex items-center gap-1 text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                          <Download className="h-4 w-4" />
                          Download
                        </span>
                      </a>
                    ))}
                  </div>
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
