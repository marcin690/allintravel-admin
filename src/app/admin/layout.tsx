// src/app/(admin)/layout.tsx
import HydrogenLayout from '@/layouts/hydrogen/layout';

import NextProgress from '@/components/next-progress';



export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
     <>
         <NextProgress />

         <HydrogenLayout>
             {children}
         </HydrogenLayout>

     </>


    );
}
