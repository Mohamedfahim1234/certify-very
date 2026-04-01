import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { UserPlus, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.replace(/\D/g, '').length !== 10) {
      toast.error(t('register_validation'));
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/user/signup`, { name, phone, email, role: 'citizen' });
      if (response.status === 200) {
        toast.success(t('register_success'));
        navigate('/login/user');
      } else {
        toast.error(t('register_failed'));
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('register_failed');
      console.warn('Register request failed:', msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> {t('login_back_home')}
        </Button>

        <Card className="glass-card p-8 space-y-6">
          <div className="text-center">
            <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
              <UserPlus className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-heading text-3xl font-bold">{t('register_title')}</h1>
            <p className="text-muted-foreground">{t('register_desc')}</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('register_name')}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('register_name_placeholder')} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t('register_phone')}</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder={t('register_phone_placeholder')} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('register_email_optional')}</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('login_email_placeholder')} />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('register_creating') : t('register_create')}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {t('register_already_have')}
            <Button variant="link" onClick={() => navigate('/login/user')} className="ml-2">{t('register_login')}</Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
