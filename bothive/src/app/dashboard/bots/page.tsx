import Link from 'next/link';
import { BOT_CATALOG } from './[botId]/page';

export default function BotsPage() {
  const categories = Array.from(new Set(Object.values(BOT_CATALOG).map(bot => bot.category)));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bot Helper Center</h1>
        <p className="text-gray-600">Choose a bot type and we'll guide you through setting it up with your specific needs</p>
      </div>

      {categories.map((category) => (
        <div key={category} className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(BOT_CATALOG)
              .filter(bot => bot.category === category)
              .map((bot) => (
                <Link
                  key={bot.id}
                  href={`/dashboard/bots/${bot.id}`}
                  className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{bot.icon}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{bot.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{bot.description}</p>
                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    <span>Get Started</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      ))}

      <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Need a custom bot?</h3>
        <p className="text-blue-800 mb-4">
          Can't find what you're looking for? Create your own custom bot with our advanced builder.
        </p>
        <Link
          href="/builder"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Custom Bot
        </Link>
      </div>
    </div>
  );
}
