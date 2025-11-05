import { useAuth } from '@/contexts/AuthContext';
import { useCertificates } from '@/contexts/CertificateContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import { motion } from 'framer-motion';
import { FileText, Search, MessageCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { getCertificatesByUserId } = useCertificates();
  const navigate = useNavigate();

  const userCertificates = user ? getCertificatesByUserId(user.id) : [];
  const pendingCount = userCertificates.filter(c => c.status.includes('pending')).length;
  const approvedCount = userCertificates.filter(c => c.status.includes('approved')).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Welcome Section */}
          <div className="glass-card p-8 gradient-primary text-white rounded-2xl">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-white/90 text-lg">
              Apply for your certificates securely and track them in real time
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold">{userCertificates.length}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/10">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Search className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{approvedCount}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card p-6 hover:shadow-xl transition-shadow cursor-pointer group" onClick={() => navigate('/apply')}>
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">
                  <FileText className="h-8 w-8 text-primary group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg mb-1">Apply for Certificate</h3>
                  <p className="text-sm text-muted-foreground">Submit a new certificate application</p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6 hover:shadow-xl transition-shadow cursor-pointer group" onClick={() => navigate('/my-certificates')}>
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-lg bg-accent/10 group-hover:bg-accent group-hover:text-white transition-colors">
                  <Search className="h-8 w-8 text-accent group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg mb-1">My Certificates</h3>
                  <p className="text-sm text-muted-foreground">Track your application status</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Help Section */}
          <Card className="glass-card p-6 border-l-4 border-l-primary">
            <div className="flex items-start gap-4">
              <MessageCircle className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Need Help?</h3>
                <p className="text-muted-foreground mb-4">
                  Our Certificate Assistant is here to help you with any questions about the application process.
                </p>
                <Button variant="outline" size="sm">
                  Open Chatbot
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
