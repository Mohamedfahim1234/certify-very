import { useEffect, useState } from 'react';
import { CertificateStatus } from '@/contexts/CertificateContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Eye, CheckCircle, XCircle, Search, Download, FileText, Upload, ShieldCheck } from 'lucide-react';
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
}

const getLowerAuthorityStatus = (cert: Certificate): 'pending' | 'approved' | 'rejected' => {
    const lowerApproval = cert.approvalHistory.find(
        (h) => h.level === 'lower' || h.level === 'officer' || h.level === 'final'
    );
    if (lowerApproval) {
        return lowerApproval.action === 'approved' ? 'approved' : 'rejected';
    }
    return 'pending';
};

export default function LowerAuthorityDashboard() {
    const navigate = useNavigate();
    const [certificatesData, setCertificatesData] = useState<Certificate[]>([]);
    const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [activeDocIndex, setActiveDocIndex] = useState(0);
    const { t } = useLanguage();

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    useEffect(() => {
      if (!token) {
        navigate('/login/officer');
      }
    }, [token, navigate]);

    const fetchCertificates = async () => {
        try {
            const response = await axios.get(`${API_URL}/officer/certificates`, {
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
            const response = await axios.put(`${API_URL}/officer/certificate/${cert._id}/status`, {
                status: 'approved',
                remarks: rejectReason || t('remark_lower_approved') || 'Document verified by Lower Level Official'
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                toast.success(t('official_approve_success') || 'Certificate verified successfully');
                fetchCertificates();
                setSelectedCert(null);
                setRejectReason('');
            }
        } catch (error) {
            toast.error(t('official_approve_failed') || 'Failed to verify certificate');
        }
    };

    const handleReject = async (cert: Certificate) => {
        if (!rejectReason || rejectReason.trim() === '') {
            toast.error(t('official_remarks_required') || 'Please enter a rejection reason');
            return;
        }

        try {
            const response = await axios.put(`${API_URL}/officer/certificate/${cert._id}/status`, {
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

    const pendingCerts = filteredBySearch.filter(c => getLowerAuthorityStatus(c) === 'pending');
    const approvedCerts = filteredBySearch.filter(c => getLowerAuthorityStatus(c) === 'approved');
    const rejectedCerts = filteredBySearch.filter(c => getLowerAuthorityStatus(c) === 'rejected');

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
                        <h1 className="font-heading text-3xl font-bold mb-2 text-emerald-700 dark:text-emerald-400">
                            {t('official_dashboard_title')}
                        </h1>
                        <p className="text-muted-foreground">{t('officer_lower_desc')}</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="glass-card p-6 border-l-4 border-amber-500">
                            <p className="text-sm text-muted-foreground mb-1">{t('official_total_pending')}</p>
                            <p className="text-3xl font-bold text-amber-600">{pendingCerts.length}</p>
                        </Card>
                        <Card className="glass-card p-6 border-l-4 border-emerald-500">
                            <p className="text-sm text-muted-foreground mb-1">{t('dashboard_verified')}</p>
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
                                    <TabsTrigger value="approved">{t('table_verified')}</TabsTrigger>
                                    <TabsTrigger value="rejected">{t('status_rejected')}</TabsTrigger>
                                    <TabsTrigger value="all">{t('all')}</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <Button 
                                className="bg-indigo-600 hover:bg-indigo-700 h-10 px-4"
                                onClick={() => navigate('/verify')}
                            >
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Verify External Document
                            </Button>
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
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('mycerts_status')}</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table_actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {displayCerts.map((cert) => {
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
                                                    <StatusBadge status={lowerStatus === 'approved' ? 'verified' : lowerStatus} />
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setSelectedCert(cert)}
                                                    >
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        {lowerStatus === 'pending' ? t('table_verify') : t('table_view')}
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
                    setActiveDocIndex(0);
                }
            }}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                    {/* Minimalist Header */}
                    <div className="px-6 py-4 border-b flex justify-between items-center bg-background/95 backdrop-blur z-10 shrink-0">
                      <div>
                        <DialogTitle className="font-heading text-xl text-emerald-700 dark:text-emerald-400 m-0">
                          {t('modal_review_cert')}
                        </DialogTitle>
                        {selectedCert && (
                          <div className="text-xs text-muted-foreground mt-1 font-mono">{selectedCert.certificateId || selectedCert._id.toUpperCase()}</div>
                        )}
                      </div>
                    </div>

                    {selectedCert && (
                      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                        {/* LEFT COLUMN: PDF Previewer */}
                        <div className="bg-muted/30 border-r relative flex flex-col h-full hidden lg:flex">
                          <div className="h-10 border-b flex items-center justify-between px-4 bg-background/50 shrink-0">
                            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                              <FileText className="h-3 w-3" /> {t('modal_doc_viewer') || 'Document Viewer'}
                            </span>
                            <div className="flex gap-2">
                              {selectedCert.documentUrl?.map((doc, idx) => (
                                <div key={idx} className="flex items-center border rounded-md overflow-hidden bg-background">
                                  <Button 
                                    variant={activeDocIndex === idx ? "secondary" : "ghost"} 
                                    size="sm" 
                                    className={`h-6 text-[10px] px-2 rounded-none ${activeDocIndex === idx ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'hover:bg-muted'}`} 
                                    onClick={() => setActiveDocIndex(idx)}
                                  >
                                    Doc {idx + 1}
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className={`h-6 w-6 rounded-none border-l ${activeDocIndex === idx ? 'border-primary/20' : ''}`} 
                                    onClick={() => window.open(doc, '_blank')} 
                                    title="Open in new tab"
                                  >
                                    <Eye className="h-3 w-3 opacity-70"/>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                          {selectedCert.documentUrl && selectedCert.documentUrl.length > 0 ? (
                            <div className="flex-1 p-2 md:p-4 flex flex-col items-center justify-center relative bg-muted/10">
                              <iframe 
                                src={`${selectedCert.documentUrl[activeDocIndex] || selectedCert.documentUrl[0]}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
                                className="w-full h-full border rounded-lg shadow-sm bg-white"
                                title={`Document Preview ${activeDocIndex + 1}`}
                              />
                            </div>
                          ) : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col">
                              <FileText className="h-12 w-12 mb-2 opacity-20" />
                              <p className="text-sm">{t('modal_doc_unavailable') || 'No Document Available'}</p>
                            </div>
                          )}
                        </div>

                        {/* RIGHT COLUMN: Scrolled Details & Actions */}
                        <div className="overflow-y-auto p-6 lg:p-8 space-y-8 bg-background">
                            
                            {/* Applicant Quick Summary */}
                            <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm bg-emerald-500/5 p-5 rounded-xl border border-emerald-500/20 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{t('mycerts_type')}</p>
                                    <p className="font-medium text-foreground">{t(`cert_${selectedCert.certificateType}`)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{t('table_applicant')}</p>
                                    <p className="font-medium text-foreground">{selectedCert.applicantName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{t('mycerts_applied_on')}</p>
                                    <p className="font-medium text-foreground">{new Date(selectedCert.appliedAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Status</p>
                                    <StatusBadge status={getLowerAuthorityStatus(selectedCert) === 'approved' ? 'verified' : getLowerAuthorityStatus(selectedCert)} />
                                </div>
                            </div>

                            {/* Mobile Document Links (Hidden on LG) */}
                            <div className="lg:hidden">
                                <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">{t('modal_submitted_docs')}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {selectedCert.documentUrl?.map((url, idx) => (
                                        <Button key={idx} variant="outline" size="sm" className="justify-between" onClick={() => window.open(url, '_blank')}>
                                          <span className="truncate max-w-[120px]">{url.split('/').pop()}</span>
                                          <Eye className="h-4 w-4 ml-2 opacity-50" />
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Approval Timeline */}
                            <div>
                                <h4 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wider shrink-0">{t('modal_approval_timeline')}</h4>
                                <div className="space-y-0">
                                  {/* Lower (Self) */}
                                   {(selectedCert.approvalHistory?.length || 0) > 0 ? (
                                     <div className="border-l-2 border-emerald-500/30 ml-2 pl-4 py-2 relative">
                                        <div className="absolute -left-[5px] top-4 bg-emerald-500 w-2 h-2 rounded-full ring-2 ring-background" />
                                        <p className="text-xs font-bold text-foreground">{t('modal_lower_level')}</p>
                                        {selectedCert.approvalHistory.map((h, i) => (
                                          <div key={i} className="mt-1 bg-muted/30 p-2 rounded text-sm">
                                            <div className="flex items-center justify-between mb-1">
                                              <StatusBadge status={h.action === 'approved' ? 'verified' : h.action} />
                                              <span className="text-[10px] text-muted-foreground">{new Date(h.timestamp).toLocaleString()}</span>
                                            </div>
                                            {h.remarks && <p className="text-xs text-muted-foreground">"{h.remarks}"</p>}
                                          </div>
                                        ))}
                                     </div>
                                  ) : (
                                      <p className="text-sm text-muted-foreground italic ml-2">{t('modal_no_history') || 'No approval history available yet.'}</p>
                                  )}
                                </div>
                            </div>

                            {/* Action Area */}
                            {getLowerAuthorityStatus(selectedCert) === 'pending' && (
                                <div className="pt-6 border-t mt-auto space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="remarks" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('official_remarks')} <span className="text-[10px] lowercase normal-case opacity-70">(Required for rejection)</span></Label>
                                        <Textarea
                                            id="remarks"
                                            className="resize-none h-20 text-sm"
                                            placeholder={t('official_remarks_placeholder')}
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Button variant="destructive" size="lg" className="flex-1" onClick={() => handleReject(selectedCert)}>
                                            <XCircle className="h-4 w-4 mr-2" />
                                            {t('official_reject')}
                                        </Button>
                                        <Button size="lg" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApprove(selectedCert)}>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            {t('table_verify')}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                      </div>
                    )}
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
}
