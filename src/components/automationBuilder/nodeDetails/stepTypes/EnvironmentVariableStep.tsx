import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { StepProps } from "./types";

export function EnvironmentVariableStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "environmentVariable") return null;

  return (
    <div className="space-y-4">
      {/* Operation */}
      <div className="space-y-2">
        <Label className="text-xs">Operation</Label>
        <Select
          value={step.operation || "get"}
          onValueChange={(value) =>
            onUpdate(id, "update", { step: { ...step, operation: value as "get" | "set" } })
          }
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="get">Get Variable</SelectItem>
            <SelectItem value="set">Set Variable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Variable Name */}
      <div className="space-y-2">
        <Label className="text-xs">Environment Variable Name</Label>
        <Input
          value={step.variableName || ""}
          placeholder="PATH"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, variableName: e.target.value } })
          }
          className="text-xs font-mono"
        />
      </div>

      {/* Value (for set) */}
      {step.operation === "set" && (
        <div className="space-y-2">
          <Label className="text-xs">Value</Label>
          <Input
            value={step.value || ""}
            placeholder="value"
            onChange={(e) => onUpdate(id, "update", { step: { ...step, value: e.target.value } })}
            className="text-xs"
          />
          <p className="text-xs text-gray-500">
            Supports variables: {"{"}varName{"}"}
          </p>
        </div>
      )}

      {/* Store Result (for get) */}
      {step.operation === "get" && (
        <div className="space-y-2">
          <Label className="text-xs">Store Result As Variable</Label>
          <Input
            value={step.storeKey || ""}
            placeholder="envValue"
            onChange={(e) =>
              onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })
            }
            className="text-xs"
          />
        </div>
      )}
    </div>
  );
}
