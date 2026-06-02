import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneCall, Plus, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useSecureway, addContact, removeContact } from "@/lib/secureway-store";

export const Route = createFileRoute("/app/contacts")({
  head: () => ({ meta: [{ title: "Contacts · SecureWay" }] }),
  component: ContactsPage,
});

const tints = ["bg-violet/15 text-violet", "bg-info/15 text-info", "bg-warn/20 text-warn-foreground", "bg-safe/20 text-safe-foreground", "bg-emergency/10 text-emergency"];

function ContactsPage() {
  const { contacts } = useSecureway();
  const [open, setOpen] = useState(false);

  return (
    <AppShell title="Emergency contacts">
      <p className="text-sm text-muted-foreground">These people will be notified instantly when you trigger an SOS.</p>

      <div className="mt-6 space-y-3">
        {contacts.map((c, i) => (
          <div key={c.id} className="flex items-center gap-4 rounded-2xl bg-card border border-border p-4 shadow-card">
            <div className={`size-12 rounded-2xl grid place-items-center font-display text-lg font-semibold ${tints[i % tints.length]}`}>
              {c.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{c.name}</p>
              <p className="text-sm text-muted-foreground truncate">{c.phone} · {c.relation}</p>
            </div>
            <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="size-10 rounded-full bg-safe text-safe-foreground grid place-items-center">
              <PhoneCall className="size-4" />
            </a>
            <button onClick={() => { void removeContact(c.id); }} className="size-10 rounded-full bg-muted text-muted-foreground grid place-items-center hover:bg-emergency/10 hover:text-emergency">
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        {contacts.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">No contacts yet. Add your trusted circle.</p>
        )}
      </div>

      <button
        onClick={() => setOpen(true)}
        className="mt-6 w-full rounded-full bg-gradient-emergency text-primary-foreground py-3.5 font-semibold shadow-sos inline-flex items-center justify-center gap-2"
      >
        <Plus className="size-5" /> Add contact
      </button>

      {open && <AddContactModal onClose={() => setOpen(false)} />}
    </AppShell>
  );
}

function AddContactModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("Friend");

  return (
    <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm grid place-items-end sm:place-items-center p-0 sm:p-5">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim() || !phone.trim()) return;
          try {
            await addContact({ name, phone, relation });
            onClose();
          } catch (err) {
            console.error("Add contact failed", err);
          }
        }}
        className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl p-6 shadow-card animate-in slide-in-from-bottom-10 duration-200"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add contact</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-muted"><X className="size-5" /></button>
        </div>
        <div className="mt-4 space-y-3">
          <Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Mom" /></Field>
          <Field label="Phone"><input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="+91 98765 43210" /></Field>
          <Field label="Relation">
            <select value={relation} onChange={(e) => setRelation(e.target.value)} className="input">
              {["Family", "Friend", "Partner", "Colleague", "Other"].map((r) => <option key={r}>{r}</option>)}
            </select>
          </Field>
        </div>
        <button className="mt-6 w-full rounded-full bg-foreground text-background py-3 font-medium">Save contact</button>
        <style>{`.input{width:100%;border-radius:1rem;border:1px solid var(--input);background:var(--card);padding:.85rem 1rem;font-size:1rem;outline:none}.input:focus{box-shadow:0 0 0 2px var(--ring)}`}</style>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm font-medium">{label}</span><div className="mt-1.5">{children}</div></label>;
}
