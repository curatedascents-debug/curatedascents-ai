export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <section className="px-6 py-24 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          CuratedAscents <span className="text-blue-600">AI</span>
        </h1>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-10">
          Where 25 Years of Himalayan Mastery Meets Artificial Intelligence.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition">
          Begin Your Journey
        </button>
        <a 
  href="/about" 
  className="ml-4 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-8 rounded-lg text-lg transition"
>
  Our Expertise
</a>
      </section>
    </main>
  );
}
