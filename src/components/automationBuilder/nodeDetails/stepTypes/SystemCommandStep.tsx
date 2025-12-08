import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { StepProps } from "./types";

export function SystemCommandStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "systemCommand") return null;

  return (
    <div className="space-y-4">
      {/* Command */}
      <div className="space-y-2">
        <Label className="text-xs">Command</Label>
        <Input
          value={step.command || ""}
          placeholder="ls"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, command: e.target.value } })}
          className="text-xs font-mono"
        />
        <p className="text-xs text-gray-500">
          Shell command to execute. Supports variables: {"{"}varName{"}"}
        </p>
      </div>

      {/* Arguments */}
      <div className="space-y-2">
        <Label className="text-xs">Arguments (optional)</Label>
        <Textarea
          value={step.args?.join("\n") || ""}
          placeholder="-la&#10;/home"
          onChange={(e) =>
            onUpdate(id, "update", {
              step: { ...step, args: e.target.value.split("\n").filter(Boolean) },
            })
          }
          className="text-xs min-h-20 font-mono"
        />
        <p className="text-xs text-gray-500">
          One argument per line. Supports variables.
        </p>
      </div>

      {/* Working Directory */}
      <div className="space-y-2">
        <Label className="text-xs">Working Directory (optional)</Label>
        <Input
          value={step.workingDirectory || ""}
          placeholder="/home/user"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, workingDirectory: e.target.value } })
          }
          className="text-xs"
        />
      </div>

      {/* Store Output */}
      <div className="space-y-2">
        <Label className="text-xs">Store Output As Variable</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="commandOutput"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>

      {/* Store Exit Code */}
      <div className="space-y-2">
        <Label className="text-xs">Store Exit Code As Variable (optional)</Label>
        <Input
          value={step.storeExitCode || ""}
          placeholder="exitCode"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, storeExitCode: e.target.value } })
          }
          className="text-xs"
        />
      </div>

      {/* Warning */}
      <div className="bg-amber-50 p-3 rounded border border-amber-200">
        <p className="text-xs font-semibold mb-1">⚠️ Security Warning</p>
        <p className="text-xs text-amber-800">
          Be careful when executing system commands. Validate all inputs to prevent command injection.
        </p>
      </div>
    </div>
  );
}
