import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { Smartphone, KeyRound, Shield, Loader2, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext';

export default function UserLoginForm() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaVerified) {
      toast.error(t('login_verify_captcha'));
      return;
    }

    try {
      setLoading(true);
      console.log('Requesting OTP for:', email);
      const response = await axios.post(`${API_URL}/user/request-otp`, { email });
      console.log('OTP Success Response:', response.status, response.data);
      if (response.status === 200) {
        toast.success(t('login_otp_sent'));
        setStep('otp');
      }
    } catch (error: any) {
      console.error('OTP request error:', error);
      
      // Handle axios error specifically
      if (axios.isAxiosError(error) && error.response) {
        console.log('Axios error response status:', error.response.status);
        if (error.response.status === 200) {
          // Sometimes Vite plugins or network proxies wrap a 200 in an error if JSON parsing fails
          toast.success(t('login_otp_sent'));
          setStep('otp');
        } else if (error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
           toast.error(t('login_error'));
        }
      } else if (error?.status === 200) {
          toast.success(t('login_otp_sent'));
          setStep('otp');
      } else {
        toast.error(t('login_error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length === 6) {
      try {
        setLoading(true);
        const response = await axios.post(`${API_URL}/user/login`, { email, otp });
        if (response.status === 200) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('role', response.data.user.role);
          navigate('/dashboard');
          toast.success(t('login_success'));
        } else {
          toast.error(t('login_invalid_otp'));
        }
      } catch (error) {
        toast.error(t('login_error_during'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/user/request-otp`, { email });
      if (response.status === 200) {
        toast.success(t('login_otp_resent'));
      }
    } catch (error: any) {
      if (error?.response?.status === 200 || error?.status === 200) {
        toast.success(t('login_otp_resent'));
      } else {
        toast.error(t('login_error'));
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4 text-white hover:bg-white/10"
        >
          <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: -5 }}
            transition={{ duration: 0.2 }}
            className="flex items-center"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t('login_back_home')}
          </motion.div>
        </Button>

        <Card className="glass-card p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-heading text-3xl font-bold">{t('login_user_title')}</h1>
            <p className="text-muted-foreground">
              {step === 'email'
                ? t('login_enter_email')
                : t('login_enter_otp')}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className={`h-2 w-16 rounded-full transition-colors ${step === 'email' ? 'bg-primary' : 'bg-primary/30'}`} />
            <div className={`h-2 w-16 rounded-full transition-colors ${step === 'otp' ? 'bg-primary' : 'bg-primary/30'}`} />
          </div>

          {step === 'email' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('login_email')}</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('login_email_placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Simulated CAPTCHA */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="captcha"
                    checked={captchaVerified}
                    onCheckedChange={(checked) => setCaptchaVerified(checked as boolean)}
                  />
                  <label
                    htmlFor="captcha"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t('login_captcha')}
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('login_sending_otp')}
                  </>
                ) : (
                  t('login_send_otp')
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">{t('login_enter_otp_label')}</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder={t('login_otp_placeholder')}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="pl-10 text-center text-lg tracking-widest"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep('email');
                    setOtp('');
                  }}
                  className="flex-1"
                >
                  {t('login_back')}
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('login_verifying')}
                    </>
                  ) : (
                    t('login_verify')
                  )}
                </Button>
              </div>

              <Button
                type="button"
                variant="link"
                onClick={handleResendOTP}
                className="w-full text-sm"
                disabled={loading}
              >
                {t('login_resend_otp')}
              </Button>
            </form>
          )}

          <div className="pt-4 text-center text-sm text-muted-foreground border-t space-y-3">
            <div>
              <span className="text-sm">{t('login_no_account')}</span>
              <Button variant="link" onClick={() => navigate('/register')} className="ml-2 text-primary">
                {t('login_register')}
              </Button>
            </div>

            <div className="inline-flex items-center gap-1 text-xs">
              <Shield className="h-3 w-3" />
              {t('login_secure')}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
