import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Textarea } from "../../../ui/textarea";
import { StepProps } from "./types";

export function FileSystemStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "fileSystem") return null;

  return (
    <div className="space-y-4">
      {/* Operation Selection */}
      <div className="space-y-2">
        <Label className="text-xs">Operation</Label>
        <Select
          value={step.operation || "read"}
          onValueChange={(value) =>
            onUpdate(id, "update", { step: { ...step, operation: value as any } })
          }
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="read">Read File</SelectItem>
            <SelectItem value="write">Write File</SelectItem>
            <SelectItem value="copy">Copy File</SelectItem>
            <SelectItem value="move">Move File</SelectItem>
            <SelectItem value="delete">Delete File</SelectItem>
            <SelectItem value="exists">Check File Exists</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Source Path */}
      <div className="space-y-2">
        <Label className="text-xs">
          {step.operation === "write" ? "File Path" : "Source Path"}
        </Label>
        <Input
          value={step.sourcePath || ""}
          placeholder="/path/to/file.txt"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, sourcePath: e.target.value } })}
          className="text-xs"
        />
        <p className="text-xs text-gray-500">
          Supports variables: /path/to/{"{"}filename{"}"}
        </p>
      </div>

      {/* Destination Path (for copy/move) */}
      {(step.operation === "copy" || step.operation === "move") && (
        <div className="space-y-2">
          <Label className="text-xs">Destination Path</Label>
          <Input
            value={step.destinationPath || ""}
            placeholder="/path/to/destination.txt"
            onChange={(e) =>
              onUpdate(id, "update", { step: { ...step, destinationPath: e.target.value } })
            }
            className="text-xs"
          />
        </div>
      )}

      {/* Content (for write) */}
      {step.operation === "write" && (
        <div className="space-y-2">
          <Label className="text-xs">Content</Label>
          <Textarea
            value={step.content || ""}
            placeholder="File content to write"
            onChange={(e) => onUpdate(id, "update", { step: { ...step, content: e.target.value } })}
            className="text-xs min-h-24 font-mono"
          />
          <p className="text-xs text-gray-500">
            Supports variables: {"{"}data{"}"}
          </p>
        </div>
      )}

      {/* Encoding */}
      <div className="space-y-2">
        <Label className="text-xs">Encoding (optional)</Label>
        <Input
          value={step.encoding || "utf-8"}
          placeholder="utf-8"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, encoding: e.target.value } })}
          className="text-xs"
        />
      </div>

      {/* Store Result */}
      {(step.operation === "read" || step.operation === "exists") && (
        <div className="space-y-2">
          <Label className="text-xs">Store Result As Variable</Label>
          <Input
            value={step.storeKey || ""}
            placeholder="fileContent"
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
