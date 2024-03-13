const variants = {
  pending: {
    badge: 'text-blue-400 border-blue-400 bg-blue-100 hover:bg-blue-200',
    label: 'Pending',
    circle: 'bg-blue-400',
  },
  open: {
    badge: 'text-green-400 border-green-400 bg-green-100 hover:bg-green-200',
    label: 'Open',
    circle: 'bg-green-400',
  },
  closed: {
    badge: 'text-red-400 border-red-400 bg-red-100 hover:bg-red-200',
    label: 'Closed',
    circle: 'bg-red-400',
  },
};

export interface StatusBadgeProps {
  variant: keyof typeof variants;
}

function StatusBadge({ variant }: StatusBadgeProps) {
  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant].badge}`}
    >
      <div
        className={`h-2 w-2 rounded-full mr-1 ${variants[variant].circle}`}
      />
      {variants[variant].label}
    </div>
  );
}

export { StatusBadge };
