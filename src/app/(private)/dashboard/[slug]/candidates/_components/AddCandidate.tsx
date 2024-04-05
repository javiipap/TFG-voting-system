'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { submitCandidate } from '../_actions';
import { ChangeEvent, useRef, useState } from 'react';

export default function AddCandidate({ slug }: { slug: string }) {
  const [selectedImage, setSelectedImage] = useState<File>();
  const formRef = useRef<HTMLFormElement>(null);

  const imageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImage(e.target.files[0]);
    }
  };

  return (
    <div>
      <form
        ref={formRef}
        action={async (formData) => {
          await submitCandidate(formData);
          formRef.current?.reset();
        }}
        className="space-y-2 [&>div]:space-y-1"
      >
        <div>
          <Label>Name</Label>
          <Input name="name" />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea name="description" />
        </div>
        <div>
          <Label htmlFor="picture">Picture</Label>
          <Input name="img" id="picture" type="file" onChange={imageChange} />
        </div>
        {!!selectedImage && (
          <img
            src={URL.createObjectURL(selectedImage)}
            className="h-40"
            alt="Thumb"
          />
        )}
        <input type="hidden" name="slug" value={slug} />
        <Button type="submit">Create</Button>
      </form>
    </div>
  );
}
