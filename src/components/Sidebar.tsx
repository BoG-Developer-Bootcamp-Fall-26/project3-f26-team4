import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Sidebar() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();

    const isActive = (path: string) => router.pathname === path;

    return (
        <aside className="bg-white w-[250px] min-h-screen border-r border-gray-200 p-5">
            <nav className="flex flex-col">
                <div className="flex flex-col gap-2">
                    <Link href="/training-logs" className="flex items-center">
                        <img 
                            src={isActive("/training-logs")
                                ? "/images/activeTrainingLogo.png"
                                : "/images/inactiveTrainingLogs.png"} 
                            alt="trainings logo" 
                            className="pr-3"
                        />
                        <p className={isActive("/training-logs") ? "text-white" : "text-gray-500"}>
                            Training Logs
                        </p>
                    </Link>
                    <Link href="/animals" className="flex items-center">
                        <img 
                            src={isActive("/animals")
                                ? "/images/activeAnimalsLogo.png"
                                : "/images/inactiveAnimalLogo.png"} 
                            alt="animals logo" 
                            className="pr-3"
                        />
                        <p className={isActive("/animals") ? "text-white" : "text-gray-500"}>
                            Animals
                        </p>
                    </Link>
                </div>

                {!loading && user?.admin && (
                    <div className="flex flex-col gap-2">
                        <h2 className="font-bold text-gray-500 pt-8 pb-3">Admin access</h2>
                        <Link href="/admin/training" className="flex items-center">
                            <img 
                                src={isActive("/admin/training")
                                    ? "/images/activeAllTrainingLogo.png"
                                    : "/images/inactiveAllTrainingLogo.png"} 
                                alt="animals logo" 
                                className="pr-3"
                            />
                            <p className={isActive("/admin/training") ? "text-white" : "text-gray-500"}>
                                All training
                            </p>
                        </Link>
                        <Link href="/admin/animals" className="flex items-center">
                            <img 
                                src={isActive("/admin/animals")
                                    ? "/images/activeAllAnimalsLogo.png"
                                    : "/images/inactiveAllAnimalsLogo.png"} 
                                alt="animals logo" 
                                className="pr-3"
                            />
                            <p className={isActive("/admin/animals") ? "text-white" : "text-gray-500"}>
                                All animals
                            </p>
                        </Link>
                        <Link href="/admin/users" className="flex items-center">
                            <img 
                                src={isActive("/admin/users")
                                    ? "/images/activeAllUsersLogo.png"
                                    : "/images/inactiveAllUsersLogo.png"} 
                                alt="animals logo" 
                                className="pr-3"
                            />
                            <p className={isActive("/admin/users") ? "text-white" : "text-gray-500"}>
                                All users
                            </p>
                        </Link>
                    </div>
                )}

                <div className="mt-auto border-t border-gray-200 pt-5">
                    {!loading && user && (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">{user.fullName}</p>
                                <p className="text-sm text-gray-500">
                                    {user.admin ? "Admin" : "User"}
                                </p>
                            </div>

                            <button onClick={logout}>
                                <img src="/images/logoutLogo.png" />
                            </button>
                        </div>
                    )}
                </div>
            </nav>
        </aside>
    )
}