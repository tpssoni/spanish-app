import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import type { DashboardData, UnitSummary } from '../api/types';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [units, setUnits] = useState<UnitSummary[]>([]);

  useEffect(() => {
    api.get<DashboardData>('/user/dashboard').then((res) => setDashboard(res.data));
    api.get<UnitSummary[]>('/curriculum/units').then((res) => setUnits(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-amber-50 px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-800">Hola, {user?.name} 👋</h1>
            <p className="text-amber-600">Level {user?.cefr_level}</p>
          </div>
          <button onClick={logout} className="text-sm text-amber-700 underline">
            Log out
          </button>
        </header>

        {dashboard && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="XP" value={dashboard.user.xp} />
            <StatCard label="Streak" value={`${dashboard.user.streak} 🔥`} />
            <StatCard label="Words learned" value={dashboard.wordsLearned} />
            <StatCard label="Due for review" value={dashboard.wordsDueForReview} />
          </div>
        )}

        {dashboard && dashboard.wordsDueForReview > 0 && (
          <Link
            to="/review"
            className="block bg-amber-600 hover:bg-amber-700 text-white rounded-xl p-4 text-center font-semibold"
          >
            Review {dashboard.wordsDueForReview} words now →
          </Link>
        )}

        <section>
          <h2 className="text-xl font-bold text-amber-800 mb-3">Curriculum</h2>
          <div className="space-y-4">
            {units.map((unit) => (
              <div key={unit.id} className="bg-white rounded-xl shadow p-4">
                <h3 className="font-semibold text-amber-800">{unit.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{unit.description}</p>
                <div className="flex flex-wrap gap-2">
                  {unit.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      to={`/lesson/${lesson.id}`}
                      className={`px-3 py-1 rounded-full text-sm ${
                        lesson.completed
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {lesson.completed ? '✓ ' : ''}
                      {lesson.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 text-center">
      <div className="text-2xl font-bold text-amber-700">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
