'use client';

import { Button } from '@/components/ui/button';
import { useFormState } from 'react-dom';
import { authenticate } from '@/app/(public)/login/_actions';

export default function LoginForm() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);

  return (
    <form action={dispatch} className="space-y-3">
      <div className="flex justify-center">
        <Button className="" type="submit">
          <GoogleIcon className="h-4 w-4 mr-2" />
          Google
        </Button>
      </div>
    </form>
  );
}

const GoogleIcon = ({ className }: React.HTMLProps<SVGGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 488 512"
      className={className}
    >
      <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
    </svg>
  );
};
