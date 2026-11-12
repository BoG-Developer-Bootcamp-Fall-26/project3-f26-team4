
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface User {
    _id: string;
    fullName: string;
    email: string;
    admin: boolean;
}

export default function AdminUsersPage() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();

    const [users, setUsers] = useState<User[]>([]);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function fetchUsers() {
            try {
                setFetching(true);
                setError("");

                const res = await fetch("/api/admin/users");
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Failed to fetch users.");
                }

                setUsers(data.users);
            } catch (err) {
                console.error("Failed to fetch users:", err);
                setError("Something went wrong while retrieving users.");
            } finally {
                setFetching(false);
            }
        }

        if (!loading && user?.admin) {
            fetchUsers();
        } else if (!loading) {
            setFetching(false);
        }
    }, [user, loading]);

    if (loading || fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    if (!user) return null;

    if (!user.admin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-600">
                    You do not have permission to view this page.
                </p>
            </div>
        );
    }

    if (error) {
        return <p className="p-8 text-red-600">{error}</p>;
    }

    return (
        <div className="h-full bg-gray-50 p-8">
            <div className="mx-auto w-full max-w-6xl">

                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            All Users
                        </h1>
                        <p className="mt-2 text-gray-600">
                            View all registered users.
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 text-sm text-gray-600">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Account Type</th>
                                <th className="px-6 py-4">User ID</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => (
                                <tr
                                    key={user._id}
                                    className="border-t border-gray-200"
                                >
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {user.fullName}
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">
                                        {user.email}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                            user.admin
                                                ? "bg-purple-100 text-purple-700"
                                                : "bg-gray-100 text-gray-600"
                                        }`}>
                                            {user.admin ? "Admin" : "User"}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-xs text-gray-500">
                                        {user._id}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && (
                    <p className="mt-6 text-center text-gray-500">
                        No users found.
                    </p>
                )}

                <p className="mt-4 text-sm text-gray-500">
                    Total users: {users.length}
                </p>

            </div>
        </div>
    );
}
