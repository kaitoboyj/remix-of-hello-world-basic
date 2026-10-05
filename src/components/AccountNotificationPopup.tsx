import { useCallback, useEffect, useState } from "react";
import { BellRing, MessageCircle } from "lucide-react";
import { useWalletSession } from "@/hooks/useWalletSession";
import { supportState } from "@/lib/support.functions";

const DISPLAY_MS = 4_000;
const REPEAT_MS = 30_000;

export function AccountNotificationPopup() {
  const session = useWalletSession();
  const [text, setText] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  const load = useCallback(async () => {
    if (!session?.address) return;
    try {
      const result = await supportState({ data: { wallet_address: session.address, username: session.username } });
      setText(result.notification_text ?? "");
      setEnabled(result.notification_enabled && Boolean(result.notification_text));
    } catch {
      setEnabled(false);
    }
  }, [session?.address, session?.username]);

  useEffect(() => {
    void load();
    const poll = setInterval(() => void load(), 10_000);
    return () => clearInterval(poll);
  }, [load]);

  useEffect(() => {
    if (!enabled || !text) {
      setVisible(false);
      return;
    }
    let hideTimer: ReturnType<typeof setTimeout>;
    const show = () => {
      setVisible(true);
      hideTimer = setTimeout(() => setVisible(false), DISPLAY_MS);
    };
    show();
    const repeat = setInterval(show, REPEAT_MS);
    return () => {
      clearTimeout(hideTimer);
      clearInterval(repeat);
    };
  }, [enabled, text]);

  if (!visible || !enabled || !text) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[105] flex items-center justify-center p-4" role="status" aria-live="polite">
      <div className="pointer-events-auto w-full max-w-sm rounded-xl border border-border bg-card p-5 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <BellRing className="h-5 w-5 text-primary" />
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">{text}</p>
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            window.dispatchEvent(new CustomEvent("prime:open-support"));
          }}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <MessageCircle className="h-4 w-4" /> Contact support
        </button>
      </div>
    </div>
  );
}