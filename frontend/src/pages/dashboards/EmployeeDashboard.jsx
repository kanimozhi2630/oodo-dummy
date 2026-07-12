import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Star, Target, Heart, Medal, Zap } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../../services/api';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

const RARITY_COLORS = { common: '#6b7280', rare: '#3b82f6', epic: '#8b5cf6', legendary: '#f59e0b' };

function ProofModal({ challenge, onClose, onSubmit }) {
  const [fileUrl, setFileUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(challenge._id, { proofUrl: fileUrl, notes });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-surface-dark-card rounded-2xl w-full max-w-md p-6 shadow-xl animate-fade-in">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Submit Proof</h3>
        <p className="text-sm text-gray-500 mb-6">Challenge: {challenge.title}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proof URL / Image Link</label>
            <input type="url" required className="input-field" placeholder="https://..." value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Optional)</label>
            <textarea className="input-field" rows="3" placeholder="Describe your achievement..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Proof'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const toast = useToast();

  const loadData = () => {
    api.get('/dashboard/employee').then(({ data: res }) => setData(res)).catch(() => toast.error('Failed to load dashboard.')).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleProofSubmit = async (challengeId, proofData) => {
    try {
      await api.post(`/proofs`, { challengeId, ...proofData });
      toast.success('Proof submitted for review!');
      setSelectedChallenge(null);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit proof');
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_,i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
    </div>
  );

  const { stats, rank = 0, totalParticipants = 0, myActivities = [], myChallenges = [] } = data || {};
  const totalPoints = stats?.totalPoints || 0;
  const level = stats?.level || 1;
  const badges = stats?.badges || [];
  const pointsToNext = level * 200;
  const levelProgress = Math.min(100, Math.round((totalPoints % pointsToNext) / pointsToNext * 100));

  const radialData = [{ name: 'Progress', value: levelProgress, fill: '#2d9866' }];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My ESG Dashboard</h1>
          <p className="page-subtitle">Your sustainability journey and achievements</p>
        </div>
        <Link to="/dashboard/gamification" className="btn-primary text-sm"><Trophy className="w-4 h-4" /> Leaderboard</Link>
      </div>

      {/* Hero rank card */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm opacity-70 uppercase tracking-wider mb-1">Your Rank</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black">#{rank}</span>
              <span className="text-lg opacity-60 mb-1">of {totalParticipants}</span>
            </div>
            <p className="text-sm opacity-70 mt-1">Keep going! You're doing great 🌿</p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{totalPoints}</p>
              <p className="text-xs opacity-70">Total Points</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">Lv.{level}</p>
              <p className="text-xs opacity-70">Level</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{badges.length}</p>
              <p className="text-xs opacity-70">Badges</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs opacity-70 mb-1">
            <span>Level {level}</span>
            <span>{levelProgress}% to Level {level + 1}</span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full">
            <div className="h-2 bg-white rounded-full transition-all duration-700" style={{ width: `${levelProgress}%` }} />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Zap,    label: 'Total Points',       value: totalPoints,                      color: 'bg-yellow-500' },
          { icon: Heart,  label: 'Activities Joined',  value: stats?.activitiesCompleted || 0,  color: 'bg-pink-500'   },
          { icon: Target, label: 'Challenges Done',    value: stats?.challengesCompleted || 0,  color: 'bg-purple-500' },
          { icon: Medal,  label: 'Badges Earned',      value: badges.length,                    color: 'bg-orange-500' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="stat-card animate-slide-up">
            <div className={`stat-icon ${color}`}><Icon className="w-6 h-6 text-white" /></div>
            <div><p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">{label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Badges */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">My Badges</h3>
            <Link to="/dashboard/gamification" className="text-xs text-primary-600 hover:underline">View all →</Link>
          </div>
          {badges.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {badges.map((badge) => (
                <div key={badge._id} className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 hover:scale-105 transition-transform">
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{badge.name}</p>
                  <div className="w-2 h-2 rounded-full mx-auto mt-1" style={{ backgroundColor: RARITY_COLORS[badge.rarity] || '#6b7280' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              <Star className="w-7 h-7 mx-auto mb-2 opacity-40" />
              <p>No badges yet. Start participating!</p>
            </div>
          )}
        </div>

        {/* My Activities */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">My CSR Activities</h3>
            <Link to="/dashboard/social" className="text-xs text-primary-600 hover:underline">Browse →</Link>
          </div>
          <div className="space-y-3">
            {myActivities.length > 0 ? myActivities.map((p) => (
              <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/20">
                <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-pink-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.activity?.title}</p>
                  <p className="text-xs text-gray-400">{formatDate(p.activity?.startDate)}</p>
                </div>
                <div className="text-right">
                  <span className={`badge ${getStatusBadgeClass(p.status)}`}>{p.status}</span>
                  {p.pointsEarned > 0 && <p className="text-xs font-bold text-primary-600 mt-1">+{p.pointsEarned} pts</p>}
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                <Heart className="w-7 h-7 mx-auto mb-2 opacity-40" />
                <p>No activities joined yet</p>
                <Link to="/dashboard/social" className="btn-primary mt-3 text-xs">Browse Activities</Link>
              </div>
            )}
          </div>
        </div>

        {/* Active Challenges */}
        <div className="card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Active Challenges</h3>
            <Link to="/dashboard/gamification" className="text-xs text-primary-600 hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myChallenges.length > 0 ? myChallenges.map(c => (
              <div key={c._id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className={`badge ${c.difficulty === 'easy' ? 'badge-green' : c.difficulty === 'medium' ? 'badge-yellow' : 'badge-red'}`}>
                    {c.difficulty}
                  </span>
                  <span className="text-xs font-bold text-primary-600">{c.points} pts</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-1">{c.title}</h4>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2 flex-1">{c.description}</p>
                <button onClick={() => setSelectedChallenge(c)} className="btn-primary w-full text-xs py-2">Submit Proof</button>
              </div>
            )) : (
              <div className="col-span-full text-center py-6 text-sm text-gray-400">No active challenges available.</div>
            )}
          </div>
        </div>
      </div>

      {selectedChallenge && (
        <ProofModal challenge={selectedChallenge} onClose={() => setSelectedChallenge(null)} onSubmit={handleProofSubmit} />
      )}
    </div>
  );
}
