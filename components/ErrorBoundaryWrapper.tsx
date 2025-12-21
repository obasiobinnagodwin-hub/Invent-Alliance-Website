'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import ConditionalLayout from '@/components/ConditionalLayout';

export default function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ConditionalLayout>
        {children}
      </ConditionalLayout>
    </ErrorBoundary>
  );
}

