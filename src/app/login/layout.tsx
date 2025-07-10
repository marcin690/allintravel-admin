// src/app/login/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Logowanie Admina',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}