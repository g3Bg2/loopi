import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { StepProps } from "./types";

export function ScreenshotStep({ step, id, onUpdate }: StepProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">Filename</Label>
      <Input
        type="text"
        value={step.value || ""}
        placeholder="filename"
        onChange={(e) => onUpdate(id, "update", { step: { ...step, value: e.target.value } })}
        className="text-xs"
      />
    </div>
  );
}
