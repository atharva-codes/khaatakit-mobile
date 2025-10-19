import { usePreferences } from '@/hooks/usePreferences';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Settings as SettingsIcon, Bell, Smartphone } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const { preferences, loading, updatePreferences } = usePreferences();
  const [phoneNumber, setPhoneNumber] = useState(preferences?.phone_number || '');

  const handlePhoneNumberSave = () => {
    updatePreferences({ phone_number: phoneNumber });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Please sign in to manage your settings</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>
              Manage how you receive alerts and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="app-notifications">App Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive in-app toast notifications
                </p>
              </div>
              <Switch
                id="app-notifications"
                checked={preferences.app_notifications_enabled}
                onCheckedChange={(checked) =>
                  updatePreferences({ app_notifications_enabled: checked })
                }
              />
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-alerts">SMS Alerts</Label>
                  <p className="text-sm text-gray-500">
                    Receive text message notifications (experimental)
                  </p>
                </div>
                <Switch
                  id="sms-alerts"
                  checked={preferences.sms_alerts_enabled}
                  onCheckedChange={(checked) =>
                    updatePreferences({ sms_alerts_enabled: checked })
                  }
                />
              </div>

              {preferences.sms_alerts_enabled && (
                <div className="space-y-2 mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Smartphone className="w-4 h-4 text-gray-600" />
                    <Label htmlFor="phone-number">Phone Number</Label>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="phone-number"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <Button onClick={handlePhoneNumberSave} size="sm">
                      Save
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    SMS alerts are currently in demo mode. Notifications will be logged to console.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>Income notifications:</strong> Alerts when you add income transactions
            </p>
            <p>
              <strong>Expense notifications:</strong> Warnings about spending and expenses
            </p>
            <p>
              <strong>Insight notifications:</strong> Weekly summaries and financial insights
            </p>
            <p>
              <strong>Reminder notifications:</strong> Important reminders and updates
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
