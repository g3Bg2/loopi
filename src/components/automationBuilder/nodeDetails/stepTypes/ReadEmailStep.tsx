import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Switch } from "../../../ui/switch";
import { StepProps } from "./types";

export function ReadEmailStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "readEmail") return null;

  return (
    <div className="space-y-4">
      {/* IMAP Host */}
      <div className="space-y-2">
        <Label className="text-xs">IMAP Host</Label>
        <Input
          value={step.imapHost || ""}
          placeholder="imap.gmail.com"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, imapHost: e.target.value } })}
          className="text-xs"
        />
      </div>

      {/* IMAP Port */}
      <div className="space-y-2">
        <Label className="text-xs">IMAP Port</Label>
        <Input
          value={step.imapPort || 993}
          type="number"
          placeholder="993"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, imapPort: parseInt(e.target.value) || 993 } })
          }
          className="text-xs"
        />
      </div>

      {/* Username */}
      <div className="space-y-2">
        <Label className="text-xs">Username</Label>
        <Input
          value={step.username || ""}
          placeholder="user@example.com"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, username: e.target.value } })}
          className="text-xs"
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label className="text-xs">Password</Label>
        <Input
          value={step.password || ""}
          type="password"
          placeholder="Use {{emailPassword}} variable"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, password: e.target.value } })}
          className="text-xs"
        />
      </div>

      {/* Mailbox */}
      <div className="space-y-2">
        <Label className="text-xs">Mailbox (optional)</Label>
        <Input
          value={step.mailbox || "INBOX"}
          placeholder="INBOX"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, mailbox: e.target.value } })}
          className="text-xs"
        />
      </div>

      {/* Store Result */}
      <div className="space-y-2">
        <Label className="text-xs">Store Emails As Variable</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="emails"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>

      {/* Mark as Read */}
      <div className="flex items-center space-x-2">
        <Switch
          checked={step.markAsRead || false}
          onCheckedChange={(checked) =>
            onUpdate(id, "update", { step: { ...step, markAsRead: checked } })
          }
        />
        <Label className="text-xs">Mark emails as read</Label>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 p-3 rounded border border-blue-200">
        <p className="text-xs font-semibold mb-1">📦 Dependencies Required</p>
        <p className="text-xs text-blue-800">
          Install imap: npm install imap @types/imap
        </p>
      </div>
    </div>
  );
}
