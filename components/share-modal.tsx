"use client";

import { Copy, Share2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { FaFacebook, FaTwitter, FaWhatsapp, FaInstagram } from "react-icons/fa";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useState } from "react";
enum ShareVariant {
  COPY_LINK = "copy_link",
  FACEBOOK = "facebook",
  TWITTER = "twitter",
  WHATSAPP = "whatsapp",
  INSTAGRAM = "instagram",
}

export default function ShareModal({ slug }: { slug: string }) {
  const [isCopied, setIsCopied] = useState(false);

  const itemUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${slug}`;

  const handleShareVariants = (variant: ShareVariant) => {
    switch (variant) {
      case ShareVariant.COPY_LINK:
        window.navigator.clipboard.writeText(itemUrl);
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 3000);
        break;
      case ShareVariant.FACEBOOK:
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${itemUrl}`,
          "_blank",
        );
        break;
      case ShareVariant.TWITTER:
        window.open(
          `https://twitter.com/intent/tweet?url=${itemUrl}`,
          "_blank",
        );
        break;
      case ShareVariant.WHATSAPP:
        window.open(`https://wa.me/?text=${itemUrl}`, "_blank");
        break;
      case ShareVariant.INSTAGRAM:
        window.open(
          `https://www.instagram.com/share/?url=${itemUrl}`,
          "_blank",
        );
        break;
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="p-4 border hover:bg-gray-300/50">
        <Share2 />
      </DialogTrigger>
      <DialogContent className="rounded-none">
        <DialogHeader>
          <DialogTitle>Share this item</DialogTitle>
        </DialogHeader>

        <div>
          <div className="grid gap-2">
            <Button
              variant={"outline"}
              onClick={() => handleShareVariants(ShareVariant.COPY_LINK)}
            >
              {!isCopied ? (
                <>
                  {" "}
                  <Copy />
                  Copy Link
                </>
              ) : (
                <>
                  <Check />
                  Link Copied
                </>
              )}
            </Button>
            <Button
              variant={"outline"}
              onClick={() => handleShareVariants(ShareVariant.FACEBOOK)}
            >
              <FaFacebook />
              Share on Facebook
            </Button>
            <Button
              variant={"outline"}
              onClick={() => handleShareVariants(ShareVariant.TWITTER)}
            >
              <FaTwitter />
              Share on Twitter
            </Button>
            <Button
              variant={"outline"}
              onClick={() => handleShareVariants(ShareVariant.WHATSAPP)}
            >
              <FaWhatsapp />
              Share on WhatsApp
            </Button>
            <Button
              variant={"outline"}
              onClick={() => handleShareVariants(ShareVariant.INSTAGRAM)}
            >
              <FaInstagram />
              Share on Instagram
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
