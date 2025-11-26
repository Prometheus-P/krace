// src/components/StatusBadge.tsx
import React from 'react';

export type RaceStatus = 'live' | 'upcoming' | 'completed' | 'cancelled';

interface StatusBadgeProps {
  status: RaceStatus;
  className?: string;
}

const statusConfig: Record<RaceStatus, { label: string; className: string }> = {
  live: {
    label: '진행중',
    className: 'status-live',
  },
  upcoming: {
    label: '예정',
    className: 'status-upcoming',
  },
  completed: {
    label: '완료',
    className: 'status-completed',
  },
  cancelled: {
    label: '취소',
    className: 'status-cancelled',
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = statusConfig[status];
  const isLive = status === 'live';

  return (
    <span
      className={`status-badge ${config.className} ${className}`.trim()}
      role={isLive ? 'status' : undefined}
      aria-live={isLive ? 'polite' : undefined}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
