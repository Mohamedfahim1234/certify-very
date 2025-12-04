import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { FileCheck, Shield, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/');
    const role = localStorage.getItem('role');
      if (role === 'citizen') {
        navigate('/dashboard');
      } else {
        console.log('Navigating to official dashboard');
        navigate('/official-dashboard');
      }
  }, [navigate]);

  const features = [
    {
      icon: Shield,
      title: 'Secure & Verified',
      description: 'Multi-level verification ensures authenticity of all certificates'
    },
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Track your application in real-time through our streamlined workflow'
    },
    {
      icon: FileCheck,
      title: 'Digital Records',
      description: 'All your certificates stored securely and accessible anytime'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex p-4 rounded-full bg-white/10 backdrop-blur-sm mb-6">
              <FileCheck className="h-16 w-16" />
            </div>
            
            <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6">
              CertifyGov
            </h1>
            
            <p className="text-xl md:text-2xl mb-4 text-white/90">
              AI-Powered Certificate Registration & Verification System
            </p>
            
            <p className="text-lg mb-12 text-white/80 max-w-2xl mx-auto">
              Apply for government certificates securely and track them in real-time. 
              A modern e-governance solution for citizens and officials.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/login/user')}
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 font-semibold"
              >
                Citizen Login
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                onClick={() => navigate('/login/officer')}
                className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-6 font-semibold transition-all"
              >
                Official Login
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl font-bold mb-4">
              Why Choose CertifyGov?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A comprehensive platform designed for efficient certificate management
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card p-8 text-center hover:shadow-2xl transition-shadow h-full">
                  <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certificate Types Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl font-bold mb-4">
              Available Certificates
            </h2>
            <p className="text-muted-foreground text-lg">
              Apply for various government certificates online
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {['Caste Certificate', 'Income Certificate', 'Domicile Certificate', 'Marriage Certificate', 'Birth Certificate'].map((cert, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="glass-card p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="font-medium">{cert}</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of citizens who trust CertifyGov for their certificate needs
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/login/user')}
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6"
            >
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 CertifyGov. AI-Powered Certificate System.</p>
          <p className="text-sm mt-2">Developed as part of academic project</p>
        </div>
      </footer>
    </div>
  );
}
