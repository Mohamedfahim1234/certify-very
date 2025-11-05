import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCertificates, Certificate, CertificateStatus } from '@/contexts/CertificateContext';
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

export default function OfficialDashboard() {
  const { user } = useAuth();
  const { certificates, updateCertificateStatus } = useCertificates();
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Determine which certificates this officer should see
  const getRelevantCertificates = () => {
    let relevantStatuses: CertificateStatus[] = [];
    
    if (user?.role === 'officer') {
      relevantStatuses = ['pending_officer', 'approved_officer', 'rejected'];
    } else if (user?.role === 'senior') {
      relevantStatuses = ['pending_senior', 'approved_senior', 'rejected'];
    } else if (user?.role === 'higher') {
      relevantStatuses = ['pending_higher', 'approved_higher', 'rejected'];
    }

    return certificates.filter(cert => 
      relevantStatuses.includes(cert.status) &&
      (searchQuery === '' || 
        cert.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const handleApprove = (cert: Certificate) => {
    if (!user) return;

    let newStatus: CertificateStatus;
    if (user.role === 'officer') {
      newStatus = 'pending_senior';
    } else if (user.role === 'senior') {
      newStatus = 'pending_higher';
    } else {
      newStatus = 'approved_higher';
    }

    updateCertificateStatus(cert.id, newStatus, user.name);
    toast.success(`Certificate ${cert.id} approved successfully!`);
    setSelectedCert(null);
  };

  const handleReject = (cert: Certificate) => {
    if (!user || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    updateCertificateStatus(cert.id, 'rejected', user.name, rejectReason);
    toast.success(`Certificate ${cert.id} rejected`);
    setSelectedCert(null);
    setRejectReason('');
  };

  const relevantCerts = getRelevantCertificates();

  const pendingCerts = relevantCerts.filter(c => c.status.includes('pending'));
  const approvedCerts = relevantCerts.filter(c => c.status.includes('approved'));
  const rejectedCerts = relevantCerts.filter(c => c.status === 'rejected');

  const displayCerts = filterStatus === 'all' ? relevantCerts :
    filterStatus === 'pending' ? pendingCerts :
    filterStatus === 'approved' ? approvedCerts : rejectedCerts;

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
            <h1 className="font-heading text-3xl font-bold mb-2">
              {user?.role === 'officer' ? 'Verifying Officer' : 
               user?.role === 'senior' ? 'Senior Officer' : 
               'Higher Official'} Dashboard
            </h1>
            <p className="text-muted-foreground">
              Review and approve certificate applications
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card p-6">
              <p className="text-sm text-muted-foreground mb-1">Pending Review</p>
              <p className="text-3xl font-bold text-amber-600">{pendingCerts.length}</p>
            </Card>
            <Card className="glass-card p-6">
              <p className="text-sm text-muted-foreground mb-1">Approved</p>
              <p className="text-3xl font-bold text-accent">{approvedCerts.length}</p>
            </Card>
            <Card className="glass-card p-6">
              <p className="text-sm text-muted-foreground mb-1">Rejected</p>
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
                    <th className="text-left p-4 font-semibold">Certificate ID</th>
                    <th className="text-left p-4 font-semibold">Applicant</th>
                    <th className="text-left p-4 font-semibold">Type</th>
                    <th className="text-left p-4 font-semibold">Date</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayCerts.map((cert) => (
                    <tr key={cert.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-mono text-sm">{cert.id}</td>
                      <td className="p-4">{cert.applicantName}</td>
                      <td className="p-4">{getCertificateLabel(cert.type)}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(cert.submittedDate).toLocaleDateString()}
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
      <Dialog open={!!selectedCert} onOpenChange={() => {
        setSelectedCert(null);
        setRejectReason('');
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">
              Review Certificate Application
            </DialogTitle>
          </DialogHeader>

          {selectedCert && (
            <div className="space-y-6">
              {/* Certificate Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Certificate ID</p>
                  <p className="font-mono font-semibold">{selectedCert.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-semibold">{getCertificateLabel(selectedCert.type)}</p>
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
                <h4 className="font-semibold mb-3">Submitted Documents</h4>
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

              {/* Previous Approvals */}
              {selectedCert.approvalHistory.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Previous Approvals</h4>
                  <div className="space-y-2">
                    {selectedCert.approvalHistory.map((entry, idx) => (
                      <div key={idx} className="p-3 bg-muted/50 rounded-lg text-sm">
                        <p className="font-semibold">{entry.level}</p>
                        <p className="text-muted-foreground">
                          {entry.action === 'approved' ? 'Approved' : 'Rejected'} by {entry.officer}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection Form */}
              {selectedCert.status.includes('pending') && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rejection Reason (optional)</Label>
                    <Textarea
                      placeholder="Enter reason for rejection..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApprove(selectedCert)}
                      className="flex-1 bg-accent hover:bg-accent/90"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(selectedCert)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
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
