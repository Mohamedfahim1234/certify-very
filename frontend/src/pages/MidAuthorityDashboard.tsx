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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Eye, CheckCircle, XCircle, Search, Download, FileText, Upload } from 'lucide-react';
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
    certificateId?: string;
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

const getMidAuthorityStatus = (cert: Certificate): 'pending' | 'approved' | 'rejected' => {
    if (cert.seniorapprovalhistory && cert.seniorapprovalhistory.length > 0) {
        const seniorApproval = cert.seniorapprovalhistory.find(
            (h) => h.level === 'senior' || h.level === 'mid' || h.level === 'final'
        );
        if (seniorApproval) {
            return seniorApproval.action === 'approved' ? 'approved' : 'rejected';
        }
    }
    return 'pending';
};

const getLowerAuthorityStatus = (cert: Certificate): 'pending' | 'approved' | 'rejected' => {
    if (cert.approvalHistory && cert.approvalHistory.length > 0) {
        const lowerApproval = cert.approvalHistory.find(
            (h) => h.level === 'lower' || h.level === 'officer' || h.level === 'final'
        );
        if (lowerApproval) {
            return lowerApproval.action === 'approved' ? 'approved' : 'rejected';
        }
    }
    return 'pending';
};

export default function MidAuthorityDashboard() {
    const navigate = useNavigate();
    const [certificatesData, setCertificatesData] = useState<Certificate[]>([]);
    const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const { t } = useLanguage();

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    useEffect(() => {
      if (!token) {
        navigate('/officer-login');
      }
    }, [token, navigate]);

    const fetchCertificates = async () => {
        try {
            const response = await axios.get(`${API_URL}/senior-officer/certificates/list`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                const certificate = response.data.certificates;
                const Certificate = Array.isArray(certificate) ? certificate : [];
                setCertificatesData(Certificate);
            }
        } catch (error) {
            console.error('Error fetching certificates:', error);
            toast.error('Failed to fetch certificates');
        }
    };

    useEffect(() => {
        fetchCertificates();
    }, [API_URL, token]);


    const handleApprove = async (cert: Certificate) => {
        try {
            const response = await axios.put(`${API_URL}/senior-officer/certificate/status/update/${cert._id}`, {
                status: 'approved',
                remarks: rejectReason || t('remark_mid_approved') || 'Verified and approved by Mid / Senior Official'
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                toast.success(t('official_approve_success') || 'Certificate approved successfully');
                fetchCertificates();
                setSelectedCert(null);
                setRejectReason('');
            }
        } catch (error) {
            toast.error(t('official_approve_failed') || 'Failed to approve certificate');
        }
    };

    const handleReject = async (cert: Certificate) => {
        if (!rejectReason || rejectReason.trim() === '') {
            toast.error(t('official_remarks_required') || 'Please enter a rejection reason');
            return;
        }

        try {
            const response = await axios.put(`${API_URL}/senior-officer/certificate/status/update/${cert._id}`, {
                status: 'rejected',
                remarks: rejectReason,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                toast.success(t('official_reject_success') || 'Certificate rejected successfully');
                fetchCertificates();
                setSelectedCert(null);
                setRejectReason('');
            }
        } catch (error) {
            toast.error(t('official_reject_failed') || 'Failed to reject certificate');
        }
    };

    const filteredBySearch = certificatesData.filter(c => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return c.applicantName?.toLowerCase().includes(q) || 
               c._id.toLowerCase().includes(q) || 
               c.certificateId?.toLowerCase().includes(q);
    });

    const pendingCerts = filteredBySearch.filter(c => getMidAuthorityStatus(c) === 'pending');
    const approvedCerts = filteredBySearch.filter(c => getMidAuthorityStatus(c) === 'approved');
    const rejectedCerts = filteredBySearch.filter(c => getMidAuthorityStatus(c) === 'rejected');

    const displayCerts = filterStatus === 'all' ? filteredBySearch :
        filterStatus === 'pending' ? pendingCerts :
            filterStatus === 'approved' ? approvedCerts : rejectedCerts;

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
                        <h1 className="font-heading text-3xl font-bold mb-2 text-amber-700 dark:text-amber-400">
                            {t('official_dashboard_title')}
                        </h1>
                        <p className="text-muted-foreground">{t('officer_mid_desc')}</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="glass-card p-6 border-l-4 border-amber-500">
                            <p className="text-sm text-muted-foreground mb-1">{t('official_total_pending')}</p>
                            <p className="text-3xl font-bold text-amber-600">{pendingCerts.length}</p>
                        </Card>
                        <Card className="glass-card p-6 border-l-4 border-emerald-500">
                            <p className="text-sm text-muted-foreground mb-1">{t('dashboard_approved')}</p>
                            <p className="text-3xl font-bold text-emerald-600">{approvedCerts.length}</p>
                        </Card>
                        <Card className="glass-card p-6 border-l-4 border-destructive">
                            <p className="text-sm text-muted-foreground mb-1">{t('status_rejected')}</p>
                            <p className="text-3xl font-bold text-destructive">{rejectedCerts.length}</p>
                        </Card>
                    </div>

                    {/* Search & Filter */}
                    <Card className="glass-card p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder={t('dash_search_placeholder')}
                                    className="w-full pl-10 pr-4 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)} className="w-full md:w-auto">
                                <TabsList>
                                    <TabsTrigger value="pending" className="relative">
                                        {t('status_pending')}
                                        {pendingCerts.length > 0 && (
                                            <span className="ml-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                                                {pendingCerts.length}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger value="approved">{t('status_approved')}</TabsTrigger>
                                    <TabsTrigger value="rejected">{t('status_rejected')}</TabsTrigger>
                                    <TabsTrigger value="all">{t('all')}</TabsTrigger>
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
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table_id')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table_applicant')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('mycerts_type')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('mycerts_applied_on')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('officer_lower')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('mycerts_status')}</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table_actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {displayCerts.map((cert) => {
                                        const midStatus = getMidAuthorityStatus(cert);
                                        const lowerStatus = getLowerAuthorityStatus(cert);
                                        return (
                                            <tr key={cert._id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-mono">{cert.certificateId || cert._id.slice(-8).toUpperCase()}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">{cert.applicantName}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    {t(`cert_${cert.certificateType}`)}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                    {new Date(cert.appliedAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <StatusBadge status={lowerStatus} />
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <StatusBadge status={midStatus} />
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setSelectedCert(cert)}
                                                    >
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        {midStatus === 'pending' ? t('table_review') : t('table_view')}
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {displayCerts.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-1">{t('table_no_certs')}</h3>
                                </div>
                            )}
                        </div>
                    </Card>
                </motion.div>
            </main>

            <Dialog open={!!selectedCert} onOpenChange={(open) => {
                if (!open) {
                    setSelectedCert(null);
                    setRejectReason('');
                }
            }}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-heading text-2xl text-amber-700">
                            {t('modal_review_cert')}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedCert && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">{t('table_id')}</p>
                                    <p className="font-mono font-medium">{selectedCert.certificateId || selectedCert._id}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">{t('mycerts_type')}</p>
                                    <p className="font-medium">{t(`cert_${selectedCert.certificateType}`)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">{t('table_applicant')}</p>
                                    <p className="font-medium">{selectedCert.applicantName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">{t('mycerts_applied_on')}</p>
                                    <p className="font-medium">{new Date(selectedCert.appliedAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* History Sections */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-primary" />
                                    {t('modal_approval_timeline')}
                                </h3>
                                
                                {selectedCert.approvalHistory?.length > 0 && (
                                   <div className="border-l-2 border-primary/20 ml-3 pl-6 space-y-4">
                                      {selectedCert.approvalHistory.map((h, i) => (
                                        <div key={i} className="relative">
                                          <div className="absolute -left-[31px] top-1 bg-primary w-2 h-2 rounded-full" />
                                          <p className="text-sm font-bold">{t('modal_lower_level')}</p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <StatusBadge status={h.action} />
                                            <span className="text-xs text-muted-foreground">{new Date(h.timestamp).toLocaleString()}</span>
                                          </div>
                                          {h.remarks && <p className="text-sm mt-1 text-muted-foreground italic">"{h.remarks}"</p>}
                                        </div>
                                      ))}
                                   </div>
                                )}
                            </div>

                            <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Upload className="h-4 w-4 text-primary" />
                                    {t('modal_submitted_docs')}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {selectedCert.documentUrl?.map((url, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <span className="text-xs font-medium truncate max-w-[150px]">{url.split('/').pop()}</span>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => window.open(url, '_blank')}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                                                    <a href={url} download><Download className="h-4 w-4" /></a>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {getMidAuthorityStatus(selectedCert) === 'pending' && (
                                <div className="pt-4 border-t space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="remarks">{t('official_remarks')}</Label>
                                        <Textarea
                                            id="remarks"
                                            placeholder={t('official_remarks_placeholder')}
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="destructive" className="flex-1" onClick={() => handleReject(selectedCert)}>
                                            <XCircle className="h-4 w-4 mr-2" />
                                            {t('official_reject')}
                                        </Button>
                                        <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={() => handleApprove(selectedCert)}>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            {t('official_approve')}
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
