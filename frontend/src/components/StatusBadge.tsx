import { CertificateStatus } from '@/contexts/CertificateContext';
import { Circle } from 'lucide-react';

interface StatusBadgeProps {
  status: CertificateStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig = {
    submitted: { label: 'Submitted', className: 'status-submitted' },
    pending_officer: { label: 'Pending Officer', className: 'status-pending' },
    approved_officer: { label: 'Approved Officer', className: 'status-approved' },
    pending_senior: { label: 'Pending Senior', className: 'status-amber' },
    approved_senior: { label: 'Approved Senior', className: 'status-teal' },
    pending_higher: { label: 'Pending Higher', className: 'status-amber' },
    approved_higher: { label: 'Approved Higher', className: 'status-approved' },
    rejected: { label: 'Rejected', className: 'status-rejected' },
  };

  const config = statusConfig[status];

  return (
    <span className={`status-badge ${config.className}`}>
      <Circle className="h-2 w-2 fill-current" />
      {config.label}
    </span>
  );
};
