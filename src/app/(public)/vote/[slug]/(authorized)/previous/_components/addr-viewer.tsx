import { Copy } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function AddrViewer({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex gap-2 items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="border rounded-md truncate py-2 px-4 font-mono">
              <span>{title}: </span>
              {value}
            </p>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-mono">{value}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div
        className="border rounded self-stretch flex items-center px-1 cursor-pointer"
        onClick={() => {
          navigator.clipboard.writeText(`${value}`);
        }}
      >
        <Copy className="w-5" />
      </div>
    </div>
  );
}
