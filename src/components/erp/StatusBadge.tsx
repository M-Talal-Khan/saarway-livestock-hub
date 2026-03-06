import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  'Active': 'bg-[#DBEAFE] text-[#1E40AF]',
  'Fattening': 'bg-[#FED7AA] text-[#C2410C]',
  'Ready for Sale': 'bg-[#D1FAE5] text-[#065F46]',
  'Listed': 'bg-[#EDE9FE] text-[#6D28D9]',
  'Sold': 'bg-[#F3F4F6] text-[#374151]',
  'Slaughtered': 'bg-[#FEE2E2] text-[#991B1B]',
  'Dead': 'bg-[#1F2937] text-white',
  'Finalised': 'bg-[#D1FAE5] text-[#065F46]',
  'Draft': 'bg-[#FEF3C7] text-[#92400E]',
  'Pending': 'bg-[#FEF3C7] text-[#92400E]',
  'Live Sale': 'bg-[#DBEAFE] text-[#1E40AF]',
  'Slaughter': 'bg-[#FEE2E2] text-[#991B1B]',
  'Recovered': 'bg-[#D1FAE5] text-[#065F46]',
  'Ongoing': 'bg-[#FEF3C7] text-[#92400E]',
  'Died': 'bg-[#FEE2E2] text-[#991B1B]',
  'Completed': 'bg-[#D1FAE5] text-[#065F46]',
  'Scheduled': 'bg-[#F3F4F6] text-[#374151]',
  'Upcoming': 'bg-[#FEF3C7] text-[#92400E]',
  'Overdue': 'bg-[#FEE2E2] text-[#991B1B]',
  'Paid': 'bg-[#D1FAE5] text-[#065F46]',
  'Unpaid': 'bg-[#FEF3C7] text-[#92400E]',
  'Owned': 'bg-[#DBEAFE] text-[#1E40AF]',
  'Inactive': 'bg-[#F3F4F6] text-[#374151]',
};

const pulseStatuses = new Set(['Overdue', 'Dead', 'Died', 'Slaughtered']);

interface StatusBadgeProps {
  status: string;
  className?: string;
  pulse?: boolean;
}

const StatusBadge = ({ status, className, pulse }: StatusBadgeProps) => {
  const colors = statusColors[status] || 'bg-[#F3F4F6] text-[#374151]';
  const shouldPulse = pulse || pulseStatuses.has(status);
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
      colors,
      shouldPulse && 'animate-pulse-subtle',
      className
    )}>
      {status}
    </span>
  );
};

export default StatusBadge;
