'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { makeItPrivateAction } from '@/app/(private)/dashboard/[slug]/_components/make-it-private/actions';
import { useContext } from 'react';
import { Context } from '@/app/(private)/dashboard/[slug]/context';

export default function MakeItPrivate() {
  const { slug } = useContext(Context) as Context;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Make it private</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => await makeItPrivateAction(slug)}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
