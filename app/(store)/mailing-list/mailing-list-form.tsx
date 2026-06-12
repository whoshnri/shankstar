'use client';

import { useState } from 'react';
import { subscribeToMailingList } from '@/lib/actions/submissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/lib/toast-context';
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function MailingListForm() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { addToast } = useToast();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    
    const formData = new FormData(e.currentTarget);
    
    // Artificial delay to ensure loading state is visible and feels "interactive"
    const [result] = await Promise.all([
      subscribeToMailingList(formData),
      new Promise(resolve => setTimeout(resolve, 800))
    ]);
    
    setIsPending(false);

    if (result.success) {
      setIsSuccess(true);
      addToast("Successfully subscribed to the mailing list.", "success");
    } else {
      addToast(result.error || "Failed to subscribe.", "error");
    }
  }

  if (isSuccess) {
    return (
      <main className="flex-1 p-8 md:p-12 lg:p-20 max-w-2xl mx-auto flex flex-col justify-center items-center text-center animate-fade-in">
        <CheckCircle2 className="w-16 h-16 text-gray-400 mb-6" />
        <h1 className="text-4xl font-serif font-light mb-4 tracking-tight">You're on the list.</h1>
        <p className="text-lg text-muted-foreground font-light leading-relaxed">
          Thank you for joining. We'll be in touch soon with new works and updates.
        </p>
        <Button 
          variant="link" 
          onClick={() => setIsSuccess(false)}
          className="mt-8 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          Subscribe another email
        </Button>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8 md:p-12 lg:p-20 max-w-2xl mx-auto flex flex-col justify-center w-full">
      <h1 className="text-4xl font-serif font-light mb-8 tracking-tight">Mailing List</h1>
      <p className="text-lg text-muted-foreground mb-12 font-light leading-relaxed">
        Join the mailing list to receive updates on new works, upcoming exhibitions, and exclusive prints.
      </p>

      <form onSubmit={onSubmit} className="space-y-10">
        <div className="space-y-4">
          <div className="space-y-2 group">
            <label htmlFor="name" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold transition-colors group-focus-within:text-foreground">
              Name
            </label>
            <Input 
              id="name"
              name="name"
              placeholder="Your name"
              disabled={isPending}
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

        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-foreground text-background hover:bg-foreground/90 py-8 text-sm uppercase tracking-[0.3em] font-bold rounded-none transition-all group overflow-hidden relative"
        >
          {isPending ? (
            <div className="flex items-center gap-3">
              <Loader2 className="animate-spin h-5 w-5" />
            </div>
          ) : (
            <span className="flex items-center gap-2">
              Subscribe
            </span>
          )}
        </Button>
      </form>
    </main>
  );
}
