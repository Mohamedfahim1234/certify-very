import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Smartphone, KeyRound, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length === 10) {
      toast.success('OTP sent to your mobile number!');
      setStep('otp');
    } else {
      toast.error('Please enter a valid 10-digit phone number');
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock OTP verification (accept any 6-digit OTP)
    if (otp.length === 6) {
      login({
        id: '1',
        name: 'Rajesh Kumar',
        phone,
        email: 'rajesh@example.com',
        role: 'citizen',
      });
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error('Please enter a valid 6-digit OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-heading text-3xl font-bold">Citizen Login</h1>
            <p className="text-muted-foreground">
              {step === 'phone' 
                ? 'Enter your mobile number to receive OTP' 
                : 'Enter the 6-digit OTP sent to your mobile'}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className={`h-2 w-16 rounded-full ${step === 'phone' ? 'bg-primary' : 'bg-primary/30'}`} />
            <div className={`h-2 w-16 rounded-full ${step === 'otp' ? 'bg-primary' : 'bg-primary/30'}`} />
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
              <Button type="submit" className="w-full" size="lg">
                Send OTP
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
                <Button type="submit" className="flex-1">
                  Verify & Login
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

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Official Login</p>
            <Button
              variant="outline"
              onClick={() => navigate('/official-login')}
              className="w-full"
            >
              Login as Official
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
