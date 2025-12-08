import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Textarea } from "../../../ui/textarea";
import { StepProps } from "./types";

export function DataTransformStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "dataTransform") return null;

  return (
    <div className="space-y-4">
      {/* Operation */}
      <div className="space-y-2">
        <Label className="text-xs">Operation</Label>
        <Select
          value={step.operation || "parse"}
          onValueChange={(value) =>
            onUpdate(id, "update", { step: { ...step, operation: value as any } })
          }
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="parse">Parse</SelectItem>
            <SelectItem value="stringify">Stringify</SelectItem>
            <SelectItem value="convert">Convert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Input Format */}
      <div className="space-y-2">
        <Label className="text-xs">Input Format</Label>
        <Select
          value={step.inputFormat || "json"}
          onValueChange={(value) =>
            onUpdate(id, "update", { step: { ...step, inputFormat: value as any } })
          }
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="xml">XML</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="yaml">YAML</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Output Format */}
      <div className="space-y-2">
        <Label className="text-xs">Output Format</Label>
        <Select
          value={step.outputFormat || "json"}
          onValueChange={(value) =>
            onUpdate(id, "update", { step: { ...step, outputFormat: value as any } })
          }
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="xml">XML</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="yaml">YAML</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <Label className="text-xs">Input Data</Label>
        <Textarea
          value={step.input || ""}
          placeholder={
            step.inputFormat === "json"
              ? '{"key": "value"}'
              : step.inputFormat === "csv"
                ? "name,age\nJohn,30"
                : "Input data"
          }
          onChange={(e) => onUpdate(id, "update", { step: { ...step, input: e.target.value } })}
          className="text-xs min-h-24 font-mono"
        />
        <p className="text-xs text-gray-500">
          Supports variables: {"{"}rawData{"}"}
        </p>
      </div>

      {/* Store Result */}
      <div className="space-y-2">
        <Label className="text-xs">Store Result As Variable</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="transformedData"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 p-3 rounded border border-blue-200">
        <p className="text-xs font-semibold mb-1">📦 Dependencies</p>
        <p className="text-xs text-blue-800">
          JSON works without dependencies. For XML, CSV, YAML: install xml2js, papaparse, js-yaml
        </p>
      </div>
    </div>
  );
}
