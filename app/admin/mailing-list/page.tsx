'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Mail } from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';
import { getMailingList, deleteMailingListEntry } from '@/lib/actions/submissions';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/lib/toast-context';

type Subscriber = Awaited<ReturnType<typeof getMailingList>>[number];

export default function MailingListAdminPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  const loadSubscribers = async () => {
    try {
      const data = await getMailingList();
      setSubscribers(data);
    } catch (err) {
      console.error('Failed to load mailing list', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteMailingListEntry(id);
      if (result.success) {
        addToast("Subscriber removed.", "success");
        await loadSubscribers();
      } else {
        addToast(result.error || "Failed to remove subscriber.", "error");
      }
      setDeleteId(null);
    });
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light mb-1">Mailing List</h1>
          <p className="text-sm text-muted-foreground">
            Manage your email subscribers ({subscribers.length} total)
          </p>
        </div>
      </div>

      <div className="border border-border rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-foreground">
            <thead className="border-b border-border bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Joined</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                    No subscribers found.
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{sub.name || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{sub.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(sub.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setDeleteId(sub.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-sm transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={deleteId !== null}
        onConfirm={() => {
          if (deleteId) {
            handleDelete(deleteId);
          }
        }}
        onCancel={() => setDeleteId(null)}
        title="Remove Subscriber"
        description="Are you sure you want to remove this email from your mailing list?"
      />
    </div>
  );
}
