import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShieldAlert, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="glass-card p-12 text-center max-w-md">
          <div className="inline-flex p-6 rounded-full bg-destructive/10 mb-6">
            <ShieldAlert className="h-16 w-16 text-destructive" />
          </div>
          
          <h1 className="font-heading text-4xl font-bold mb-4">
            Access Denied
          </h1>
          
          <p className="text-muted-foreground mb-8">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>

          <Button onClick={() => navigate('/')} size="lg" className="w-full">
            <Home className="h-5 w-5 mr-2" />
            Go to Home
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
