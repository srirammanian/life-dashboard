'use client'

import { useSession, signOut } from 'next-auth/react'
import CalendarWidget from '../components/CalendarWidget';

export default function Dashboard() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Life Dashboard
          </h1>
          {session?.user && (
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {session.user.email}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Sign out"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Health Card */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Health
                </h3>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Track your health metrics and habits
                </div>
              </div>
            </div>

            {/* Finance Card */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Finance
                </h3>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Monitor your financial health
                </div>
              </div>
            </div>

            {/* Tasks Card */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Tasks
                </h3>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Manage your daily tasks
                </div>
              </div>
            </div>

            {/* Calendar Widget */}
            <CalendarWidget />

            {/* Goals Card */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Goals
                </h3>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Track progress on your goals
                </div>
              </div>
            </div>

            {/* Insights Card */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Insights
                </h3>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  AI-powered insights and recommendations
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
