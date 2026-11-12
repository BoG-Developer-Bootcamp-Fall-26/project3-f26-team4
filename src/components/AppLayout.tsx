import type { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useRouter } from "next/router";

// ReactNode is a typescript type that describes the kind of things react can display
export default function AppLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const hideSidebar = ["/login", "/create-account", "/signup"].includes(router.pathname);

    return (
        <div className="min-h-screen">
            <Header />

            <div className="flex">
                {!hideSidebar && <Sidebar />}

                <main className="flex-1">
                {children}
                </main>
            </div>
        </div>
    );
}