import { useEffect, useState } from 'react';
import { CertificateStatus } from '@/contexts/CertificateContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Eye, CheckCircle, XCircle, Search, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

// Status derived from higherapprovalhistory
const getHigherAuthorityStatus = (cert: Certificate): 'pending' | 'approved' | 'rejected' => {
  if (cert.higherapprovalhistory && cert.higherapprovalhistory.length > 0) {
    const entry = cert.higherapprovalhistory.find(
      (h) => h.level === 'higher' || h.level === 'final'
    );
    if (entry) return entry.action === 'approved' ? 'approved' : 'rejected';
  }
  return 'pending';
};

// Status derived from approvalHistory (lower officer)
const getLowerAuthorityStatus = (cert: Certificate): 'pending' | 'approved' | 'rejected' => {
  if (cert.approvalHistory && cert.approvalHistory.length > 0) {
    const entry = cert.approvalHistory.find(
      (h) => h.level === 'lower' || h.level === 'officer' || h.level === 'final'
    );
    if (entry) return entry.action === 'approved' ? 'approved' : 'rejected';
  }
  return 'pending';
};

// Status derived from seniorapprovalhistory (mid officer)
const getMidAuthorityStatus = (cert: Certificate): 'pending' | 'approved' | 'rejected' => {
  if (cert.seniorapprovalhistory && cert.seniorapprovalhistory.length > 0) {
    const entry = cert.seniorapprovalhistory.find(
      (h) => h.level === 'senior' || h.level === 'mid' || h.level === 'final'
    );
    if (entry) return entry.action === 'approved' ? 'approved' : 'rejected';
  }
  return 'pending';
};

