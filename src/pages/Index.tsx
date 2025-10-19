import { useState } from "react";
import { 
  Home, Upload, AlertCircle, TrendingUp, TrendingDown, DollarSign, 
  Camera, FileText, Upload as UploadIcon, Lightbulb, CheckCircle, Sparkles, Brain 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Screen = "dashboard" | "upload" | "alerts" | "credit";

const KhaataKitab = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>("dashboard");
  const { toast } = useToast();

  // ===== DASHBOARD DATA =====
  const cashflowData = [
    { month: "Jan", income: 45000, expenses: 32000 },
    { month: "Feb", income: 52000, expenses: 38000 },
    { month: "Mar", income: 48000, expenses: 35000 },
    { month: "Apr", income: 61000, expenses: 42000 },
    { month: "May", income: 55000, expenses: 39000 },
    { month: "Jun", income: 67000, expenses: 45000 },
  ];

  const totalIncome = 328000;
  const totalExpenses = 231000;
  const netProfit = totalIncome - totalExpenses;
  
  // Current Balance Calculation
  const openingBalance = 150000;
  const currentBalance = openingBalance + totalIncome - totalExpenses;

  // ML Predictions - Simple Linear Regression
  const predictNextMonth = () => {
    const n = cashflowData.length;
    
    // Calculate trend for income
    const incomeSlope = cashflowData.reduce((sum, item, idx) => {
      return sum + (idx + 1) * item.income;
    }, 0) / n - (((n + 1) / 2) * cashflowData.reduce((sum, item) => sum + item.income, 0) / n);
    
    const avgIncome = cashflowData.reduce((sum, item) => sum + item.income, 0) / n;
    const predictedIncome = Math.round(avgIncome + incomeSlope * 1.5);
    
    // Calculate trend for expenses
    const expenseSlope = cashflowData.reduce((sum, item, idx) => {
      return sum + (idx + 1) * item.expenses;
    }, 0) / n - (((n + 1) / 2) * cashflowData.reduce((sum, item) => sum + item.expenses, 0) / n);
    
    const avgExpenses = cashflowData.reduce((sum, item) => sum + item.expenses, 0) / n;
    const predictedExpenses = Math.round(avgExpenses + expenseSlope * 1.5);
    
    return {
      income: predictedIncome,
      expenses: predictedExpenses,
      profit: predictedIncome - predictedExpenses
    };
  };

  const prediction = predictNextMonth();

  // ===== UPLOAD DATA =====
  const [smsText, setSmsText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast({
        title: "Receipt uploaded",
        description: "Image uploaded successfully",
      });
    }
  };

  const handleSubmit = () => {
    if (!smsText && !selectedImage) {
      toast({
        title: "No data",
        description: "Please add SMS text or upload a receipt",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Transaction added",
      description: "Your transaction has been recorded successfully",
    });
    
    setSmsText("");
    setSelectedImage(null);
  };

  // ===== ALERTS DATA =====
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

  // ===== CREDIT DATA =====
  const creditScore = 720;
  const maxScore = 900;
  const scorePercentage = (creditScore / maxScore) * 100;

  const factors = [
    { label: "Payment History", score: 85, impact: "High" },
    { label: "Credit Utilization", score: 70, impact: "High" },
    { label: "Credit Age", score: 60, impact: "Medium" },
    { label: "Credit Mix", score: 75, impact: "Low" },
  ];

  // ===== HELPER COMPONENTS =====
  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend 
  }: { 
    title: string; 
    value: string; 
    icon: typeof TrendingUp; 
    trend?: "positive" | "negative" | "neutral" 
  }) => {
    const trendColors = {
      positive: "text-success",
      negative: "text-destructive",
      neutral: "text-foreground",
    };

    return (
      <Card className="p-4 hover:shadow-md transition-all duration-200 hover-scale">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className={`text-2xl font-bold ${trendColors[trend || "neutral"]}`}>{value}</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </Card>
    );
  };

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

  const getPriorityVariant = (priority: string): "destructive" | "default" | "secondary" => {
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

  const getScoreRating = (score: number) => {
    if (score >= 750) return { label: "Excellent", color: "text-success" };
    if (score >= 650) return { label: "Good", color: "text-primary" };
    if (score >= 550) return { label: "Fair", color: "text-warning" };
    return { label: "Poor", color: "text-destructive" };
  };

  const rating = getScoreRating(creditScore);

  // ===== SCREEN RENDERERS =====
  const renderDashboard = () => (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold mb-1">KhaataKitab</h1>
        <p className="text-sm opacity-90">Your Business Dashboard</p>
      </div>

      {/* Current Balance */}
      <div className="p-4">
        <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Current Balance</p>
            <DollarSign className="h-6 w-6 opacity-90" />
          </div>
          <p className="text-4xl font-bold mb-1">₹{currentBalance.toLocaleString()}</p>
          <p className="text-xs opacity-75">Opening: ₹{openingBalance.toLocaleString()}</p>
        </Card>
      </div>

      {/* Metrics */}
      <div className="px-4 space-y-3">
        <MetricCard
          title="Total Income"
          value={`₹${totalIncome.toLocaleString()}`}
          icon={TrendingUp}
          trend="positive"
        />
        <MetricCard
          title="Total Expenses"
          value={`₹${totalExpenses.toLocaleString()}`}
          icon={TrendingDown}
          trend="negative"
        />
        <MetricCard
          title="Net Profit"
          value={`₹${netProfit.toLocaleString()}`}
          icon={DollarSign}
          trend="positive"
        />
      </div>

      {/* ML Predictions - Prominent Section */}
      <div className="p-4">
        <Card className="p-5 bg-gradient-to-br from-purple-500/10 via-primary/10 to-blue-500/10 border-2 border-primary/30 shadow-lg animate-pulse-slow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg animate-pulse">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  ML Predictions - Next Month
                  <Sparkles className="h-4 w-4 text-primary animate-bounce" />
                </h2>
                <p className="text-xs text-muted-foreground">AI-powered forecast using linear regression</p>
              </div>
            </div>
            <Badge className="bg-primary/20 text-primary border-primary/50 font-bold">
              <Sparkles className="h-3 w-3 mr-1" />
              ML
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center bg-background/60 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Income</p>
              <p className="text-xl font-bold text-success">₹{prediction.income.toLocaleString()}</p>
              <p className="text-xs text-success/70 mt-1">Predicted ↑</p>
            </div>
            <div className="text-center bg-background/60 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Expenses</p>
              <p className="text-xl font-bold text-destructive">₹{prediction.expenses.toLocaleString()}</p>
              <p className="text-xs text-destructive/70 mt-1">Predicted ↑</p>
            </div>
            <div className="text-center bg-background/60 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Profit</p>
              <p className="text-xl font-bold text-primary">₹{prediction.profit.toLocaleString()}</p>
              <p className="text-xs text-primary/70 mt-1">Estimated</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Cashflow Chart */}
      <div className="p-4">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Cashflow Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cashflowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }} 
              />
              <Bar dataKey="income" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expenses" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );

  const renderUpload = () => (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Upload Transactions</h1>
        <p className="text-sm opacity-90">Add SMS or receipt images</p>
      </div>

      <div className="p-4 space-y-4">
        {/* SMS Upload Section */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Paste SMS Transaction</h2>
          </div>
          <Textarea
            placeholder="Paste your bank SMS here... (e.g., 'Debited Rs 500 from A/C XX1234 on 01-Jan-2025')"
            value={smsText}
            onChange={(e) => setSmsText(e.target.value)}
            className="min-h-32"
          />
        </Card>

        {/* Receipt Upload Section */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Camera className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Upload Receipt Image</h2>
          </div>
          
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
              id="camera-input"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="gallery-input"
            />
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => document.getElementById("camera-input")?.click()}
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => document.getElementById("gallery-input")?.click()}
              >
                <UploadIcon className="h-4 w-4 mr-2" />
                Choose from Gallery
              </Button>
            </div>

            {selectedImage && (
              <div className="mt-3 rounded-lg overflow-hidden border border-border animate-scale-in">
                <img
                  src={selectedImage}
                  alt="Receipt preview"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Submit Button */}
        <Button className="w-full" size="lg" onClick={handleSubmit}>
          <UploadIcon className="h-5 w-5 mr-2" />
          Submit Transaction
        </Button>
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
              Alerts & Tips
              <Sparkles className="h-5 w-5 animate-pulse" />
            </h1>
            <p className="text-sm opacity-90">AI-powered insights for your business</p>
          </div>
          <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
            <Brain className="h-3 w-3 mr-1" />
            ML
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {alerts.map((alert) => (
          <Card key={alert.id} className="p-4 hover:shadow-md transition-all duration-200 hover-scale">
            <div className="flex items-start gap-3">
              <div className="pt-1">{getAlertIcon(alert.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{alert.title}</h3>
                    {alert.type === "info" && (
                      <Badge variant="secondary" className="text-xs">
                        <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                        ML
                      </Badge>
                    )}
                  </div>
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
    </div>
  );

  const renderCredit = () => (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Credit Score</h1>
        <p className="text-sm opacity-90">Your creditworthiness overview</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Credit Score Card */}
        <Card className="p-6 text-center">
          <div className="mb-4">
            <TrendingUp className="h-12 w-12 text-primary mx-auto mb-2" />
            <h2 className="text-sm text-muted-foreground mb-2">Your Credit Score</h2>
            <div className="flex items-baseline justify-center gap-2">
              <span className={`text-5xl font-bold ${rating.color}`}>{creditScore}</span>
              <span className="text-xl text-muted-foreground">/ {maxScore}</span>
            </div>
            <p className={`text-lg font-semibold mt-2 ${rating.color}`}>{rating.label}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={scorePercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>
        </Card>

        {/* Score Factors */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 text-foreground">Credit Factors</h3>
          <div className="space-y-4">
            {factors.map((factor, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{factor.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">{factor.impact} Impact</span>
                    <span className="font-semibold text-primary">{factor.score}%</span>
                  </div>
                </div>
                <Progress value={factor.score} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* Tips Card */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-2 text-foreground">💡 How to Improve</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Pay all bills on time every month</li>
            <li>Keep credit utilization below 30%</li>
            <li>Avoid opening too many new accounts</li>
            <li>Maintain a diverse credit mix</li>
          </ul>
        </Card>
      </div>
    </div>
  );

  // ===== BOTTOM NAVIGATION =====
  const navItems = [
    { id: "dashboard" as Screen, icon: Home, label: "Dashboard" },
    { id: "upload" as Screen, icon: Upload, label: "Upload" },
    { id: "alerts" as Screen, icon: AlertCircle, label: "Alerts" },
    { id: "credit" as Screen, icon: TrendingUp, label: "Credit" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Screen Content */}
      {activeScreen === "dashboard" && renderDashboard()}
      {activeScreen === "upload" && renderUpload()}
      {activeScreen === "alerts" && renderAlerts()}
      {activeScreen === "credit" && renderCredit()}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default KhaataKitab;
