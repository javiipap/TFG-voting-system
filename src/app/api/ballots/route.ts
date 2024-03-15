import { createBallot } from '@/db/helpers';
import { NextResponse, NextRequest } from 'next/server';
import AJV from 'ajv';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  const ajv = new AJV();

  const schema = {
    type: 'object',
    properties: {
      slug: { type: 'string' },
      name: { type: 'string' },
      description: { type: 'string' },
      scope: { type: 'string' },
      startTime: { type: 'number' },
      endTime: { type: 'number' },
    },
    required: ['slug', 'name', 'description', 'scope', 'startTime', 'endTime'],
  };

  if (!ajv.validate(schema, body)) {
    return NextResponse.json({ message: ajv.errors }, { status: 400 });
  }

  if (body.startTime > body.endTime) {
    return NextResponse.json(
      { message: 'Start time must be before end time' },
      { status: 400 }
    );
  }

  const ballot = await createBallot(body);

  if (!ballot.length) {
    return NextResponse.json(
      { message: 'Failed to create ballot' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: 'Ballot created', data: { slug: ballot[0].slug } },
    { status: 200 }
  );
}
