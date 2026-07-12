import { useState, useEffect } from 'react';
import { Heart, Plus, Users, Star, Target } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatDate, getStatusBadgeClass } from '../utils/helpers';

export default function Social() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { hasRole } = useAuth();
  const canEdit = hasRole('ceo', 'hr_manager');

  useEffect(() => {
    api.get('/social/activities')
      .then(({ data }) => setActivities(data.activities))
      .catch(() => toast.error('Failed to load CSR activities'))
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = async (id) => {
    try {
      await api.post(`/social/activities/${id}/join`);
      toast.success('Successfully joined the activity!');
      setActivities(prev => prev.map(a => a._id === id ? { ...a, currentParticipants: a.currentParticipants + 1 } : a));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Social Responsibility</h1>
          <p className="page-subtitle">CSR activities, volunteering, and community engagement</p>
        </div>
        {canEdit && <button className="btn-primary"><Plus className="w-4 h-4" /> Create Activity</button>}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map(activity => (
            <div key={activity._id} className="card-hover overflow-hidden flex flex-col">
              <div className="h-32 bg-gradient-to-br from-pink-500 to-rose-600 p-5 relative">
                <div className="absolute top-3 right-3"><span className={`badge bg-white/20 text-white backdrop-blur-md border-0`}>{activity.status}</span></div>
                <Heart className="w-8 h-8 text-white/50 absolute -bottom-2 -right-2" />
                <h3 className="text-lg font-bold text-white mb-1 truncate pr-16">{activity.title}</h3>
                <span className="badge bg-black/20 text-white border-0">{activity.category}</span>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 flex-1">{activity.description}</p>
                
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex justify-between"><span>Date:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{formatDate(activity.startDate)}</span></div>
                  <div className="flex justify-between"><span>Location:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{activity.location || 'Virtual'}</span></div>
                  <div className="flex justify-between"><span>Reward:</span> <span className="font-bold text-primary-600">+{activity.points} pts</span></div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <Users className="w-4 h-4" />
                    {activity.currentParticipants} / {activity.maxParticipants || '∞'} joined
                  </div>
                  <button onClick={() => handleJoin(activity._id)} disabled={activity.status !== 'upcoming'} className="btn-outline py-1.5 px-3 text-xs rounded-lg">
                    Join Now
                  </button>
                </div>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No CSR activities found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
