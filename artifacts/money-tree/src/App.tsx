import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import Onboarding from "@/pages/Onboarding";
import BudgetPage from "@/pages/BudgetPage";
import TreePage from "@/pages/TreePage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
import SummaryPage from "@/pages/SummaryPage";
import GardenPage from "@/pages/GardenPage";
import BudgetDemo from "@/pages/BudgetDemo";
import TreeDemo from "@/pages/TreeDemo";
import GardenDemo from "@/pages/GardenDemo";
import SummaryDemo from "@/pages/SummaryDemo";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Redirect to={user ? "/tree" : "/login"} />;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/onboarding">
        <ProtectedRoute requireOnboarding={false}>
          <Onboarding />
        </ProtectedRoute>
      </Route>
      <Route path="/demo" component={BudgetDemo} />
      <Route path="/tree-demo" component={TreeDemo} />
      <Route path="/garden-demo" component={GardenDemo} />
      <Route path="/summary-demo" component={SummaryDemo} />
      <Route path="/budget" component={BudgetPage} />
      <Route path="/budget/:year/:month" component={BudgetPage} />
      <Route path="/tree" component={TreePage} />
      <Route path="/garden" component={GardenPage} />
      <Route path="/summary" component={SummaryPage} />
      <Route path="/summary/:year" component={SummaryPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AuthProvider>
          <ProfileProvider>
            <AppRoutes />
          </ProfileProvider>
        </AuthProvider>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
