import { ProtectedRoute } from '@/components/protected-route';
import { Header } from '@/components/Header';
import { DotGrid } from '@/components/DotGrid';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DotGrid />
      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-6 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
