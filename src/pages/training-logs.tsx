
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { ObjectId } from "mongodb";
import Link from "next/link";

interface TrainingLog {
    _id: string;
    title: string;
    date: string;
    description: string;
    hours: number;
    animalDetails: {
        _id: ObjectId;
        name: string;
        breed: string;
    } | null;
}

export default function TrainingLogs() {
    const { user, loading } = useAuth();

    const [trainingLogs, setTrainingLogs] = useState<TrainingLog[]>([]);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function getTrainingLogs() {
            if (!user) return;

            try {
                setFetching(true);
                setError("");

                const response = await fetch(
                    `/api/training?userId=${user.userId}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to retrieve training logs.");
                }

                setTrainingLogs(data.trainingLogs);

            } catch (error) {
                console.error(error);
                setError("Unable to load your training logs.");
            } finally {
                setFetching(false);
            }
        }

        if (!loading && user) {
            getTrainingLogs();
        }

    }, [user, loading]);

    if (!user) {
        return <p className="p-8">Please log in to view your training logs.</p>;
    }

    if (loading || fetching) {
        return <p className="p-8">Loading training logs...</p>;
    }

    if (error) {
        return <p className="p-8 text-red-600">{error}</p>;
    }

    return (
        <div className="h-full bg-white p-8">
            <div className="mx-auto w-full max-w-6xl">
    
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Training Logs
                        </h1>
                    </div>
    
                    <Link
                        href="/training-logs/new"
                        className="rounded-lg bg-[#30316f] px-5 py-3 text-white hover:bg-[#24255a]"
                    >
                        Create New
                    </Link>
                </div>
    
                {trainingLogs.length === 0 ? (
                    <p className="text-gray-600">No training logs found.</p>
                ) : (
                    <div className="flex flex-col gap-5">
                        {trainingLogs.map((log) => (
                            <div
                                key={log._id}
                                className="flex min-h-[150px] w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm"
                            >
                                <div className="flex w-[110px] shrink-0 flex-col items-center justify-center bg-[#30316f] p-4 text-center text-white">
                                    <span className="text-2xl font-bold">
                                        {new Date(log.date).getDate()}
                                    </span>
                                    <span className="text-sm">
                                        {new Date(log.date).toLocaleString("default", {
                                            month: "short",
                                        })}
                                    </span>
                                    <span className="text-sm">
                                        {new Date(log.date).getFullYear()}
                                    </span>
                                </div>
    
                                <div className="flex flex-1 flex-col justify-center p-5">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h2 className="text-xl font-bold text-gray-900">
                                            {log.title}
                                        </h2>
    
                                        <span className="font-semibold text-[#30316f]">
                                            {log.hours} hours
                                        </span>
                                    </div>
    
                                    <p className="mt-2 text-sm text-gray-600">
                                        <strong>User:</strong> {user?.fullName}
                                    </p>
    
                                    <p className="mt-1 text-sm text-gray-600">
                                        <strong>Animal:</strong> {log.animalDetails?.name ?? "Unknown animal"}
                                        {" | "}
                                        {log.animalDetails?.breed ?? "Unknown breed"}
                                    </p>
    
                                    <p className="mt-3 text-gray-700">
                                        {log.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
    
            </div>
        </div>
    );
}
