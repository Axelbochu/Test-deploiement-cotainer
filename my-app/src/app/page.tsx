'use client';
export default function Home() {
  const spawnContainer = async () => {
    alert("Demande envoyée à Azure...");
    const res = await fetch('/api/spawn', { method: 'POST' });
    const data = await res.json();
    console.log(data);
    alert(data.success ? "Succès ! Regarde le portail Azure." : "Erreur : " + data.error);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Test Zone Azure</h1>
      <button 
        onClick={spawnContainer}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        🚀 Déployer un Container Nginx
      </button>
    </main>
  );
}