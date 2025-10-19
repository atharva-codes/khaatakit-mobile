import { useState, useEffect } from "react";
import { 
  Home, Plus, AlertCircle, TrendingUp, TrendingDown, DollarSign, 
  Trash2, Calendar, Tag, Lightbulb, CheckCircle, Sparkles, Brain, RotateCcw 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

// ===== TYPES =====
type Screen = "dashboard" | "add" | "alerts" | "credit";

type TransactionType = "income" | "expense";

type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  timestamp: number;
};

const KhaataKitab = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>("dashboard");
  const { toast } = useToast();

  // ===== TRANSACTION STATE WITH LOCALSTORAGE =====
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("khaataKitab_transactions");
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem("khaataKitab_transactions", JSON.stringify(transactions));
  }, [transactions]);

  // ===== FORM STATE FOR ADD TRANSACTION =====
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("income");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // ===== CALCULATE METRICS FROM TRANSACTIONS =====
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalIncome - totalExpenses;

  // ===== GENERATE CASHFLOW DATA FROM TRANSACTIONS =====
  const getCashflowData = () => {
    if (transactions.length === 0) {
      return [{ month: "No data", income: 0, expenses: 0 }];
    }

    // Group transactions by month
    const monthlyData: { [key: string]: { income: number; expenses: number } } = {};
    
    transactions.forEach((t) => {
      const monthKey = new Date(t.date).toLocaleDateString("en-US", { month: "short" });
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }
      if (t.type === "income") {
        monthlyData[monthKey].income += t.amount;
      } else {
        monthlyData[monthKey].expenses += t.amount;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data,
    }));
  };

  const cashflowData = getCashflowData();

  // ===== ML PREDICTIONS =====
  const predictNextMonth = () => {
    if (transactions.length < 2) {
      return { income: 0, expenses: 0, profit: 0 };
    }

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

  // ===== DYNAMIC ALERTS GENERATION =====
  const generateAlerts = () => {
    const alerts: any[] = [];

    // Alert if expenses > 80% of income
    if (totalIncome > 0 && (totalExpenses / totalIncome) > 0.8) {
      alerts.push({
        id: 1,
        type: "warning",
        title: "High Expense Ratio",
        message: `Your expenses are ${Math.round((totalExpenses / totalIncome) * 100)}% of your income. Consider reducing spending.`,
        date: "Today",
        priority: "high",
      });
    }

    // Alert if approaching negative balance
    if (currentBalance < 10000 && currentBalance > 0) {
      alerts.push({
        id: 2,
        type: "danger",
        title: "Low Balance Warning",
        message: `Your balance is running low at ₹${currentBalance.toLocaleString()}. Monitor your spending closely.`,
        date: "Today",
        priority: "high",
      });
    }

    // Daily spending spike detection
    const last7Days = transactions
      .filter((t) => {
        const daysDiff = (Date.now() - new Date(t.date).getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7 && t.type === "expense";
      });

    if (last7Days.length >= 3) {
      const dailyExpenses = last7Days.map((t) => t.amount);
      const avgDaily = dailyExpenses.reduce((a, b) => a + b, 0) / dailyExpenses.length;
      const todayExpenses = transactions
        .filter((t) => t.date === new Date().toISOString().split("T")[0] && t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      if (todayExpenses > avgDaily * 1.2) {
        alerts.push({
          id: 3,
          type: "info",
          title: "Spending Spike Detected",
          message: `Today's spending (₹${todayExpenses}) is 20% higher than your daily average of ₹${Math.round(avgDaily)}.`,
          date: "Today",
          priority: "medium",
        });
      }
    }

    // Positive feedback
    if (currentBalance > 0 && totalExpenses < totalIncome * 0.7) {
      alerts.push({
        id: 4,
        type: "success",
        title: "Great Financial Health!",
        message: "You're maintaining healthy spending habits. Keep up the good work!",
        date: "Today",
        priority: "low",
      });
    }

    return alerts;
  };

  const alerts = generateAlerts();

  // ===== TRANSACTION HANDLERS =====
  const handleAddTransaction = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      type,
      category: category || (type === "income" ? "Other Income" : "Other Expense"),
      date,
      timestamp: new Date(date).getTime(),
    };

    setTransactions([newTransaction, ...transactions]);
    
    toast({
      title: "Transaction added",
      description: `₹${amount} ${type} recorded successfully`,
    });

    // Reset form
    setAmount("");
    setCategory("");
    setDate(new Date().toISOString().split("T")[0]);
    setActiveScreen("dashboard");
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      setTransactions([]);
      toast({
        title: "Data cleared",
        description: "All transactions have been removed",
      });
    }
  };

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
    <div className="animate-fade-in pb-4">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">KhaataKitab</h1>
            <p className="text-sm opacity-90">AI-Powered Bookkeeping</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearData}
            className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Current Balance */}
      <div className="p-4">
        <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Current Balance</p>
            <DollarSign className="h-6 w-6 opacity-90" />
          </div>
          <p className="text-4xl font-bold mb-1">₹{currentBalance.toLocaleString()}</p>
          <p className="text-xs opacity-75">
            {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
          </p>
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
      </div>

      {/* Recent Transactions */}
      <div className="px-4 mt-4">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-3 text-foreground">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No transactions yet</p>
              <p className="text-xs mt-1">Add your first transaction to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.type === "income"
                          ? "bg-success/10"
                          : "bg-destructive/10"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{transaction.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-bold ${
                      transaction.type === "income" ? "text-success" : "text-destructive"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ML Predictions */}
      {transactions.length >= 2 && (
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
                  <p className="text-xs text-muted-foreground">AI-powered forecast</p>
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
              </div>
              <div className="text-center bg-background/60 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Expenses</p>
                <p className="text-xl font-bold text-destructive">₹{prediction.expenses.toLocaleString()}</p>
              </div>
              <div className="text-center bg-background/60 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Profit</p>
                <p className="text-xl font-bold text-primary">₹{prediction.profit.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Cashflow Chart */}
      {transactions.length > 0 && (
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
      )}
    </div>
  );

  const renderAddTransaction = () => (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Add Transaction</h1>
        <p className="text-sm opacity-90">Record income or expense</p>
      </div>

      <div className="p-4 space-y-4">
        <Card className="p-6">
          <div className="space-y-4">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl font-bold h-14"
              />
            </div>

            {/* Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(val) => setType(val as TransactionType)}>
                <SelectTrigger id="type" className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span>Income</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="expense">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-destructive" />
                      <span>Expense</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Input */}
            <div className="space-y-2">
              <Label htmlFor="category">Category (Optional)</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="category"
                  placeholder={type === "income" ? "e.g., Sales, Salary" : "e.g., Rent, Supplies"}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Date Input */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 h-12"
            onClick={() => setActiveScreen("dashboard")}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-12"
            onClick={handleAddTransaction}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Transaction
          </Button>
        </div>
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
    { id: "add" as Screen, icon: Plus, label: "Add" },
    { id: "alerts" as Screen, icon: AlertCircle, label: "Alerts" },
    { id: "credit" as Screen, icon: TrendingUp, label: "Credit" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Screen Content */}
      {activeScreen === "dashboard" && renderDashboard()}
      {activeScreen === "add" && renderAddTransaction()}
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
