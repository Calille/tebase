import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Lock, Palette, Bell, User, Shield, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { toastDemoAction } from "@/lib/persistence";

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [theme, setTheme] = useState("blue");
  const [notifications, setNotifications] = useState(true);
  const [fontSize, setFontSize] = useState("medium");
  const [themeApplied, setThemeApplied] = useState(false);

  // Define available themes
  const colorThemes = [
    {
      id: "blue",
      name: "Blue",
      description: "Clean and professional blue theme"
    },
    {
      id: "green",
      name: "Green",
      description: "Fresh and natural green theme"
    },
    {
      id: "purple",
      name: "Purple",
      description: "Creative and vibrant purple theme"
    },
    {
      id: "dark",
      name: "Dark",
      description: "Dark mode for reduced eye strain"
    }
  ];

  // Load saved preferences when component mounts
  useEffect(() => {
    const savedTheme = localStorage.getItem("tebase-theme");
    const savedFontSize = localStorage.getItem("tebase-font-size");
    
    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }

    if (user?.name) {
      setAccountName(user.name);
    }
  }, [user]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "New password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await authService.updatePassword(newPassword);
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Password changed",
        description: "Your password has been updated.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not update your password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
    // Theme change is not applied immediately, only when Save Preferences is clicked
  };

  const handleSavePreferences = () => {
    try {
      // Apply font size changes
      document.documentElement.classList.remove(
        "text-size-small",
        "text-size-medium",
        "text-size-large",
      );
      document.documentElement.classList.add(`text-size-${fontSize}`);

      // Apply theme changes - first remove all theme classes
      document.documentElement.classList.remove(
        "theme-blue",
        "theme-green",
        "theme-purple",
        "theme-dark"
      );
      
      // Add the selected theme class
      document.documentElement.classList.add(`theme-${theme}`);

      // Store preferences in localStorage for persistence
      localStorage.setItem("tebase-theme", theme);
      localStorage.setItem("tebase-font-size", fontSize);

      // Show success message
      setThemeApplied(true);
      
      // Create a visual flash effect to indicate theme change
      const flash = document.createElement('div');
      flash.style.position = 'fixed';
      flash.style.top = '0';
      flash.style.left = '0';
      flash.style.width = '100%';
      flash.style.height = '100%';
      flash.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      flash.style.zIndex = '9999';
      flash.style.pointerEvents = 'none';
      flash.style.transition = 'opacity 0.5s ease';
      document.body.appendChild(flash);
      
      // Fade out and remove the flash
      setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(flash);
        }, 500);
      }, 100);
      
      // Show toast notification
      toast({
        title: "Appearance Updated",
        description: "Your theme and font size preferences have been saved.",
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => setThemeApplied(false), 3000);
      
      console.log("Theme applied:", theme, "Font size:", fontSize);
      
      // Force a re-render of components by triggering a window resize event
      window.dispatchEvent(new Event('resize'));
    } catch (error) {
      console.error("Error applying theme:", error);
      toast({
        title: "Error",
        description: "There was a problem applying your theme preferences.",
        variant: "destructive",
      });
    }
  };

  const handleSaveNotifications = () => {
    toastDemoAction("Notification preferences saved");
  };

  // Helper function to get CSS variable values for the theme preview
  const getThemePreviewStyles = (themeId: string) => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    // Apply a temporary class to get the theme's variables
    root.classList.add(`theme-${themeId}`);
    
    // Get the values
    const primary = computedStyle.getPropertyValue('--primary').trim();
    const secondary = computedStyle.getPropertyValue('--secondary').trim();
    const accent = computedStyle.getPropertyValue('--accent').trim();
    const background = computedStyle.getPropertyValue('--background').trim();
    const foreground = computedStyle.getPropertyValue('--foreground').trim();
    const card = computedStyle.getPropertyValue('--card').trim();
    const cardForeground = computedStyle.getPropertyValue('--card-foreground').trim();
    const border = computedStyle.getPropertyValue('--border').trim();
    
    // Remove the temporary class
    root.classList.remove(`theme-${themeId}`);
    
    // Restore the current theme
    root.classList.add(`theme-${theme}`);
    
    return {
      primary,
      secondary,
      accent,
      background,
      foreground,
      card,
      cardForeground,
      border
    };
  };

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={accountName || user?.name || ""}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ""} disabled />
              </div>
              <Button onClick={async () => {
                if (!user) {
                  toastDemoAction("Account updated");
                  return;
                }
                const { error } = await authService.updateProfile(user.id, { name: accountName });
                if (error) {
                  toast({
                    title: "Error",
                    description: error,
                    variant: "destructive",
                  });
                  return;
                }
                await updateProfile({ name: accountName });
                toast({
                  title: "Account updated",
                  description: "Your name has been saved.",
                });
              }}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Color Theme</h3>

                  {/* Color Theme Toggle Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
                    {colorThemes.map((colorTheme) => {
                      const isSelected = theme === colorTheme.id;
                      const isDark = colorTheme.id === "dark";
                      
                      // Get theme colors
                      const styles = getThemePreviewStyles(colorTheme.id);
                      
                      return (
                        <div
                          key={colorTheme.id}
                          className={cn(
                            "relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all",
                            isSelected ? "ring-2 ring-offset-2" : ""
                          )}
                          onClick={() => handleThemeChange(colorTheme.id)}
                          style={{
                            backgroundColor: styles.card,
                            borderColor: styles.border,
                            color: styles.cardForeground,
                            boxShadow: isSelected ? `0 0 0 1px ${styles.primary}` : "none",
                            transform: isSelected ? "translateY(-2px)" : "none",
                            transition: "all 0.2s ease"
                          }}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2" style={{ color: styles.primary }}>
                              <Check className="h-5 w-5" />
                            </div>
                          )}
                          <div className="mb-3">
                            <h4 className="font-medium">{colorTheme.name}</h4>
                            <p className="text-sm opacity-80">
                              {colorTheme.description}
                            </p>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <div
                              className="w-8 h-8 rounded-full border shadow-sm"
                              style={{ backgroundColor: styles.primary }}
                              title="Primary color"
                            ></div>
                            <div
                              className="w-8 h-8 rounded-full border shadow-sm"
                              style={{ backgroundColor: styles.secondary }}
                              title="Secondary color"
                            ></div>
                            <div
                              className="w-8 h-8 rounded-full border shadow-sm"
                              style={{ backgroundColor: styles.accent }}
                              title="Accent color"
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 mb-6">
                  <h3 className="text-lg font-medium mb-4">Theme Preview</h3>
                  <div 
                    className="p-6 rounded-lg border shadow-sm" 
                    style={{
                      backgroundColor: "var(--card)",
                      color: "var(--card-foreground)",
                      borderColor: "var(--border)"
                    }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Preview Header</h4>
                        <div className="flex gap-2">
                          <button 
                            className="px-3 py-1.5 rounded text-sm border transition-colors"
                            style={{ 
                              borderColor: "var(--border)",
                              backgroundColor: "transparent",
                              color: "var(--card-foreground)"
                            }}
                          >
                            Cancel
                          </button>
                          <button 
                            className="px-3 py-1.5 rounded text-sm transition-colors"
                            style={{ 
                              backgroundColor: "var(--primary)",
                              color: "var(--primary-foreground)"
                            }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span style={{ color: "var(--muted-foreground)" }}>
                            Secondary Text
                          </span>
                          <span 
                            style={{ 
                              color: "var(--accent)",
                              fontWeight: "medium"
                            }}
                          >
                            Accent Text
                          </span>
                        </div>
                        
                        <div 
                          className="p-3 rounded-md border"
                          style={{ 
                            borderColor: "var(--border)",
                            backgroundColor: "var(--muted)"
                          }}
                        >
                          <p className="text-sm">
                            This is how content will appear in your selected theme.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: "var(--primary)" }}
                            ></div>
                            <span>Primary</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: "var(--secondary)" }}
                            ></div>
                            <span>Secondary</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: "var(--accent)" }}
                            ></div>
                            <span>Accent</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: "var(--destructive)" }}
                            ></div>
                            <span>Destructive</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-4">
                          <div className="badge-primary px-2 py-1 text-xs rounded-full">Primary Badge</div>
                          <div className="badge-secondary px-2 py-1 text-xs rounded-full">Secondary Badge</div>
                          <div className="badge-accent px-2 py-1 text-xs rounded-full">Accent Badge</div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-4">
                          <div className="bg-success px-2 py-1 text-xs rounded-full">Success</div>
                          <div className="bg-warning px-2 py-1 text-xs rounded-full">Warning</div>
                          <div className="bg-destructive px-2 py-1 text-xs rounded-full">Error</div>
                          <div className="bg-info px-2 py-1 text-xs rounded-full">Info</div>
                        </div>
                        
                        <div className="p-3 mt-4 rounded-md bg-muted">
                          <p className="text-sm">This is text on a muted background.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4">
                        <p className="text-sm font-medium">
                          {colorThemes.find(t => t.id === theme)?.name} Theme
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Font Size</h3>
                  <RadioGroup
                    value={fontSize}
                    onValueChange={setFontSize}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="small" id="small" />
                      <Label htmlFor="small" className="cursor-pointer">
                        Small
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium" className="cursor-pointer">
                        Medium
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="large" id="large" />
                      <Label htmlFor="large" className="cursor-pointer">
                        Large
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center gap-4">
                  <Button 
                    onClick={handleSavePreferences}
                    className="relative overflow-hidden"
                  >
                    {themeApplied ? (
                      <span className="flex items-center">
                        <Check className="mr-2 h-4 w-4" />
                        Applied
                      </span>
                    ) : (
                      "Save Preferences"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important updates
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketing-emails" className="font-medium">
                      Marketing Emails
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about new features and offers
                    </p>
                  </div>
                  <Switch id="marketing-emails" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="update-notifications" className="font-medium">
                      Update Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when the system is updated
                    </p>
                  </div>
                  <Switch id="update-notifications" defaultChecked />
                </div>
                <Button onClick={handleSaveNotifications}>
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <Button type="submit">Change Password</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  );
};

export default Settings;
