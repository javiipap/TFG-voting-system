import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Title from '../../components/Title';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { auth } from '@/auth';
import { getElection, getConnection } from '@/db/helpers';
import * as schema from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { authorizeGroup } from './_actions';
import { redirect } from 'next/navigation';
import { PublicOverlay } from '../_components/PublicOverlay';

export default async function AuthorizedGroupsLayout({
  params,
}: {
  params: { slug: string };
}) {
  const session = await auth();
  const { db, client } = getConnection();

  const election = await getElection(params.slug);

  if (!election) {
    redirect('/404');
  }

  const allGroups = await db
    .select()
    .from(schema.userGroups)
    .where(eq(schema.userGroups.adminId, session?.user.adminId!))
    .leftJoin(
      schema.authorizedGroups,
      and(
        eq(schema.authorizedGroups.groupId, schema.userGroups.id),
        eq(schema.authorizedGroups.electionId, election.id)
      )
    );

  await client.end();

  return (
    <PublicOverlay slug={params.slug} preFetchedElection={election}>
      <Title>Groups</Title>
      <form className="flex gap-4 w-1/2 mb-8" action={authorizeGroup}>
        <Select name="group" required>
          <SelectTrigger>
            <SelectValue placeholder="Select a group" />
          </SelectTrigger>
          <SelectContent>
            {allGroups
              .filter((group) => !group.authorized_groups?.id)
              .map(({ user_groups }) => (
                <SelectItem
                  key={user_groups.id}
                  value={user_groups.id.toString()}
                >
                  {user_groups.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="electionId" value={election.id} />
        <input type="hidden" name="electionSlug" value={election.slug} />
        <Button type="submit">Add</Button>
      </form>
      <div className="border shadow-sm rounded-lg">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allGroups
              .filter((group) => group.authorized_groups?.id)
              .map(({ user_groups }) => (
                <TableRow key={user_groups.id}>
                  <TableCell>{user_groups.id}</TableCell>
                  <TableCell>{user_groups.name}</TableCell>
                  <TableCell>{user_groups.description}</TableCell>
                  <TableCell>
                    <Button variant="link" className="p-0 text-red-600">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </PublicOverlay>
  );
}
