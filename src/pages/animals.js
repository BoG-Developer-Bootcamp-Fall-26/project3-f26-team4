import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

export default function AnimalsPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const [animals, setAnimals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    hoursTrained: 0,
    profilePicture: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const fetchAnimals = async () => {
    try {
      const res = await fetch(`/api/animal?userId=${user.userId}`);
      const data = await res.json();

      if (Array.isArray(data.animals)) {
        setAnimals(data.animals);
      } else if (Array.isArray(data)) {
        setAnimals(data);
      }

    } catch (err) {
      console.error("Failed to fetch animals:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnimals();
    }
  }, [user]);

  const handleCreateAnimal = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/animal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          hoursTrained: Number(formData.hoursTrained),
          owner: user.userId || user._id,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ name: "", breed: "", hoursTrained: 0, profilePicture: "" });
        fetchAnimals();
      }
    } catch (err) {
      console.error("Error creating animal:", err);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Animal Training Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Logged in as: <strong>{user.fullName || user.email}</strong></span>
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
          <h2 className="text-2xl font-bold text-gray-800">Animals</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded transition"
          >
            + Add Animal
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {animals.map((animal) => (
            <div key={animal._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <img
                src={animal.profilePicture || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600"}
                alt={animal.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900">{animal.name}</h3>
                <p className="text-sm text-gray-500">{animal.breed}</p>
                <div className="mt-3 flex justify-between items-center text-sm">
                  <span className="text-gray-600">Hours Trained:</span>
                  <span className="font-semibold text-blue-600">{animal.hoursTrained} hrs</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Add New Animal</h3>
            <form onSubmit={handleCreateAnimal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Animal Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Breed</label>
                <input
                  type="text"
                  required
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hours Trained</label>
                <input
                  type="number"
                  min="0"
                  required
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.hoursTrained}
                  onChange={(e) => setFormData({ ...formData, hoursTrained: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Profile Picture URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.profilePicture}
                  onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                >
                  Save Animal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}