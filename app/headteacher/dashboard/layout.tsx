import type { ReactNode } from "react";
import { HeadteacherNavbar } from "@/components/Headteacher";

export default function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#f5f5f0]">
            <HeadteacherNavbar />
            <main>{children}</main>
        </div>
    );
}