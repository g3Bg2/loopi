import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { Switch } from "../../../ui/switch";
import { StepProps } from "./types";

export function SendEmailStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "sendEmail") return null;

  return (
    <div className="space-y-4">
      {/* SMTP Host */}
      <div className="space-y-2">
        <Label className="text-xs">SMTP Host</Label>
        <Input
          value={step.smtpHost || ""}
          placeholder="smtp.gmail.com"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, smtpHost: e.target.value } })}
          className="text-xs"
        />
      </div>

      {/* SMTP Port */}
      <div className="space-y-2">
        <Label className="text-xs">SMTP Port</Label>
        <Input
          value={step.smtpPort || 587}
          type="number"
          placeholder="587"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, smtpPort: parseInt(e.target.value) || 587 } })
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

      {/* From */}
      <div className="space-y-2">
        <Label className="text-xs">From</Label>
        <Input
          value={step.from || ""}
          placeholder="sender@example.com"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, from: e.target.value } })}
          className="text-xs"
        />
      </div>

      {/* To */}
      <div className="space-y-2">
        <Label className="text-xs">To</Label>
        <Input
          value={step.to || ""}
          placeholder="recipient@example.com"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, to: e.target.value } })}
          className="text-xs"
        />
        <p className="text-xs text-gray-500">
          Supports variables: {"{"}recipientEmail{"}"}
        </p>
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <Label className="text-xs">Subject</Label>
        <Input
          value={step.subject || ""}
          placeholder="Email subject"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, subject: e.target.value } })}
          className="text-xs"
        />
      </div>

      {/* Body */}
      <div className="space-y-2">
        <Label className="text-xs">Body</Label>
        <Textarea
          value={step.body || ""}
          placeholder="Email message body"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, body: e.target.value } })}
          className="text-xs min-h-24"
        />
        <p className="text-xs text-gray-500">
          Supports variables: {"{"}varName{"}"}
        </p>
      </div>

      {/* HTML */}
      <div className="flex items-center space-x-2">
        <Switch
          checked={step.html || false}
          onCheckedChange={(checked) =>
            onUpdate(id, "update", { step: { ...step, html: checked } })
          }
        />
        <Label className="text-xs">Send as HTML</Label>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 p-3 rounded border border-blue-200">
        <p className="text-xs font-semibold mb-1">📦 Dependencies Required</p>
        <p className="text-xs text-blue-800">
          Install nodemailer: npm install nodemailer @types/nodemailer
        </p>
      </div>
    </div>
  );
}
