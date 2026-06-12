'use client';

import { useState } from 'react';
import { submitContactForm } from '@/lib/actions/submissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/lib/toast-context';
import { Loader2, CheckCircle2, Send } from 'lucide-react';

export default function ContactForm() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { addToast } = useToast();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);

    // Artificial delay to ensure loading state is visible and feels "interactive"
    const [result] = await Promise.all([
      submitContactForm(formData),
      new Promise(resolve => setTimeout(resolve, 800))
    ]);

    setIsPending(false);

    if (result.success) {
      setIsSuccess(true);
      addToast("Your message has been sent successfully.", "success");
    } else {
      addToast(result.error || "Failed to send message.", "error");
    }
  }

  if (isSuccess) {
    return (
      <main className="flex-1 p-8 md:p-12 lg:p-20 max-w-2xl mx-auto flex flex-col justify-center items-center text-center animate-fade-in w-full">
        <CheckCircle2 className="w-16 h-16 text-gray-400 mb-6" />
        <h1 className="text-4xl font-serif font-light mb-4 tracking-tight">Message Sent.</h1>
        <p className="text-lg text-muted-foreground font-light leading-relaxed">
          Thank you for reaching out. Franklyn will get back to you as soon as possible.
        </p>
        <Button 
          variant="link" 
          onClick={() => setIsSuccess(false)}
          className="mt-8 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          Send another message
        </Button>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8 md:p-12 lg:p-20 max-w-2xl mx-auto w-full animate-fade-in">
      <h1 className="text-4xl font-serif font-light mb-8 tracking-tight">Contact</h1>
      <p className="text-lg text-muted-foreground mb-12 font-light leading-relaxed">
        For inquiries regarding original paintings, signed prints, or commissions, please use the form below.
      </p>

      <form onSubmit={onSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2 group">
            <label htmlFor="name" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold transition-colors group-focus-within:text-foreground">
              Name
            </label>
            <Input 
              id="name"
              name="name"
              required
              disabled={isPending}
              placeholder="Your name"
              className="bg-transparent border-b border-t-0 border-x-0 border-border px-0 focus-visible:ring-0 focus-visible:border-foreground transition-all rounded-none h-12 text-lg placeholder:text-muted-foreground/30 disabled:opacity-50"
            />
          </div>

          <div className="space-y-2 group">
            <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold transition-colors group-focus-within:text-foreground">
              Email Address
            </label>
            <Input 
              id="email"
              name="email"
              type="email"
              required
              disabled={isPending}
              placeholder="your@email.com"
              className="bg-transparent border-b border-t-0 border-x-0 border-border px-0 focus-visible:ring-0 focus-visible:border-foreground transition-all rounded-none h-12 text-lg placeholder:text-muted-foreground/30 disabled:opacity-50"
            />
          </div>
        </div>

        <div className="space-y-2 group">
          <label htmlFor="subject" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold transition-colors group-focus-within:text-foreground">
            Subject
          </label>
          <Input 
            id="subject"
            name="subject"
            disabled={isPending}
            placeholder="Inquiry about..."
            className="bg-transparent border-b border-t-0 border-x-0 border-border px-0 focus-visible:ring-0 focus-visible:border-foreground transition-all rounded-none h-12 text-lg placeholder:text-muted-foreground/30 disabled:opacity-50"
          />
        </div>

        <div className="space-y-2 group">
          <label htmlFor="message" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold transition-colors group-focus-within:text-foreground">
            Message
          </label>
          <Textarea 
            id="message"
            name="message"
            required
            rows={5}
            disabled={isPending}
            placeholder="Your message here..."
            className="bg-transparent border-b border-t-0 border-x-0 border-border px-0 focus-visible:ring-0 focus-visible:border-foreground transition-all rounded-none resize-none min-h-[150px] text-lg placeholder:text-muted-foreground/30 disabled:opacity-50"
          />
        </div>

        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-foreground text-background hover:bg-foreground/90 py-8 text-sm uppercase tracking-[0.3em] font-bold rounded-none transition-all group overflow-hidden"
        >
          {isPending ? (
            <div className="flex items-center gap-3">
              <Loader2 className="animate-spin h-5 w-5" />
            </div>
          ) : (
            <span className="flex items-center gap-2">
              Send Message
            </span>
          )}
        </Button>
      </form>

      <div className="mt-20 pt-12 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-4">Studio</h3>
          <p className="text-sm font-light leading-relaxed">
            By Appointment Only<br />
            Richmond, Virginia
          </p>
        </div>
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-4">Email</h3>
          <p className="text-sm font-light leading-relaxed">
            studio@supervillain.com
          </p>
        </div>
      </div>
    </main>
  );
}
