import { AlertCircle, TrendingDown, Lightbulb, CheckCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Alerts = () => {
  const alerts = [
    {
      id: 1,
      type: "warning",
      title: "Low Cashflow Alert",
      message: "Your expenses are 85% of your income this month. Consider reducing non-essential spending.",
      date: "Today",
      priority: "high",
    },
    {
      id: 2,
      type: "danger",
      title: "Approaching Credit Limit",
      message: "You've used 75% of your available credit. Try to pay down balances to improve your credit score.",
      date: "Today",
      priority: "high",
    },
    {
      id: 3,
      type: "info",
      title: "Save on Inventory",
      message: "Based on your purchase patterns, buying in bulk could save you ₹3,500/month.",
      date: "Yesterday",
      priority: "medium",
    },
    {
      id: 4,
      type: "success",
      title: "Good Payment Record",
      message: "You've maintained on-time payments for 3 months. This helps build your credit score!",
      date: "2 days ago",
      priority: "low",
    },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case "danger":
        return <TrendingDown className="h-5 w-5 text-destructive" />;
      case "info":
        return <Lightbulb className="h-5 w-5 text-primary" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-success" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Alerts & Tips</h1>
        <p className="text-sm opacity-90">AI-powered insights for your business</p>
      </div>

      <div className="p-4 space-y-3">
        {alerts.map((alert) => (
          <Card key={alert.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="pt-1">{getAlertIcon(alert.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{alert.title}</h3>
                  <Badge variant={getPriorityVariant(alert.priority)} className="shrink-0">
                    {alert.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                <p className="text-xs text-muted-foreground">{alert.date}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Alerts;
