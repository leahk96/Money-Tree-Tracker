import { useEffect } from "react";
import { useLocation } from "wouter";

export default function AnalyticsPage() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate("/budget", { replace: true }); }, [navigate]);
  return null;
}
