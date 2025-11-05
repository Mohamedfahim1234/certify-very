import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Lock, Eye, EyeOff, Loader2, AlertTriangle, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const mockOfficials = {
  'officer1': { password: 'pass123', name: 'Amit Sharma', role: 'officer' as const },
  'senior1': { password: 'pass123', name: 'Priya Singh', role: 'senior' as const },
  'higher1': { password: 'pass123', name: 'Dr. Rajiv Mehta', role: 'higher' as const },
};

export default function OfficerLoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (loginAttempts >= 3 && !captchaVerified) {
      toast.error('Please verify CAPTCHA after multiple failed attempts');
      return;
    }

    setLoading(true);

    // Simulate login delay
    setTimeout(() => {
      const official = mockOfficials[username as keyof typeof mockOfficials];

      if (official && official.password === password) {
        login({
          id: username,
          name: official.name,
          role: official.role,
        });
        toast.success(`Welcome back, ${official.name}!`);
        navigate('/official-dashboard');
      } else {
        setLoginAttempts((prev) => prev + 1);
        toast.error('Invalid credentials');
        setLoading(false);
      }
    }, 1000);
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
        <div className="inline-flex p-4 rounded-full bg-accent/10 mb-4">
          <ShieldCheck className="h-10 w-10 text-accent" />
        </div>
        <h1 className="font-heading text-3xl font-bold">Officer Login</h1>
        <p className="text-muted-foreground">Secure access for verification officers</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* CAPTCHA after failed attempts */}
        {loginAttempts >= 3 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-muted/50 rounded-lg p-4 space-y-3"
          >
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
          </motion.div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            'Login as Officer'
          )}
        </Button>
      </form>

      {/* Security Warning */}
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <p className="text-sm text-destructive">
          ⚠ Authorized Officers Only. All actions are logged and monitored.
        </p>
      </div>

      {/* Forgot Password Link */}
      <div className="text-center">
        <Button
          variant="link"
          onClick={() => navigate('/reset-password')}
          className="text-sm"
        >
          Forgot Password?
        </Button>
      </div>

      {/* Demo Credentials */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <p className="font-semibold mb-2">Demo Credentials:</p>
        <div className="space-y-1 text-muted-foreground">
          <p>Officer: officer1 / pass123</p>
          <p>Senior: senior1 / pass123</p>
          <p>Higher: higher1 / pass123</p>
        </div>
      </div>

          <div className="pt-4 text-center text-xs text-muted-foreground border-t">
            <div className="inline-flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Secure Login
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
