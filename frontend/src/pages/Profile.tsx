import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { motion } from 'framer-motion';
import { User, Mail, Phone, LogOut, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser ] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/');
    } else {
      const getUserData = async () => {
        try {
          const role = localStorage.getItem('role');
          const profilePath = (role === 'officer' || role === 'senior') ? '/officer/profile' : '/user/profile';

          const response = await axios.get(`${API_URL}${profilePath}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.status === 200) {
            const userData = response.data.user || response.data.officer || response.data;
            setUser(userData);
            const role = localStorage.getItem('role');
            const isOfficer = role === 'officer' || role === 'senior';
            // officers use `username`, regular users use `name`
            setName(isOfficer ? (userData?.username || userData?.name || '') : (userData?.name || ''));
            setEmail(userData?.email || '');
          } else {
            navigate('/');
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          navigate('/');
        }
      };

      getUserData();
    }
  }, [navigate]);

<<<<<<< HEAD
  const handleSave = async() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/');
    } else {
        try {
          const role = localStorage.getItem('role');
          const profilePath = (role === 'officer' || role === 'senior') ? '/officer/profile/update' : '/user/profile/update';

          const response = await axios.put(`${API_URL}${profilePath}`,{
            name,
            email
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.status === 200) {
            toast.success('Profile updated successfully!');
          } else {
            navigate('/');
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          navigate('/');
        }
      };
=======
  const handleSave = () => {
    // In a real app, this would update the user in the backend
    toast.success('Profile updated successfully!');
>>>>>>> 7838adc785a33e341f72dc1ae2b937a4133b55c9
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your account information
            </p>
          </div>

          <Card className="glass-card p-6 space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold">
                {(name ? name.charAt(0) : '').toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{name || user?.username || user?.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {user?.role === 'citizen' ? 'Citizen' : 
                   user?.role === 'officer' ? 'Verifying Officer' :
                   user?.role === 'senior' ? 'Senior Officer' : 'Higher Official'}
                </p>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Profile Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {user?.phone && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={user.phone}
                      disabled
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Phone number cannot be changed
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <Button onClick={handleSave} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="glass-card p-6 border-destructive/50">
            <h3 className="font-semibold text-lg mb-4 text-destructive">Danger Zone</h3>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be logged out of your account and redirected to the login page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Card>
        </motion.div>
      </main>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
