'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, MessageSquare } from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';
import { getContactFormSubmissions, deleteContactSubmission } from '@/lib/actions/submissions';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/lib/toast-context';
import { ContactSubmission } from '@/app/generated/prisma/client';

type Submission = ContactSubmission[] | null

export default function ContactsAdminPage() {
  const [submissions, setSubmissions] = useState<Submission>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  const loadSubmissions = async () => {
    try {
      const data = await getContactFormSubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to load contact submissions', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteContactSubmission(id);
      if (result.success) {
        addToast("Submission deleted.", "success");
        await loadSubmissions();
      } else {
        addToast(result.error || "Failed to delete submission.", "error");
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
          <h1 className="text-3xl font-light mb-1">Contact Submissions</h1>
          <p className="text-sm text-muted-foreground">
            Manage inquiries from your contact form
          </p>
        </div>
      </div>

      <div className="border border-border rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-foreground">
            <thead className="border-b border-border bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left font-medium">From</th>
                <th className="px-4 py-3 text-left font-medium">Subject</th>
                <th className="px-4 py-3 text-left font-medium">Message</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!submissions || submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    No submissions found.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{sub.name}</p>
                        <p className="text-xs text-muted-foreground">{sub.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{sub.subject || 'No Subject'}</td>
                    <td className="px-4 py-3">
                      <p className="max-w-xs truncate text-muted-foreground" title={sub.message}>
                        {sub.message}
                      </p>
                    </td>
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
        title="Delete Submission"
        description="Are you sure you want to delete this contact submission?"
      />
    </div>
  );
}
