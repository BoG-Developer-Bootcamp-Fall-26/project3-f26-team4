
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
        <div className="min-h-[calc(100vh-80px)] bg-white p-8">
            <div className="flex justify-between items-center pb-8 mb-8 border-b">
                <h1 className="text-3xl font-bold text-black">Training Logs</h1>

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
                <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
                    {trainingLogs.map((log) => {
                            const logDate = new Date(log.date);

                            return (
                                <div
                                    key={log._id}
                                    className="mx-15 mt-5 flex bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden min-h-[130px]"
                                >

                                    {/* Date section */}
                                    <div className="bg-[#30316f] text-white w-[110px] shrink-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-bold">
                                            {logDate.getDate()}
                                        </span>

                                        <span className="text-lg mt-1">
                                            {logDate.toLocaleDateString("en-US", {
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>

                                    {/* Log information */}
                                    <div className="flex-1 p-4 sm:p-5 min-w-0">

                                        <div className="flex flex-wrap items-baseline gap-2 mb-2">
                                            <h2 className="text-xl font-bold text-[#321515]">
                                                {log.title}
                                            </h2>

                                            <span className="text-gray-400 text-sm">
                                                • {log.hours} hours
                                            </span>
                                        </div>

                                        <p className="text-gray-400 text-sm font-medium mb-4">
                                            {user.fullName}
                                            {" - "}
                                            {log.animalDetails?.breed ?? "Unknown breed"}
                                            {" - "}
                                            {log.animalDetails?.name ?? "Unknown animal"}
                                        </p>

                                        <p className="text-gray-800 text-sm">
                                            {log.description}
                                        </p>

                                    </div>

                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
}
