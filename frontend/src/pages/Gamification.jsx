import { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Shield, Users } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { getRoleName } from '../utils/helpers';

export default function Gamification() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api.get('/gamification/leaderboard')
      .then(({ data }) => setLeaderboard(data.leaderboard))
      .catch(() => toast.error('Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Leaderboard</h1>
          <p className="page-subtitle">Recognizing our top sustainability champions</p>
        </div>
      </div>

      {loading ? (
        <div className="card p-5"><div className="skeleton h-96 rounded-xl" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 3 Podium */}
          <div className="lg:col-span-3 flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-8 pt-8 pb-4">
            {/* Rank 2 */}
            {leaderboard[1] && (
              <div className="flex flex-col items-center order-2 sm:order-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600 mb-2 border-4 border-white shadow-lg z-10">
                  {leaderboard[1].user?.name?.charAt(0)}
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-t-2xl px-6 pt-4 pb-2 text-center w-32 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-700">2</div>
                  <p className="font-bold text-sm truncate">{leaderboard[1].user?.name}</p>
                  <p className="text-xs text-gray-500 font-bold">{leaderboard[1].totalPoints} pts</p>
                </div>
                <div className="w-32 h-24 bg-gray-200 dark:bg-gray-700 rounded-b-xl" />
              </div>
            )}
            
            {/* Rank 1 */}
            {leaderboard[0] && (
              <div className="flex flex-col items-center order-1 sm:order-2 animate-slide-up relative">
                <Trophy className="w-8 h-8 text-yellow-400 absolute -top-10 animate-bounce" />
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center text-3xl font-bold text-yellow-600 mb-2 border-4 border-yellow-400 shadow-xl z-10">
                  {leaderboard[0].user?.name?.charAt(0)}
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-t-2xl px-6 pt-4 pb-2 text-center w-36 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-white">1</div>
                  <p className="font-bold text-sm truncate text-yellow-700 dark:text-yellow-500">{leaderboard[0].user?.name}</p>
                  <p className="text-xs font-bold text-yellow-600">{leaderboard[0].totalPoints} pts</p>
                </div>
                <div className="w-36 h-32 bg-yellow-100 dark:bg-yellow-900/40 rounded-b-xl" />
              </div>
            )}

            {/* Rank 3 */}
            {leaderboard[2] && (
              <div className="flex flex-col items-center order-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl font-bold text-orange-600 mb-2 border-4 border-white shadow-lg z-10">
                  {leaderboard[2].user?.name?.charAt(0)}
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-t-2xl px-6 pt-4 pb-2 text-center w-32 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-xs font-bold text-white">3</div>
                  <p className="font-bold text-sm truncate">{leaderboard[2].user?.name}</p>
                  <p className="text-xs text-orange-600 font-bold">{leaderboard[2].totalPoints} pts</p>
                </div>
                <div className="w-32 h-16 bg-orange-100 dark:bg-orange-900/40 rounded-b-xl" />
              </div>
            )}
          </div>

          {/* Full List */}
          <div className="lg:col-span-3 card p-0 overflow-hidden">
            <div className="table-container border-0">
              <table className="table">
                <thead><tr><th className="w-16 text-center">Rank</th><th>User</th><th>Role</th><th>Level</th><th className="text-right">Total Points</th></tr></thead>
                <tbody>
                  {leaderboard.map((entry, idx) => (
                    <tr key={entry._id} className={idx < 3 ? 'bg-gray-50/50 dark:bg-gray-800/30' : ''}>
                      <td className="text-center font-bold text-gray-500">{idx + 1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                            {entry.user?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{entry.user?.name}</p>
                            <p className="text-xs text-gray-400">{entry.user?.department?.name || 'No Dept'}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="text-sm text-gray-600">{getRoleName(entry.user?.role)}</span></td>
                      <td><span className="badge badge-purple">Lv. {entry.level || 1}</span></td>
                      <td className="text-right font-bold text-primary-600">{entry.totalPoints} pts</td>
                    </tr>
                  ))}
                  {leaderboard.length === 0 && <tr><td colSpan={5} className="text-center py-8">No leaderboard data</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
