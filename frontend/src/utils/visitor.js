const VISITOR_ID_KEY = 'investlink_visitor_id';

const createVisitorId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `visitor_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
};

export const getVisitorId = () => {
  if (typeof window === 'undefined') return 'server';

  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = createVisitorId();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }

  return visitorId;
};

