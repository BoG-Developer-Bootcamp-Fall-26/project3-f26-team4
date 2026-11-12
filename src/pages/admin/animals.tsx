
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const fallbackImage = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600";

interface Animal {
    _id: string;
    name: string;
    breed: string;
    hoursTrained: number;
    profilePicture?: string;
    ownerDetails?: {
        fullName: string;
        email: string;
    } | null;
}

export default function AdminAnimalsPage() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();

    const [animals, setAnimals] = useState<Animal[]>([]);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function fetchAnimals() {
            try {
                setFetching(true);
                setError("");

                const res = await fetch("/api/admin/animals");
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Failed to fetch animals.");
                }

                setAnimals(data.animals);
            } catch (err) {
                console.error("Failed to fetch animals:", err);
                setError("Something went wrong while retrieving animals.");
            } finally {
                setFetching(false);
            }
        }

        if (!loading && user?.admin) {
            fetchAnimals();
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

    if (!user) {
        return null;
    }

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
        <div className="min-h-screen bg-gray-50">

            <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">
                    Animal Training Portal
                </h1>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                        Logged in as: <strong>{user.fullName || user.email}</strong>
                    </span>

                    <button
                        onClick={logout}
                        className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded transition"
                    >
                        Log Out
                    </button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-8">

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            All Animals
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            View animals registered by all users.
                        </p>
                    </div>
                </div>

                {animals.length === 0 ? (
                    <p className="text-gray-600">No animals found.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {animals.map((animal) => (
                            <div
                                key={animal._id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                            >
                                <img
                                    src={animal.profilePicture || fallbackImage}
                                    alt={animal.name}
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = fallbackImage;
                                    }}
                                    className="w-full h-48 object-cover"
                                />

                                <div className="p-4">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {animal.name}
                                    </h3>

                                    <p className="text-sm text-gray-500">
                                        {animal.breed}
                                    </p>

                                    <div className="mt-3 flex justify-between items-center text-sm">
                                        <span className="text-gray-600">
                                            Hours Trained:
                                        </span>

                                        <span className="font-semibold text-blue-600">
                                            {animal.hoursTrained} hrs
                                        </span>
                                    </div>

                                    <div className="mt-3 border-t border-gray-100 pt-3">
                                        <p className="text-xs text-gray-500">
                                            Owner
                                        </p>

                                        <p className="text-sm font-semibold text-gray-800">
                                            {animal.ownerDetails?.fullName ?? "Unknown owner"}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            {animal.ownerDetails?.email ?? "No email"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </main>
        </div>
    );
}
