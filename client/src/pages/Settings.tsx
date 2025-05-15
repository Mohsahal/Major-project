import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Lock, Moon, Palette, Shield, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // Account Settings
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    
    // Notification Settings
    emailNotifications: true,
    jobAlerts: true,
    interviewReminders: true,
    marketingEmails: false,
    
    // Appearance Settings
    darkMode: false,
    compactMode: false,
    
    // Privacy Settings
    profileVisibility: "public",
    showEmail: false,
    showLocation: true,
  });

  const handleSave = (section: string) => {
    // TODO: Implement save functionality with backend
    toast({
      title: "Settings saved",
      description: `Your ${section} settings have been updated.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>

          <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="account">
                <User className="h-4 w-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="appearance">
                <Palette className="h-4 w-4 mr-2" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="privacy">
                <Shield className="h-4 w-4 mr-2" />
                Privacy
              </TabsTrigger>
            </TabsList>

            {/* Account Settings */}
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account information and password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({...settings, email: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={settings.currentPassword}
                        onChange={(e) => setSettings({...settings, currentPassword: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={settings.newPassword}
                        onChange={(e) => setSettings({...settings, newPassword: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={settings.confirmPassword}
                        onChange={(e) => setSettings({...settings, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <Button variant="outline" onClick={logout}>Logout</Button>
                    <Button onClick={() => handleSave("account")}>Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose what notifications you want to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Job Alerts</Label>
                        <p className="text-sm text-gray-500">Get notified about new job opportunities</p>
                      </div>
                      <Switch
                        checked={settings.jobAlerts}
                        onCheckedChange={(checked) => setSettings({...settings, jobAlerts: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Interview Reminders</Label>
                        <p className="text-sm text-gray-500">Receive reminders for upcoming interviews</p>
                      </div>
                      <Switch
                        checked={settings.interviewReminders}
                        onCheckedChange={(checked) => setSettings({...settings, interviewReminders: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Marketing Emails</Label>
                        <p className="text-sm text-gray-500">Receive updates about new features and promotions</p>
                      </div>
                      <Switch
                        checked={settings.marketingEmails}
                        onCheckedChange={(checked) => setSettings({...settings, marketingEmails: checked})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave("notifications")}>Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>Customize how FutureFind looks and feels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Dark Mode</Label>
                        <p className="text-sm text-gray-500">Switch between light and dark themes</p>
                      </div>
                      <Switch
                        checked={settings.darkMode}
                        onCheckedChange={(checked) => setSettings({...settings, darkMode: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Compact Mode</Label>
                        <p className="text-sm text-gray-500">Use a more compact layout</p>
                      </div>
                      <Switch
                        checked={settings.compactMode}
                        onCheckedChange={(checked) => setSettings({...settings, compactMode: checked})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave("appearance")}>Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Manage your privacy preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Profile Visibility</Label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={settings.profileVisibility}
                        onChange={(e) => setSettings({...settings, profileVisibility: e.target.value})}
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="connections">Connections Only</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Email</Label>
                        <p className="text-sm text-gray-500">Display your email on your profile</p>
                      </div>
                      <Switch
                        checked={settings.showEmail}
                        onCheckedChange={(checked) => setSettings({...settings, showEmail: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Location</Label>
                        <p className="text-sm text-gray-500">Display your location on your profile</p>
                      </div>
                      <Switch
                        checked={settings.showLocation}
                        onCheckedChange={(checked) => setSettings({...settings, showLocation: checked})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave("privacy")}>Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 