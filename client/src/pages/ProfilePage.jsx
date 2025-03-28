
import React from 'react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import ProfileForm from '@/components/auth/ProfileForm';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';

const ProfilePage = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container px-4 py-8 flex-grow">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Account Settings</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <ProfileForm />
          </div>
          <div className="space-y-6">
            <div className="border rounded-lg p-6">
              <h3 className="font-medium mb-4">Account Actions</h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full" disabled>
                  <KeyRound className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={logout}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="border-t py-6">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          © 2023 StockSense. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default ProfilePage;
