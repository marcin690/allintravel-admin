// src/app/(admin)/layout.tsx
import HydrogenLayout from '@/layouts/hydrogen/layout';
import { ThemeProvider, JotaiProvider } from '@/app/shared/theme-provider';
import NextProgress from '@/components/next-progress';
import GlobalDrawer from '@/app/shared/drawer-views/container';
import GlobalModal from '@/app/shared/modal-views/container';


export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <NextProgress />
            <JotaiProvider>
                <HydrogenLayout>
                    {children}
                </HydrogenLayout>
                <GlobalDrawer />
                <GlobalModal />
            </JotaiProvider>
        </ThemeProvider>
    );
}
