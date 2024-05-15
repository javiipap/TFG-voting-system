import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Title from '@/app/(private)/dashboard/_components/title';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import GroupForm from './group-form';
import { getAvailableGroups } from '@/data-access/groups';
import { PublicOverlay } from '@/app/(private)/dashboard/[slug]/_components/public-overlay';

export default async function AuthorizedGroupsLayout({
  params,
}: {
  params: { slug: string };
}) {
  const { user } = (await auth())!;
  const groups = await getAvailableGroups(user.adminId, params.slug);

  return (
    <PublicOverlay>
      <Title>Groups</Title>
      <GroupForm groups={groups} />
      {groups.length > 0 ? (
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
              {groups
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
      ) : (
        <p>No hay grupos configurados</p>
      )}
    </PublicOverlay>
  );
}
