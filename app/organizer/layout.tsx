"use client";
import { usePathname } from 'next/navigation';
import OrganizerSideBar from './organizerSideBar/OrganizerSideBar';

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Si la ruta es un evento, NO renderizar OrganizerLayout
    if (pathname.startsWith("/organizer/events/")) {
        return <>{children}</>;
    }

    return (
        <div className="bg-black/60">
            <OrganizerSideBar />
            <div className="flex-1 p-6 min-h-screen bg-gray-100 overflow-y-auto md:ml-64">
                {children}
            </div>
        </div>
    );
}