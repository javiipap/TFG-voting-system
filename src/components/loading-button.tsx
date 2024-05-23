import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2Icon } from 'lucide-react';

export default function LoadingButton({ children, ...props }: ButtonProps) {
  return (
    <Button {...props}>
      <>
        {props.disabled && <Loader2Icon className="animate-spin mr-2" />}
        {children}
      </>
    </Button>
  );
}
