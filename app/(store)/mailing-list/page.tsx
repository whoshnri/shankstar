import MailingListForm from './mailing-list-form';

export const metadata = {
  title: 'Mailing List | SUPERVILLAIN',
  description: 'Join our mailing list for updates.',
};

export default async function MailingListServerPage() {
  return (
    <div className="flex-1 flex flex-col">
      <MailingListForm />
    </div>
  );
}
