import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function TreePage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <div className="text-6xl mb-4">🌳</div>
          <h1 className="text-2xl font-bold text-[#1a4a1a]">Your Money Tree</h1>
          <p className="text-[#5a7a5a] mt-2">Coming in Phase 2 — keep saving!</p>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
