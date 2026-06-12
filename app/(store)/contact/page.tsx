import ContactForm from './contact-form';

export const metadata = {
  title: 'Contact | SUPERVILLAIN',
  description: 'Get in touch for inquiries.',
};

export default async function ContactServerPage() {
  return (
    <div className="flex-1 flex flex-col">
      <ContactForm />
    </div>
  );
}
