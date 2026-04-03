import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import { motion } from 'framer-motion';
import { FileText, Search, MessageCircle, TrendingUp, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext';

interface certificate {
  userId: string;
  certificateType: string;
  aadharUrl: string;
  documentUrl: string;
  status: string;
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [certificates, setCertificates] = useState<certificate[]>([]);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'citizen') {
      console.log('No token or unauthorized role, redirecting to login');
      navigate('/');
      return;
    }

    const getUserData = async () => {
      try {
        const response = await axios.get(`${API_URL}/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          const userData = response.data.user;
          setUser(userData);
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        navigate('/');
      }
    };

    const getCertificatesByUserId = async () => {
      try {
        const response = await axios.get(`${API_URL}/user/certificates`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          const certificates = response.data.certificates;
          const certifi = Array.isArray(certificates) ? certificates : [];
          setCertificates(certifi);
          console.log('Certificates fetched:', certifi);
        }

      } catch (error) {

      }
    }

    getUserData();
    getCertificatesByUserId();
  }, [navigate]);

  const pendingCount = certificates.filter(c => c.status.includes('pending')).length || 0;
  console.log('Pending Count:', pendingCount);
  const approvedCount = certificates.filter(c => c.status.includes('approved')).length || 0;
  console.log('Approved Count:', approvedCount);

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
              {t('dashboard_welcome')} {user?.name}! 👋
            </h1>
            <p className="text-white/90 text-lg">
              {t('dashboard_subtitle')}
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
                  <p className="text-sm text-muted-foreground">{t('dashboard_total')}</p>
                  <p className="text-2xl font-bold">{certificates.length}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/10">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('dashboard_pending')}</p>
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
                  <p className="text-sm text-muted-foreground">{t('dashboard_approved')}</p>
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
                  <h3 className="font-heading font-semibold text-lg mb-1">{t('dashboard_apply')}</h3>
                  <p className="text-sm text-muted-foreground">{t('dashboard_apply_desc')}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6 hover:shadow-xl transition-shadow cursor-pointer group" onClick={() => navigate('/my-certificates')}>
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-lg bg-accent/10 group-hover:bg-accent group-hover:text-white transition-colors">
                  <Search className="h-8 w-8 text-accent group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg mb-1">{t('dashboard_my_certs')}</h3>
                  <p className="text-sm text-muted-foreground">{t('dashboard_my_certs_desc')}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6 hover:shadow-xl transition-shadow cursor-pointer group" onClick={() => navigate('/verify')}>
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <ShieldCheck className="h-8 w-8 text-indigo-600 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg mb-1">{t('nav_verify') || 'Verify Certificate'}</h3>
                  <p className="text-sm text-muted-foreground">Check authenticity via ID or file upload.</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Help Section */}
          <Card className="glass-card p-6 border-l-4 border-l-primary">
            <div className="flex items-start gap-4">
              <MessageCircle className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">{t('dashboard_need_help')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('dashboard_help_desc')}
                </p>
                <Button variant="outline" size="sm">
                  {t('dashboard_open_chatbot')}
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
