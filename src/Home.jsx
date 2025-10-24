export default function Home() {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-primary-dark via-primary-teal to-primary-light text-white text-center p-10 overflow-y-auto overflow-x-auto">
      <h1 className="text-5xl font-bold mb-4">Welcome to HealthTrack 👟🥗🏋🏼‍♂️</h1>
      <h3 className="text-2xl mb-4">Your journey to a healthier you starts here 📌</h3>

      <div className="mt-52 flex justify-center gap-12 text-xl">
        <button className="px-6 py-3 bg-white text-primary-dark rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Button 1
        </button>
        <button className="px-6 py-3 bg-white text-primary-dark rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Button 2
        </button>
        <button className="px-6 py-3 bg-white text-primary-dark rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Button 3
        </button>
      </div>
    </div>
  );
}
