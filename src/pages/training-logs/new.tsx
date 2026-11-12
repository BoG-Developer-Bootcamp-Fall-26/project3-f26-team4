import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

interface Animal {
    _id: string;
    name: string;
    breed: string;
}

export default function NewTrainingLog() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [animals, setAnimals] = useState<Animal[]>([]);
    const [fetchingAnimals, setFetchingAnimals] = useState(true);

    const [animalId, setAnimalId] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [hours, setHours] = useState("");

    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Retrieve the user's animals.
    useEffect(() => {
        async function getAnimals() {
            try {
                const response = await fetch(
                    `/api/animal?userId=${user!.userId}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to retrieve animals.");
                }

                setAnimals(data.animals);

            } catch (error) {
                console.error(error);
                setError("Unable to load your animals.");
            } finally {
                setFetchingAnimals(false);
            }
        }

        if (!loading && user) {
            getAnimals();
        }

        if (!loading && !user) {
            setFetchingAnimals(false);
        }

    }, [user, loading]);

    // Submit the new training log
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");

        if (!animalId || !title.trim() || !description.trim() || !hours) {
            setError("Please complete all fields.");
            return;
        }

        const hoursNumber = Number(hours);

        if (!Number.isFinite(hoursNumber) || hoursNumber <= 0) {
            setError("Please enter a valid number of hours.");
            return;
        }

        try {
            setSubmitting(true);

            const response = await fetch("/api/training", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: user!.userId,
                    animalId,
                    title,
                    description,
                    hours: hoursNumber
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create training log.");
            }

            // Return to the Training Logs page
            router.push("/training-logs");

        } catch (error) {
            console.error(error);

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Something went wrong.");
            }

        } finally {
            setSubmitting(false);
        }
    }

    if (loading || fetchingAnimals) {
        return <p className="p-8">Loading...</p>;
    }

    if (!user) {
        return <p className="p-8">Please log in to create a training log.</p>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">
                New Training Log
            </h1>

            <form onSubmit={handleSubmit} className="max-w-xl flex flex-col gap-5">

                <div>
                    <label className="block font-semibold mb-2">
                        Animal
                    </label>

                    <select
                        value={animalId}
                        onChange={(event) => setAnimalId(event.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3"
                    >
                        <option value="">Select an animal</option>

                        {animals.map(animal => (
                            <option key={animal._id} value={animal._id}>
                                {animal.name} ({animal.breed})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block font-semibold mb-2">
                        Training Title
                    </label>

                    <input
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="e.g. Obedience Training"
                        className="w-full border border-gray-300 rounded-lg p-3"
                    />
                </div>

                <div>
                    <label className="block font-semibold mb-2">
                        Description
                    </label>

                    <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Describe what you worked on..."
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg p-3"
                    />
                </div>

                <div>
                    <label className="block font-semibold mb-2">
                        Hours Trained
                    </label>

                    <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={hours}
                        onChange={(event) => setHours(event.target.value)}
                        placeholder="e.g. 1.5"
                        className="w-full border border-gray-300 rounded-lg p-3"
                    />
                </div>

                {error && (
                    <p className="text-red-600">{error}</p>
                )}

                {animals.length === 0 && (
                    <p className="text-gray-500">
                        You need to create an animal before adding a training log.
                    </p>
                )}

                <button
                    type="submit"
                    disabled={submitting || animals.length === 0}
                    className="bg-red-600 text-white rounded-lg p-3 font-semibold disabled:opacity-50"
                >
                    {submitting ? "Creating..." : "Create Training Log"}
                </button>

            </form>
        </div>
    );
}