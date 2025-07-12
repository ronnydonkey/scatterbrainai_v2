import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  CreditCard, 
  Settings, 
  LogOut, 
  ChevronDown,
  Crown
} from 'lucide-react';

interface UserAccountDropdownProps {
  organization?: {
    subscription_tier?: string | null;
  };
}

export default function UserAccountDropdown({ organization }: UserAccountDropdownProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const getTierInfo = (tier?: string | null) => {
    switch (tier) {
      case 'creator':
        return { name: 'Creator', color: 'border-blue-500 text-blue-600 bg-blue-50' };
      case 'professional':
        return { name: 'Professional', color: 'border-purple-500 text-purple-600 bg-purple-50' };
      case 'agency':
        return { name: 'Agency', color: 'border-amber-500 text-amber-600 bg-amber-50' };
      default:
        return { name: 'Free Trial', color: 'border-gray-400 text-gray-600 bg-gray-50' };
    }
  };

  const tierInfo = getTierInfo(organization?.subscription_tier);
  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U';
  const displayName = user?.email?.split('@')[0] || 'User';

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center space-x-3 h-auto p-2 hover:bg-muted/50"
        >
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={undefined} />
              <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-medium text-foreground">
                {displayName}
              </span>
              <Badge 
                variant="outline" 
                className={`text-xs h-5 ${tierInfo.color}`}
              >
                {organization?.subscription_tier === 'agency' && (
                  <Crown className="h-3 w-3 mr-1" />
                )}
                {tierInfo.name}
              </Badge>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-64 p-2 bg-background border shadow-lg z-50"
        align="end"
        sideOffset={8}
      >
        {/* User Info Header */}
        <div className="flex items-center space-x-3 p-2 mb-2 bg-muted/30 rounded-lg">
          <Avatar className="h-10 w-10">
            <AvatarImage src={undefined} />
            <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {displayName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
            <Badge 
              variant="outline" 
              className={`text-xs h-5 mt-1 ${tierInfo.color}`}
            >
              {organization?.subscription_tier === 'agency' && (
                <Crown className="h-3 w-3 mr-1" />
              )}
              {tierInfo.name}
            </Badge>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuItem 
          className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-muted/50 rounded-md"
          onClick={() => handleNavigation('/profile')}
        >
          <User className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Profile</span>
            <span className="text-xs text-muted-foreground">Manage your account</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem 
          className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-muted/50 rounded-md"
          onClick={() => handleNavigation('/billing')}
        >
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Billing</span>
            <span className="text-xs text-muted-foreground">Plans & payments</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem 
          className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-muted/50 rounded-md"
          onClick={() => handleNavigation('/settings')}
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Settings</span>
            <span className="text-xs text-muted-foreground">Preferences & config</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-destructive/10 text-destructive rounded-md"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Sign Out</span>
            <span className="text-xs opacity-70">End your session</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}