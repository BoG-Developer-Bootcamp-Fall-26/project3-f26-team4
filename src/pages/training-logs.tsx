
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
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Training Logs</h1>

                <Link
                    href="/training-logs/new"
                    className="bg-red-600 text-white px-5 py-3 rounded-lg"
                >
                    + New Training Log
                </Link>
            </div>

            {trainingLogs.length === 0 ? (
                <p>You haven't created any training logs yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {trainingLogs.map(log => (
                        <div
                            key={log._id}
                            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
                        >
                            <h2 className="text-xl font-bold mb-2">
                                {log.title}
                            </h2>

                            <p className="text-gray-500 text-sm mb-4">
                                {new Date(log.date).toLocaleDateString()}
                            </p>

                            <div className="mb-4">
                                <p className="font-semibold">
                                    {log.animalDetails?.name ?? "Unknown animal"}
                                </p>

                                <p className="text-gray-500 text-sm">
                                    {log.animalDetails?.breed ?? "Breed unavailable"}
                                </p>
                            </div>

                            <p className="mb-4">{log.description}</p>

                            <p className="font-semibold">
                                {log.hours} training hours
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
