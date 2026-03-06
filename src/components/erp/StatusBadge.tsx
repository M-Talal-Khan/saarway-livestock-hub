import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  'Active': 'bg-blue-100 text-blue-800 border-blue-200',
  'Fattening': 'bg-orange-100 text-orange-800 border-orange-200',
  'Ready for Sale': 'bg-green-100 text-green-800 border-green-200',
  'Listed': 'bg-purple-100 text-purple-800 border-purple-200',
  'Sold': 'bg-gray-100 text-gray-600 border-gray-200',
  'Slaughtered': 'bg-red-100 text-red-900 border-red-200',
  'Dead': 'bg-gray-900 text-white border-gray-900',
  'Finalised': 'bg-green-100 text-green-800 border-green-200',
  'Draft': 'bg-amber-100 text-amber-800 border-amber-200',
  'Live Sale': 'bg-blue-100 text-blue-800 border-blue-200',
  'Slaughter': 'bg-red-100 text-red-800 border-red-200',
  'Recovered': 'bg-green-100 text-green-800 border-green-200',
  'Ongoing': 'bg-amber-100 text-amber-800 border-amber-200',
  'Died': 'bg-gray-900 text-white border-gray-900',
  'Completed': 'bg-green-100 text-green-800 border-green-200',
  'Scheduled': 'bg-gray-100 text-gray-600 border-gray-200',
  'Upcoming': 'bg-amber-100 text-amber-800 border-amber-200',
  'Overdue': 'bg-red-100 text-red-800 border-red-200',
  'Paid': 'bg-green-100 text-green-800 border-green-200',
  'Unpaid': 'bg-amber-100 text-amber-800 border-amber-200',
  'Owned': 'bg-blue-100 text-blue-800 border-blue-200',
  'Inactive': 'bg-gray-100 text-gray-500 border-gray-200',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
  pulse?: boolean;
}

const StatusBadge = ({ status, className, pulse }: StatusBadgeProps) => {
  const colors = statusColors[status] || 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      colors,
      pulse && 'animate-pulse',
      className
    )}>
      {status}
    </span>
  );
};

export default StatusBadge;