export default function OfficialDashboard() {
  const navigate = useNavigate();
  const [certificatesData, setCertificatesData] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const { t } = useLanguage();

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('role');

  if (!token) {
    navigate('/officer-login');
  }

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await axios.get(`${API_URL}/higher-officer/certificates/list`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.status === 200) {
          console.log('Fetched certificates:', response.data.certificates);
          const certificate = response.data.certificates;
          const Certificate = Array.isArray(certificate) ? certificate : [];
          setCertificatesData(Certificate);
        }
      } catch (error) {
        console.error('Error fetching certificates:', error);
        toast.error('Failed to fetch certificates');
      }
    };

    fetchCertificates();
  }, [API_URL, token]);


  const handleApprove = async (cert: Certificate) => {
    try {
      const response = await axios.put(`${API_URL}/higher-officer/certificate/status/update/${cert._id}`, {
        status: 'approved',
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        toast.success('Certificate approved successfully');
        setSelectedCert(null);
      } else {
        toast.error('Failed to approve certificate');
      }
    } catch (error) {
      toast.error('Failed to approve certificate');
    }
  };

  const handleReject = async (cert: Certificate) => {
    // enforce that a rejection reason is provided
    if (!rejectReason || rejectReason.trim() === '') {
      toast.error('Please enter a rejection reason before rejecting');
      return;
    }

    try {
      const response = await axios.put(`${API_URL}/higher-officer/certificate/status/update/${cert._id}`, {
        status: 'rejected',
        remarks: rejectReason,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        toast.success('Certificate rejected successfully');
        setSelectedCert(null);
        setRejectReason('');
      } else {
        toast.error('Failed to reject certificate');
      }
    } catch (error) {
      toast.error('Failed to reject certificate');
    }
  };

  const pendingCerts = certificatesData.filter(c => c.status.includes('pending'));
  const approvedCerts = certificatesData.filter(c => c.status.includes('approved'));
  const rejectedCerts = certificatesData.filter(c => c.status === 'rejected');

  const displayCerts = filterStatus === 'all' ? certificatesData :
    filterStatus === 'pending' ? pendingCerts :
      filterStatus === 'approved' ? approvedCerts : rejectedCerts;

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
            <h1 className="font-heading text-3xl font-bold mb-2">
              {t('official_dashboard_title')}
            </h1>
            <p className="text-muted-foreground">
              {t('official_certificate_queue')}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card p-6">
              <p className="text-sm text-muted-foreground mb-1">{t('official_total_pending')}</p>
              <p className="text-3xl font-bold text-amber-600">{pendingCerts.length}</p>
            </Card>
            <Card className="glass-card p-6">
              <p className="text-sm text-muted-foreground mb-1">{t('status_approved')}</p>
              <p className="text-3xl font-bold text-accent">{approvedCerts.length}</p>
            </Card>
            <Card className="glass-card p-6">
              <p className="text-sm text-muted-foreground mb-1">{t('status_rejected')}</p>
              <p className="text-3xl font-bold text-destructive">{rejectedCerts.length}</p>
            </Card>
          </div>

          {/* Search & Filter */}
          <Card className="glass-card p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by applicant name or certificate ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)} className="w-full md:w-auto">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </Card>

          {/* Certificates Table */}
          <Card className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">ID</th>
                    <th className="text-left p-4 font-semibold">{t('official_applicant')}</th>
                    <th className="text-left p-4 font-semibold">{t('mycerts_type')}</th>
                    <th className="text-left p-4 font-semibold">{t('mycerts_applied_on')}</th>
                    <th className="text-left p-4 font-semibold">{t('mycerts_status')}</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certificatesData.map((cert) => (
                    <tr key={cert._id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-mono text-sm">{cert._id}</td>
                      <td className="p-4">{cert.applicantName}</td>
                      <td className="p-4">{getCertificateLabel(cert.certificateType)}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(cert.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={cert.status} />
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCert(cert)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {displayCerts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No certificates to display
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </main>

      {/* Review Modal */}
      <Dialog open={!!selectedCert} onOpenChange={(open) => {
        if (!open) {
          setSelectedCert(null);
          setRejectReason('');
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl text-indigo-700 dark:text-indigo-400">
              {selectedCert && getHigherAuthorityStatus(selectedCert) === 'pending'
                ? 'Review Certificate Application'
                : 'Certificate Details'}
            </DialogTitle>
          </DialogHeader>

          {selectedCert && (
            <div className="space-y-6">
              {/* Certificate Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Certificate ID</p>
                  <p className="font-mono font-semibold">{selectedCert._id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-semibold">{getCertificateLabel(selectedCert.certificateType)}</p>
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

              {/* Lower Authority Approval History */}
              {selectedCert.approvalHistory && selectedCert.approvalHistory.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-emerald-700 dark:text-emerald-400">Lower Authority History</h4>
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
                          <span className="text-sm text-muted-foreground">
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

              {/* Mid / Senior Authority Approval History */}
              {selectedCert.seniorapprovalhistory && selectedCert.seniorapprovalhistory.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-amber-700 dark:text-amber-400">Mid Authority History</h4>
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
                          <span className="text-sm text-muted-foreground">
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

              {/* Higher Official Approval History */}
              {selectedCert.higherapprovalhistory && selectedCert.higherapprovalhistory.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-indigo-700 dark:text-indigo-400">Higher Official History</h4>
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
                          <span className="text-sm text-muted-foreground">
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

              {/* Documents */}
              <div>
                <h4 className="font-semibold mb-3">Submitted Documents</h4>
                <div className="grid gap-2">
                  {selectedCert.documentUrl && selectedCert.documentUrl.length > 0 ? (
                    selectedCert.documentUrl.map((url, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Document {idx + 1}</span>
                        <div className="flex gap-2">
                          <a
                            className="btn btn-sm btn-ghost flex items-center hover:text-indigo-600"
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </a>
                          <a
                            className="btn btn-sm btn-ghost flex items-center hover:text-indigo-600"
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

              {/* Action Buttons — only when this authority's decision is still pending */}
              {getHigherAuthorityStatus(selectedCert) === 'pending' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('official_remarks')}</Label>
                    <Textarea
                      placeholder={t('official_remarks_placeholder')}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApprove(selectedCert)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t('official_approve')}
                    </Button>
                    <Button
                      onClick={() => handleReject(selectedCert)}
                      variant="destructive"
                      className="flex-1"
                      disabled={rejectReason.trim() === ''}
                      title={rejectReason.trim() === '' ? 'Enter rejection reason to enable' : 'Reject application'}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {t('official_reject')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
