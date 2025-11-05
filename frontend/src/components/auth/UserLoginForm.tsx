import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { Smartphone, KeyRound, Shield, Loader2, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserLoginForm() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captchaVerified) {
      toast.error('Please verify CAPTCHA');
      return;
    }

    if (phone.length === 10) {
      setLoading(true);
      // Simulate OTP sending
      setTimeout(() => {
        toast.success('OTP sent to your mobile number!');
        setStep('otp');
        setLoading(false);
      }, 1000);
    } else {
      toast.error('Please enter a valid 10-digit phone number');
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length === 6) {
      setLoading(true);
      // Simulate verification
      setTimeout(() => {
        login({
          id: '1',
          name: 'Rajesh Kumar',
          phone,
          email: 'rajesh@example.com',
          role: 'citizen',
        });
        toast.success('Login successful!');
        navigate('/dashboard');
      }, 1000);
    } else {
      toast.error('Please enter a valid 6-digit OTP');
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
            Back to Home
          </motion.div>
        </Button>

        <Card className="glass-card p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
          <Shield className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-heading text-3xl font-bold">User Login</h1>
        <p className="text-muted-foreground">
          {step === 'phone'
            ? 'Enter your mobile number to receive OTP'
            : 'Enter the 6-digit OTP sent to your mobile'}
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        <div className={`h-2 w-16 rounded-full transition-colors ${step === 'phone' ? 'bg-primary' : 'bg-primary/30'}`} />
        <div className={`h-2 w-16 rounded-full transition-colors ${step === 'otp' ? 'bg-primary' : 'bg-primary/30'}`} />
      </div>

      {step === 'phone' ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number</Label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
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
                I'm not a robot
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending OTP...
              </>
            ) : (
              'Send OTP'
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Enter OTP</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="otp"
                type="text"
                placeholder="6-digit OTP"
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
                setStep('phone');
                setOtp('');
              }}
              className="flex-1"
            >
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Login'
              )}
            </Button>
          </div>

          <Button
            type="button"
            variant="link"
            onClick={() => toast.success('OTP resent!')}
            className="w-full text-sm"
          >
            Resend OTP
          </Button>
        </form>
      )}

          <div className="pt-4 text-center text-xs text-muted-foreground border-t">
            <div className="inline-flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Secure Login
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
