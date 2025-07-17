import { motion } from 'framer-motion';
import { Settings, User, Bell, Palette, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function SettingsPage() {
  return (
    <motion.div
      className="p-4 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.div 
        className="text-center py-8"
        variants={itemVariants}
      >
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4"
          whileHover={{ scale: 1.1, rotate: 90 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Settings className="w-8 h-8 text-white" />
        </motion.div>
        
        <h1 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
          Neural Settings
        </h1>
        <p className="text-cosmic-muted text-lg">
          Customize your ScatterBrainAI experience
        </p>
      </motion.div>

      {/* Settings Sections */}
      <motion.div className="space-y-6" variants={itemVariants}>
        {/* Profile Settings */}
        <Card className="neural-border bg-cosmic-surface/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-cosmic-light">
              <User className="w-5 h-5" />
              <span>Profile Settings</span>
            </CardTitle>
            <CardDescription className="text-cosmic-muted">
              Manage your account and personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cosmic-light font-medium">Public Profile</p>
                <p className="text-sm text-cosmic-muted">Make your profile visible to others</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cosmic-light font-medium">Voice Profile Learning</p>
                <p className="text-sm text-cosmic-muted">Allow AI to learn from your writing style</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="neural-border bg-cosmic-surface/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-cosmic-light">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription className="text-cosmic-muted">
              Control how you receive updates and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cosmic-light font-medium">Trending Alerts</p>
                <p className="text-sm text-cosmic-muted">Get notified about hot topics in your niche</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cosmic-light font-medium">Content Generation</p>
                <p className="text-sm text-cosmic-muted">Updates when your content is ready</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cosmic-light font-medium">Weekly Insights</p>
                <p className="text-sm text-cosmic-muted">Performance summaries and recommendations</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="neural-border bg-cosmic-surface/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-cosmic-light">
              <Palette className="w-5 h-5" />
              <span>Appearance</span>
            </CardTitle>
            <CardDescription className="text-cosmic-muted">
              Customize the look and feel of your workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cosmic-light font-medium">Neural Animations</p>
                <p className="text-sm text-cosmic-muted">Enable smooth transitions and effects</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cosmic-light font-medium">Reduced Motion</p>
                <p className="text-sm text-cosmic-muted">Minimize animations for accessibility</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cosmic-light font-medium">Cosmic Theme</p>
                <p className="text-sm text-cosmic-muted">Deep space visual theme</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="neural-border bg-cosmic-surface/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-cosmic-light">
              <Shield className="w-5 h-5" />
              <span>Privacy & Security</span>
            </CardTitle>
            <CardDescription className="text-cosmic-muted">
              Manage your data and security preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cosmic-light font-medium">Data Analytics</p>
                <p className="text-sm text-cosmic-muted">Help improve our AI with usage data</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cosmic-light font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-cosmic-muted">Add extra security to your account</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="neural-border bg-red-500/10 backdrop-blur-sm border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
            <CardDescription className="text-cosmic-muted">
              Actions that cannot be undone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cosmic-light font-medium">Export Data</p>
                <p className="text-sm text-cosmic-muted">Download all your content and analytics</p>
              </div>
              <Button variant="outline" size="sm">Export</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cosmic-light font-medium">Delete Account</p>
                <p className="text-sm text-cosmic-muted">Permanently remove your account and data</p>
              </div>
              <Button variant="destructive" size="sm">Delete</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}