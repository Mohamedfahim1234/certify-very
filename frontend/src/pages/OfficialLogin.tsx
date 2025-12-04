import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const mockOfficials = {
  'officer1': { password: 'pass123', name: 'Amit Sharma', role: 'officer' as const },
  'senior1': { password: 'pass123', name: 'Priya Singh', role: 'senior' as const },
  'higher1': { password: 'pass123', name: 'Dr. Rajiv Mehta', role: 'higher' as const },
};

export default function OfficialLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
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
      toast.error('Invalid credentials');
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
            <div className="inline-flex p-4 rounded-full bg-accent/10 mb-4">
              <ShieldCheck className="h-10 w-10 text-accent" />
            </div>
            <h1 className="font-heading text-3xl font-bold">Official Login</h1>
            <p className="text-muted-foreground">
              Secure access for verification officers
            </p>
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
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Login
            </Button>
          </form>

          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-muted-foreground">
              <p>Officer: officer1 / pass123</p>
              <p>Senior: senior1 / pass123</p>
              <p>Higher: higher1 / pass123</p>
            </div>
          </div>

          <div className="text-center pt-4 border-t">
            <Button
              variant="link"
              onClick={() => navigate('/login')}
              className="text-sm"
            >
              ← Back to Citizen Login
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
