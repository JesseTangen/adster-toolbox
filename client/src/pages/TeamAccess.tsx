import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { headerLogoSrc } from "@/lib/headerLogo";
import { trpc } from "@/lib/trpc";
import { verifyTeamAccessCode } from "@/lib/teamAccess";
import { KeyRound, LockKeyhole, ShieldAlert } from "lucide-react";
import { FormEvent, useState } from "react";

export default function TeamAccess({ onGranted }: { onGranted: () => void }) {
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const verifyAccess = trpc.teamAccess.verify.useMutation();
  const isStaticExport = import.meta.env.BASE_URL !== "/";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessCode.trim()) {
      setError("Enter the team access code to continue.");
      return;
    }

    setError("");
    if (isStaticExport) {
      if (!await verifyTeamAccessCode(accessCode)) {
        setError("That access code is not recognized. Please check with the team.");
        return;
      }
      onGranted();
      return;
    }
    try {
      await verifyAccess.mutateAsync({ code: accessCode });
    } catch {
      setError("That access code is not recognized. Please check with the team.");
      return;
    }

    onGranted();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5fbfe] px-5 py-8 dark:bg-background sm:grid sm:place-items-center sm:p-8">
      <div className="absolute -left-20 top-[-5rem] h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute -bottom-28 right-[-4rem] h-80 w-80 rounded-full bg-[#18354e]/10 blur-3xl dark:bg-primary/10" />
      <section className="relative mx-auto w-full max-w-md rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_34px_90px_-48px_rgba(14,55,83,0.7)] backdrop-blur-sm dark:border-border dark:bg-card/90 dark:shadow-[0_34px_90px_-48px_rgba(0,0,0,0.9)] sm:p-8">
        <div className="flex items-center gap-3">
          <img src={headerLogoSrc} alt="Adster Creative" className="h-10 w-10 rounded-xl object-contain" />
          <div><p className="font-editorial text-xl leading-none tracking-tight">Adster Creative Toolbox</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.13em] text-muted-foreground">Team workspace</p></div>
        </div>
        <div className="mt-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><LockKeyhole className="h-5 w-5" /></div>
        <p className="mt-5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-primary">Team access</p>
        <h1 className="mt-2 font-editorial text-3xl leading-tight tracking-tight">Enter the shared workspace</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">This Toolbox is reserved for the Adster team. Enter the shared access code to open the strategist modules for this browser session.</p>

        <form onSubmit={submit} className="mt-7 space-y-3">
          <label className="block text-xs font-medium" htmlFor="team-access-code">Team access code</label>
          <Input id="team-access-code" type="password" autoComplete="current-password" value={accessCode} onChange={event => setAccessCode(event.target.value)} aria-describedby={error ? "access-error" : "access-notice"} className="h-11 rounded-xl bg-white dark:bg-background" placeholder="Enter the shared code" />
          {error ? <p id="access-error" role="alert" className="text-xs leading-5 text-destructive">{error}</p> : null}
          <Button type="submit" disabled={verifyAccess.isPending} className="h-11 w-full gap-2 rounded-xl"><KeyRound className="h-4 w-4" />{verifyAccess.isPending ? "Checking access…" : "Open Toolbox"}</Button>
        </form>
      </section>
    </main>
  );
}
