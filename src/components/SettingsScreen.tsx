import { useState, useEffect } from 'react';
import { Settings, Bell, MessageSquare, DollarSign, Save, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase, NotificationSettings } from '@/lib/supabase';

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [localSettings, setLocalSettings] = useState({
    app_notifications_enabled: true,
    sms_alerts_enabled: false,
    phone_number: '',
    notify_on_income: true,
    notify_on_expense: true,
    notify_on_insights: true,
    notify_on_reminders: true,
    expense_threshold: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const savedSettings = localStorage.getItem('khaataKitab_notification_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setLocalSettings(parsed);
      }
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setSettings(data);
      setLocalSettings({
        app_notifications_enabled: data.app_notifications_enabled,
        sms_alerts_enabled: data.sms_alerts_enabled,
        phone_number: data.phone_number || '',
        notify_on_income: data.notify_on_income,
        notify_on_expense: data.notify_on_expense,
        notify_on_insights: data.notify_on_insights,
        notify_on_reminders: data.notify_on_reminders,
        expense_threshold: data.expense_threshold?.toString() || '',
      });
    } else if (!error) {
      const { data: newSettings } = await supabase
        .from('notification_settings')
        .insert({
          user_id: user.id,
        })
        .select()
        .single();

      if (newSettings) {
        setSettings(newSettings);
      }
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      localStorage.setItem('khaataKitab_notification_settings', JSON.stringify(localSettings));
      toast.success('Settings saved', {
        description: 'Your notification preferences have been updated',
      });
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('notification_settings')
      .update({
        app_notifications_enabled: localSettings.app_notifications_enabled,
        sms_alerts_enabled: localSettings.sms_alerts_enabled,
        phone_number: localSettings.phone_number || null,
        notify_on_income: localSettings.notify_on_income,
        notify_on_expense: localSettings.notify_on_expense,
        notify_on_insights: localSettings.notify_on_insights,
        notify_on_reminders: localSettings.notify_on_reminders,
        expense_threshold: localSettings.expense_threshold ? parseFloat(localSettings.expense_threshold) : null,
      })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to save settings', {
        description: error.message,
      });
    } else {
      toast.success('Settings saved', {
        description: 'Your notification preferences have been updated',
      });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <div className="p-4">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Loading settings...</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-4">
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Notification Settings
            </h1>
            <p className="text-sm opacity-90">Manage your alert preferences</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">App Notifications</h3>
                <p className="text-xs text-muted-foreground">
                  Show in-app toast notifications
                </p>
              </div>
            </div>
            <Switch
              checked={localSettings.app_notifications_enabled}
              onCheckedChange={(checked) =>
                setLocalSettings({ ...localSettings, app_notifications_enabled: checked })
              }
            />
          </div>
        </Card>

        <Card className="p-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">SMS Alerts</h3>
                  <p className="text-xs text-muted-foreground">
                    Receive SMS notifications (requires Twilio setup)
                  </p>
                </div>
              </div>
              <Switch
                checked={localSettings.sms_alerts_enabled}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, sms_alerts_enabled: checked })
                }
              />
            </div>

            {localSettings.sms_alerts_enabled && (
              <div className="space-y-2 pl-8 animate-fade-in">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={localSettings.phone_number}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, phone_number: e.target.value })
                  }
                />
              </div>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-4">Notification Types</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">Income Notifications</span>
              </div>
              <Switch
                checked={localSettings.notify_on_income}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, notify_on_income: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">Expense Notifications</span>
              </div>
              <Switch
                checked={localSettings.notify_on_expense}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, notify_on_expense: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Insight Notifications</span>
              </div>
              <Switch
                checked={localSettings.notify_on_insights}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, notify_on_insights: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">Reminder Notifications</span>
              </div>
              <Switch
                checked={localSettings.notify_on_reminders}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, notify_on_reminders: checked })
                }
              />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-4">Expense Alerts</h3>
          <div className="space-y-2">
            <Label htmlFor="threshold">Alert Threshold (₹)</Label>
            <Input
              id="threshold"
              type="number"
              placeholder="e.g., 1000"
              value={localSettings.expense_threshold}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, expense_threshold: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Only alert for expenses above this amount
            </p>
          </div>
        </Card>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12"
        >
          <Save className="h-5 w-5 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};
