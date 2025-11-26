import React from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { SelectorButton } from "./customComponents";

/**
 * ConditionEditor - Configuration UI for conditional nodes
 * 
 * Supports three condition types:
 * - elementExists: Check if element is present in DOM
 * - valueMatches: Compare element text content against expected value
 */
export default function ConditionEditor({
  node,
  onUpdate,
  onPickWithSetter,
}: {
  node: any;
  onUpdate: (id: string, type: "update", updates?: any) => void;
  onPickWithSetter: (setter: (s: string) => void) => Promise<void>;
}) {
  const { data, id } = node;

  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Condition Type</Label>
        <Select value={data.conditionType || "elementExists"} onValueChange={(value) => onUpdate(id, "update", { conditionType: value })}>
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="elementExists">Element Exists</SelectItem>
            <SelectItem value="valueMatches">Value Matches</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {(["elementExists", "valueMatches"].includes(data.conditionType || "")) && (
        <div className="space-y-2">
          <Label className="text-xs">CSS Selector</Label>
          <div className="flex gap-2">
            <Input
              value={data.selector || ""}
              onChange={(e) => onUpdate(id, "update", { selector: e.target.value })}
              placeholder="CSS Selector"
              className="text-xs flex-1"
            />
            <SelectorButton onPick={async () => onPickWithSetter((selector) => onUpdate(id, "update", { selector }))} />
          </div>
        </div>
      )}

      {data.conditionType === "valueMatches" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Condition</Label>
            <Select value={data.condition || "equals"} onValueChange={(value) => onUpdate(id, "update", { condition: value })}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="greaterThan">Greater Than</SelectItem>
                <SelectItem value="lessThan">Less Than</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Expected Value</Label>
            <Input value={data.expectedValue || ""} onChange={(e) => onUpdate(id, "update", { expectedValue: e.target.value })} placeholder="Expected value" className="text-xs" />
          </div>
        </div>
      )}

      <div className="space-y-2 mt-4">
        <Label className="text-xs">Transform extracted value</Label>
        <p className="text-[11px] text-muted-foreground">Optionally clean up or convert the extracted text before comparing.</p>
        <div className="grid grid-cols-1 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Regex replace (pattern)</Label>
            <Input
              value={data.transform?.regex || ""}
              onChange={(e) => onUpdate(id, "update", { transform: { ...(data.transform || {}), regex: e.target.value } })}
              placeholder="e.g. $ or ,"
              className="text-xs"
            />
            <Label className="text-[10px] text-muted-foreground">Replacement</Label>
            <Input
              value={data.transform?.replace || ""}
              onChange={(e) => onUpdate(id, "update", { transform: { ...(data.transform || {}), replace: e.target.value } })}
              placeholder="e.g. empty to remove"
              className="text-xs"
            />
          </div>
          <div className="flex gap-2 items-center">
            <input
              id={`parseNumber-${id}`}
              type="checkbox"
              checked={!!data.transform?.parseNumber}
              onChange={(e) => onUpdate(id, "update", { transform: { ...(data.transform || {}), parseNumber: e.target.checked } })}
            />
            <Label htmlFor={`parseNumber-${id}`} className="text-xs">Parse number (strip non-numeric characters)</Label>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Strip characters (literal)</Label>
            <Input
              value={data.transform?.stripChars || ""}
              onChange={(e) => onUpdate(id, "update", { transform: { ...(data.transform || {}), stripChars: e.target.value } })}
              placeholder="e.g. $ ,"
              className="text-xs"
            />
          </div>
          <div className="flex gap-2 items-center">
            <input
              id={`toLower-${id}`}
              type="checkbox"
              checked={!!data.transform?.toLower}
              onChange={(e) => onUpdate(id, "update", { transform: { ...(data.transform || {}), toLower: e.target.checked } })}
            />
            <Label htmlFor={`toLower-${id}`} className="text-xs">Case-insensitive compare</Label>
          </div>
        </div>
      </div>
    </>
  );
}
