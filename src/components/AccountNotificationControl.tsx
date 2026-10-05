import { useEffect, useState } from "react";
import { BellRing, Check, Loader2, Trash2 } from "lucide-react";
import { supportSetSettings, supportThread } from "@/lib/support.functions";

export function AccountNotificationControl({ address }: { address: string }) {
  const [text, setText] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    supportThread({ data: { wallet_address: address } })
      .then((result) => {
        if (cancelled) return;
        setText(result.notification_text ?? "");
        setEnabled(result.notification_enabled);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [address]);

  async function save(nextEnabled: boolean) {
    const message = text.trim();
    if (nextEnabled && !message) {
      setError("Enter the notification text first.");
      return;
    }
    setBusy(true);
    setSaved(false);
    setError("");
    try {
      await supportSetSettings({
        data: {
          wallet_address: address,
          notification_enabled: nextEnabled,
          notification_text: nextEnabled ? message : null,
        },
      });
      setEnabled(nextEnabled);
      if (!nextEnabled) setText("");
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save notification.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2">
        <BellRing className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Account notification</span>
        {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        {saved && <Check className="h-3.5 w-3.5 text-success" />}
        <span className="ml-auto text-[11px] text-muted-foreground">{enabled ? "Active" : "Off"}</span>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        The user sees this message for 4 seconds every 30 seconds until it is removed.
      </p>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={3}
        maxLength={500}
        placeholder="Write the notification shown to this user"
        className="mt-3 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || !text.trim()}
          onClick={() => void save(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
        >
          <BellRing className="h-3.5 w-3.5" /> {enabled ? "Update notification" : "Add notification"}
        </button>
        <button
          type="button"
          disabled={busy || !enabled}
          onClick={() => void save(false)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" /> Remove
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}