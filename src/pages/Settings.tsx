import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Settings as SettingsIcon, Loader2, Bell, Moon, Palette, Globe, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import UserAccountDropdown from '@/components/UserAccountDropdown';

export default function Settings() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      push: false,
      weekly_digest: true,
      trend_alerts: true
    },
    display: {
      theme: 'system',
      compact_mode: false,
      show_tutorials: true
    },
    content: {
      default_tone: 'professional',
      auto_save: true,
      content_language: 'en',
      ai_adaptation: true
    }
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
        .eq('user_id', user?.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setOrganization(profileData.organizations);
        
        // Load preferences from profile
        if (profileData.preferences && typeof profileData.preferences === 'object') {
          const savedPrefs = profileData.preferences as Record<string, any>;
          setPreferences(prev => ({
            notifications: { ...prev.notifications, ...savedPrefs.notifications },
            display: { ...prev.display, ...savedPrefs.display },
            content: { ...prev.content, ...savedPrefs.content }
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const updatePreferences = async (newPreferences: any) => {
    if (!user) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          preferences: newPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setPreferences(newPreferences);
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Update Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePreferenceChange = (category: string, key: string, value: any) => {
    const newPreferences = {
      ...preferences,
      [category]: {
        ...preferences[category as keyof typeof preferences],
        [key]: value
      }
    };
    updatePreferences(newPreferences);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div className="flex items-center space-x-2">
              <SettingsIcon className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Settings</h1>
            </div>
          </div>
          <UserAccountDropdown organization={organization} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Page Header */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Account Settings</h2>
            <p className="text-lg text-muted-foreground">
              Customize your ScatterbrainAI experience and manage your preferences
            </p>
          </div>

          {/* Notifications Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>
                Control how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive important updates and alerts via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.notifications?.email ?? true}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('notifications', 'email', checked)
                  }
                  disabled={isUpdating}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="weekly-digest">Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Get a summary of your content performance and trending topics
                  </p>
                </div>
                <Switch
                  id="weekly-digest"
                  checked={preferences.notifications?.weekly_digest ?? true}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('notifications', 'weekly_digest', checked)
                  }
                  disabled={isUpdating}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="trend-alerts">Trend Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new trending topics match your niches
                  </p>
                </div>
                <Switch
                  id="trend-alerts"
                  checked={preferences.notifications?.trend_alerts ?? true}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('notifications', 'trend_alerts', checked)
                  }
                  disabled={isUpdating}
                />
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Display & Interface</span>
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="theme-select">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred color scheme
                  </p>
                </div>
                <Select
                  value={preferences.display?.theme || 'system'}
                  onValueChange={(value) => 
                    handlePreferenceChange('display', 'theme', value)
                  }
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="compact-mode">Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use a more condensed layout to fit more content
                  </p>
                </div>
                <Switch
                  id="compact-mode"
                  checked={preferences.display?.compact_mode ?? false}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('display', 'compact_mode', checked)
                  }
                  disabled={isUpdating}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-tutorials">Show Tutorials</Label>
                  <p className="text-sm text-muted-foreground">
                    Display helpful tips and guidance throughout the app
                  </p>
                </div>
                <Switch
                  id="show-tutorials"
                  checked={preferences.display?.show_tutorials ?? true}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('display', 'show_tutorials', checked)
                  }
                  disabled={isUpdating}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Content Preferences</span>
              </CardTitle>
              <CardDescription>
                Set defaults for content generation and management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="default-tone">Default Tone</Label>
                  <p className="text-sm text-muted-foreground">
                    The default writing tone for AI-generated content
                  </p>
                </div>
                <Select
                  value={preferences.content?.default_tone || 'professional'}
                  onValueChange={(value) => 
                    handlePreferenceChange('content', 'default_tone', value)
                  }
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="authoritative">Authoritative</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-save">Auto-save Content</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save your work as you type
                  </p>
                </div>
                <Switch
                  id="auto-save"
                  checked={preferences.content?.auto_save ?? true}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('content', 'auto_save', checked)
                  }
                  disabled={isUpdating}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="content-language">Content Language</Label>
                  <p className="text-sm text-muted-foreground">
                    Primary language for content generation
                  </p>
                </div>
                <Select
                  value={preferences.content?.content_language || 'en'}
                  onValueChange={(value) => 
                    handlePreferenceChange('content', 'content_language', value)
                  }
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & AI Training */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Privacy & AI Training</span>
              </CardTitle>
              <CardDescription>
                Understand how we use your data and customize your AI experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Your Privacy is Protected
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  Our AI training is completely internal and personal to you. We never use your thoughts, 
                  content, or data to train large language models or share with external services. 
                  The AI adapts only to your own writing style and preferences.
                </p>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Your thoughts remain completely private</li>
                  <li>• AI learns only from your own input patterns</li>
                  <li>• No data shared with external AI providers</li>
                  <li>• Personal adaptation stays within your account</li>
                </ul>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Personal AI Adaptation</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow the AI to learn from your writing style and preferences for better content generation
                  </p>
                </div>
                <Switch
                  checked={preferences.content?.ai_adaptation ?? true}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('content', 'ai_adaptation', checked)
                  }
                  disabled={isUpdating}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Account Security</span>
              </CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Password</Label>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(user.updated_at || user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Account Email</Label>
                  <p className="text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Update Email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common settings and account management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/profile')}
                  className="flex items-center space-x-2"
                >
                  <span>Edit Profile</span>
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => navigate('/billing')}
                  className="flex items-center space-x-2"
                >
                  <span>Manage Billing</span>
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Support Contact",
                      description: "Opening support email...",
                    });
                    window.open('mailto:support@scatterbrainai.com', '_blank');
                  }}
                  className="flex items-center space-x-2"
                >
                  <span>Contact Support</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}