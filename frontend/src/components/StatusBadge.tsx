import { useLanguage } from '@/contexts/LanguageContext';
import { Circle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { t } = useLanguage();

  const getStatusConfig = (s: string) => {
    switch (s) {
      case 'submitted':
        return { label: t('status_submitted'), className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
      case 'pending':
      case 'pending_officer':
      case 'pending_senior':
      case 'pending_higher':
        return { label: t('status_pending'), className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' };
      case 'approved':
      case 'approved_officer':
      case 'approved_senior':
      case 'approved_higher':
      case 'verified':
        return { label: t('status_approved'), className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' };
      case 'rejected':
        return { label: t('status_rejected'), className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
      default:
        return { label: s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' '), className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' };
    }
  };

  const config = getStatusConfig(status.toLowerCase());

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1.5 ${config.className}`}>
      <Circle className="h-2 w-2 fill-current" />
      {config.label}
    </span>
  );
};
