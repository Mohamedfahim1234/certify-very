import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { Shield, User, Lock, Eye, EyeOff, Loader2, AlertTriangle, ChevronLeft, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function LowerAuthorityLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (loginAttempts >= 3 && !captchaVerified) {
            toast.error('Please verify CAPTCHA after multiple failed attempts');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/officer/login`, {
                email,
                password,
                authorityLevel: 'lower'
            });

            if (response.status === 200) {
                const official = response.data.user;
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', 'lower');
                localStorage.setItem('authorityLevel', 'lower');
                toast.success(`Welcome back, ${official.username}!`);
                navigate('/official-dashboard/lower');
                return;
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Invalid credentials');
            setLoginAttempts(prev => prev + 1);
            setLoading(false);
            return;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 gradient-hero relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400/5 rounded-full blur-3xl" />
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

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="glass-card p-8 space-y-6 border-emerald-500/20">
                        {/* Header with Lower Authority Badge */}
                        <div className="text-center space-y-2">
                            <div className="relative inline-flex p-4 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 mb-4">
                                <UserCheck className="h-10 w-10 text-emerald-500" />
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-pulse" />
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold mb-2">
                                <Shield className="h-3 w-3" />
                                LOWER AUTHORITY
                            </div>
                            <h1 className="font-heading text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                                Lower Authority Login
                            </h1>
                            <p className="text-muted-foreground">
                                Secure access for field-level verification officers
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Official Email</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your official email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 border-emerald-500/20 focus:border-emerald-500/50"
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
                                        className="pl-10 pr-10 border-emerald-500/20 focus:border-emerald-500/50"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
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
                                    className="bg-emerald-500/10 rounded-lg p-4 space-y-3 border border-emerald-500/20"
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

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                                size="lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="mr-2 h-4 w-4" />
                                        Login as Lower Authority
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Security Warning */}
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-emerald-200">
                                <p className="font-semibold mb-1">Lower Authority Access</p>
                                <p className="text-emerald-200/70">
                                    This portal is for authorized field-level officers only. All activities are monitored and logged.
                                </p>
                            </div>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="text-center">
                            <Button
                                variant="link"
                                onClick={() => navigate('/reset-password')}
                                className="text-sm text-emerald-400 hover:text-emerald-300"
                            >
                                Forgot Password?
                            </Button>
                        </div>

                        {/* Demo Credentials */}
                        <div className="bg-muted/50 rounded-lg p-4 text-sm border border-emerald-500/10">
                            <p className="font-semibold mb-2 text-emerald-400">Demo Credentials:</p>
                            <div className="space-y-1 text-muted-foreground">
                                <p>Email: lower@example.com</p>
                                <p>Password: pass123</p>
                            </div>
                        </div>

                        <div className="pt-4 text-center text-xs text-muted-foreground border-t border-emerald-500/10">
                            <div className="inline-flex items-center gap-2">
                                <Lock className="h-3 w-3 text-emerald-500" />
                                <span>Secure Lower Authority Portal</span>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
