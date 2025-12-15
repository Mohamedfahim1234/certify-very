import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
<<<<<<< HEAD
import { MessageCircle, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import axios from 'axios'
=======
import { MessageCircle, X, RotateCcw, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
>>>>>>> 7838adc785a33e341f72dc1ae2b937a4133b55c9

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

<<<<<<< HEAD
const API_URL = import.meta.env.VITE_API_URL;

const token = localStorage.getItem('token');

const askRagAPI = async (query: string) => {
  const res = await axios.post(`${API_URL}/user/ask`,{ query, topk: 2}, {
    headers:{
      Authorization: `Bearer ${token}`
    }
  });

    console.log(res.data);
    return res.data;
=======
const predefinedResponses: Record<string, string> = {
  'How to Apply?': 'To apply for a certificate, click on "Apply Certificate" from your dashboard, select the certificate type you need, upload all required documents, and submit your application. You will receive updates on each verification stage.',
  'Steps of Verification': 'Your application goes through three verification stages:\n1. Officer Review - Initial document verification\n2. Senior Officer - Secondary approval\n3. Higher Official - Final verification and approval\nYou can track the status at each stage from "My Certificates" page.',
  'Required Documents': 'Required documents vary by certificate type:\n• Birth Certificate: Hospital records, Parent IDs\n• Marriage Certificate: Both applicants\' IDs, witness details\n• Death Certificate: Hospital records, family member ID\n• Income Certificate: Salary slips, bank statements\n\nAll documents must be clear scans or photos.',
  'Track My Application': 'You can track your application status from the "My Certificates" page. Each application shows its current stage:\n• Submitted - Awaiting officer review\n• Under Review - Being verified\n• Approved - Verification complete\n• Rejected - Requires resubmission',
  'Website Help': 'Navigation Guide:\n• Dashboard - Overview of your applications\n• Apply Certificate - Submit new application\n• My Certificates - View all your certificates\n• Profile - Update your information\n\nNeed more help? Each page has helpful tooltips and guides.',
>>>>>>> 7838adc785a33e341f72dc1ae2b937a4133b55c9
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your Certificate Assistant 🤖. I can guide you on applying, checking status, or understanding each step. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);

  const user = localStorage.getItem('role');
<<<<<<< HEAD
  if (!user || user !== 'citizen') return null;

  // 🔹 Handle quick reply click
  const handleQuickReply = async (reply: string) => {
=======
  // Only show for logged-in citizens
  if (!user || user !== 'citizen') return null;

  const handleQuickReply = (reply: string) => {
    // Add user message
>>>>>>> 7838adc785a33e341f72dc1ae2b937a4133b55c9
    const userMessage: Message = {
      id: Date.now().toString(),
      text: reply,
      sender: 'user',
      timestamp: new Date(),
    };

<<<<<<< HEAD
    setMessages((prev) => [...prev, userMessage]);

    const loadingId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        text: 'Thinking...',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);

    try {
      const data = await askRagAPI(reply);

      let botText = "Sorry, we don't have information related to this.";

      if (data?.result?.length) {
        botText = data.result.map((r: any) => r.text).join('\n\n');
      } else if (data?.message) {
        botText = data.message;
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? { ...msg, text: botText, timestamp: new Date() }
            : msg
        )
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                ...msg,
                text: 'Server error. Please try again later.',
                timestamp: new Date(),
              }
            : msg
        )
      );
    }
=======
    // Add bot response
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: predefinedResponses[reply] || "I'm here to help! Please select one of the quick options below.",
      sender: 'bot',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
>>>>>>> 7838adc785a33e341f72dc1ae2b937a4133b55c9
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
<<<<<<< HEAD
                      className={`flex ${
                        message.sender === 'user'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
=======
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
>>>>>>> 7838adc785a33e341f72dc1ae2b937a4133b55c9
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
<<<<<<< HEAD
                        <p className="text-sm whitespace-pre-line">
                          {message.text}
                        </p>
=======
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
>>>>>>> 7838adc785a33e341f72dc1ae2b937a4133b55c9
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
<<<<<<< HEAD
                <p className="text-xs text-muted-foreground mb-2">
                  Quick Options:
                </p>
=======
                <p className="text-xs text-muted-foreground mb-2">Quick Options:</p>
>>>>>>> 7838adc785a33e341f72dc1ae2b937a4133b55c9
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
