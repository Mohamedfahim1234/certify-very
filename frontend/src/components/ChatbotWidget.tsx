import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, RotateCcw, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const predefinedResponses: Record<string, string> = {
  'How to Apply?': 'To apply for a certificate, click on "Apply Certificate" from your dashboard, select the certificate type you need, upload all required documents, and submit your application. You will receive updates on each verification stage.',
  'Steps of Verification': 'Your application goes through three verification stages:\n1. Officer Review - Initial document verification\n2. Senior Officer - Secondary approval\n3. Higher Official - Final verification and approval\nYou can track the status at each stage from "My Certificates" page.',
  'Required Documents': 'Required documents vary by certificate type:\n• Birth Certificate: Hospital records, Parent IDs\n• Marriage Certificate: Both applicants\' IDs, witness details\n• Death Certificate: Hospital records, family member ID\n• Income Certificate: Salary slips, bank statements\n\nAll documents must be clear scans or photos.',
  'Track My Application': 'You can track your application status from the "My Certificates" page. Each application shows its current stage:\n• Submitted - Awaiting officer review\n• Under Review - Being verified\n• Approved - Verification complete\n• Rejected - Requires resubmission',
  'Website Help': 'Navigation Guide:\n• Dashboard - Overview of your applications\n• Apply Certificate - Submit new application\n• My Certificates - View all your certificates\n• Profile - Update your information\n\nNeed more help? Each page has helpful tooltips and guides.',
};

export default function ChatbotWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your Certificate Assistant 🤖. I can guide you on applying, checking status, or understanding each step. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);

  // Only show for logged-in citizens
  if (!user || user.role !== 'citizen') return null;

  const handleQuickReply = (reply: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: reply,
      sender: 'user',
      timestamp: new Date(),
    };

    // Add bot response
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: predefinedResponses[reply] || "I'm here to help! Please select one of the quick options below.",
      sender: 'bot',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        text: "Hi! I'm your Certificate Assistant 🤖. I can guide you on applying, checking status, or understanding each step. How can I help you today?",
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  };

  const quickReplies = [
    'How to Apply?',
    'Steps of Verification',
    'Required Documents',
    'Track My Application',
    'Website Help',
  ];

  return (
    <>
      {/* Floating Chat Icon */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 animate-pulse-glow"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
          >
            <Card className="glass-card shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  <h3 className="font-semibold">Certificate Assistant 🤖</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearChat}
                    className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="h-96 p-4 bg-background">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>

              {/* Quick Replies */}
              <div className="p-4 bg-muted/50 border-t">
                <p className="text-xs text-muted-foreground mb-2">Quick Options:</p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply) => (
                    <Button
                      key={reply}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickReply(reply)}
                      className="text-xs"
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
