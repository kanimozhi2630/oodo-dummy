// Format numbers with K/M suffix
export const formatNumber = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n?.toLocaleString() ?? '0';
};

// Format CO2 in tonnes
export const formatCO2 = (value) => {
  if (!value) return '0 t CO₂e';
  return `${value.toFixed(2)} t CO₂e`;
};

// Format date
export const formatDate = (date, options = {}) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    ...options,
  });
};

// Format relative time
export const timeAgo = (date) => {
  if (!date) return '';
  const diff = Date.now() - new Date(date);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
};

// Role display name
export const getRoleName = (role) => {
  const map = {
    super_admin: 'Super Admin',
    ceo: 'Chief Executive Officer',
    esg_manager: 'ESG Manager',
    hr_manager: 'HR Manager',
    compliance_officer: 'Compliance Officer',
    employee: 'Employee',
  };
  return map[role] || role;
};

// Role badge color
export const getRoleBadgeClass = (role) => {
  const map = {
    ceo: 'badge-purple',
    esg_manager: 'badge-green',
    hr_manager: 'badge-blue',
    compliance_officer: 'badge-orange',
    employee: 'badge-gray',
  };
  return map[role] || 'badge-gray';
};

// Status badge
export const getStatusBadgeClass = (status) => {
  const map = {
    active: 'badge-green', open: 'badge-red', completed: 'badge-blue',
    pending: 'badge-yellow', approved: 'badge-green', rejected: 'badge-red',
    draft: 'badge-gray', in_progress: 'badge-blue', resolved: 'badge-green',
    closed: 'badge-gray', upcoming: 'badge-blue', ongoing: 'badge-orange',
    cancelled: 'badge-gray', overdue: 'badge-red', planned: 'badge-yellow',
    under_review: 'badge-orange', archived: 'badge-gray',
  };
  return map[status] || 'badge-gray';
};

// Severity color
export const getSeverityClass = (severity) => {
  const map = { low: 'badge-green', medium: 'badge-yellow', high: 'badge-orange', critical: 'badge-red' };
  return map[severity] || 'badge-gray';
};

// Generate initials avatar
export const getInitials = (name = '') => {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
};

// ESG score color
export const getEsgScoreColor = (score) => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-blue-500';
  if (score >= 40) return 'text-yellow-500';
  return 'text-red-500';
};

// Truncate text
export const truncate = (str, n = 60) => (str?.length > n ? `${str.slice(0, n)}...` : str);

// Month name from number
export const monthName = (month) => {
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return names[(month - 1) % 12] || '';
};
