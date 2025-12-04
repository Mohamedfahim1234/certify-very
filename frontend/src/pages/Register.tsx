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

export default function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.replace(/\D/g, '').length !== 10) {
      toast.error('Please provide a name and a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/user/signup`, { name, phone, email, role: 'citizen' });
      if(response.status == 200){
      toast.success('Registration successful! Please login.');
      navigate('/login/user');
      }else{
      toast.error('Registration failed. Please try again.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Unable to register via backend. You can still login.';
      console.warn('Register request failed (this may be expected in frontend-only flow):', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>

        <Card className="glass-card p-8 space-y-6">
          <div className="text-center">
            <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
              <UserPlus className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-heading text-3xl font-bold">Create Account</h1>
            <p className="text-muted-foreground">Register as a citizen to apply for certificates</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile number" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?
            <Button variant="link" onClick={() => navigate('/login/user')} className="ml-2">Login</Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
