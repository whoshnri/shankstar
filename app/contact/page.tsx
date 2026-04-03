'use client';

import { useState, useTransition } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/toast-context';

export default function ContactPage() {
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      // Placeholder — wire to an email service or server action when ready
      await new Promise((r) => setTimeout(r, 600));
      addToast('Message sent. We\'ll be in touch shortly.', 'success');
      setForm({ name: '', email: '', subject: '', message: '' });
    });
  };

  const inputClass =
    'w-full px-4 py-3 border border-border rounded-sm text-sm bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header categories={[]} />
      <main className="flex-1 max-w-2xl mx-auto px-4 md:px-6 py-16 md:py-24 w-full">
        <h1 className="text-3xl md:text-4xl font-light mb-2">Contact Us</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Have a question or need help? Fill out the form and we&apos;ll get back to you within 1–2 business days.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Subject</label>
            <select
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="" disabled>Select a topic</option>
              <option value="order">Order enquiry</option>
              <option value="return">Return or refund</option>
              <option value="shipping">Shipping question</option>
              <option value="product">Product question</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="How can we help?"
              required
              rows={6}
              className={`${inputClass} resize-none`}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-primary-foreground hover:opacity-90"
          >
            {isPending ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
