import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, User, ChevronLeft } from 'lucide-react';
import UserLoginForm from '@/components/auth/UserLoginForm';
import OfficerLoginForm from '@/components/auth/OfficerLoginForm';

type LoginView = 'selector' | 'user' | 'officer';

export default function LoginSelector() {
  const [view, setView] = useState<LoginView>('selector');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          {view === 'selector' && (
            <motion.div
              key="selector"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-card p-8 space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                    <Shield className="h-12 w-12 text-primary" />
                  </div>
                  <h1 className="font-heading text-2xl font-bold">
                    AI Powered Certificate Registration and Verification System
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Choose your login type to continue
                  </p>
                </div>

                {/* Login Options */}
                <div className="space-y-4 pt-4">
                  <Button
                    size="lg"
                    onClick={() => setView('user')}
                    className="w-full h-16 text-lg group"
                  >
                    <User className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                    User Login
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setView('officer')}
                    className="w-full h-16 text-lg group border-2"
                  >
                    <Shield className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                    Officer Login
                  </Button>
                </div>

                {/* Footer */}
                <div className="pt-6 text-center text-xs text-muted-foreground border-t">
                  © 2025 AI Powered Certificate Registration and Verification System
                  <br />
                  <span className="inline-flex items-center gap-1 mt-1">
                    <Shield className="h-3 w-3" />
                    Secured Portal
                  </span>
                </div>
              </Card>
            </motion.div>
          )}

          {view === 'user' && (
            <motion.div
              key="user"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="ghost"
                onClick={() => setView('selector')}
                className="mb-4 text-white hover:bg-white/10"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Login Options
              </Button>
              <UserLoginForm />
            </motion.div>
          )}

          {view === 'officer' && (
            <motion.div
              key="officer"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="ghost"
                onClick={() => setView('selector')}
                className="mb-4 text-white hover:bg-white/10"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Login Options
              </Button>
              <OfficerLoginForm />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
