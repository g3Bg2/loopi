import { Trash2 } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Textarea } from "../../../ui/textarea";
import { StepProps } from "./types";

export function WebhookStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "webhook") return null;

  const handleAddHeader = () => {
    const newHeaders = { ...(step.headers || {}) };
    newHeaders["X-New-Header"] = "value";
    onUpdate(id, "update", { step: { ...step, headers: newHeaders } });
  };

  const handleRemoveHeader = (key: string) => {
    const newHeaders = { ...(step.headers || {}) };
    delete newHeaders[key];
    onUpdate(id, "update", { step: { ...step, headers: newHeaders } });
  };

  const handleHeaderChange = (oldKey: string, newKey: string, newValue: string) => {
    const newHeaders = { ...(step.headers || {}) };
    if (oldKey !== newKey && oldKey in newHeaders) {
      delete newHeaders[oldKey];
    }
    newHeaders[newKey] = newValue;
    onUpdate(id, "update", { step: { ...step, headers: newHeaders } });
  };

  return (
    <div className="space-y-4">
      {/* Method */}
      <div className="space-y-2">
        <Label className="text-xs">HTTP Method</Label>
        <Select
          value={step.method || "POST"}
          onValueChange={(value) =>
            onUpdate(id, "update", { step: { ...step, method: value as any } })
          }
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* URL */}
      <div className="space-y-2">
        <Label className="text-xs">URL</Label>
        <Input
          value={step.url || ""}
          placeholder="https://api.example.com/webhook"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, url: e.target.value } })}
          className="text-xs"
        />
      </div>

      {/* Body */}
      {step.method !== "GET" && (
        <div className="space-y-2">
          <Label className="text-xs">Request Body (JSON)</Label>
          <Textarea
            value={step.body || ""}
            placeholder='{"event": "{{eventType}}", "data": {{eventData}}}'
            onChange={(e) => onUpdate(id, "update", { step: { ...step, body: e.target.value } })}
            className="text-xs min-h-24 font-mono"
          />
        </div>
      )}

      {/* Headers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Headers</Label>
          <Button size="sm" variant="outline" onClick={handleAddHeader} className="text-xs h-6">
            + Add
          </Button>
        </div>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {Object.entries(step.headers || {}).map(([key, value]) => (
            <div key={key} className="flex gap-2 items-center">
              <Input
                value={key}
                placeholder="Header name"
                onChange={(e) => handleHeaderChange(key, e.target.value, value)}
                className="text-xs flex-1"
              />
              <Input
                value={value}
                placeholder="Header value"
                onChange={(e) => handleHeaderChange(key, key, e.target.value)}
                className="text-xs flex-1"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveHeader(key)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Authentication Type */}
      <div className="space-y-2">
        <Label className="text-xs">Authentication Type (optional)</Label>
        <Select
          value={(step.authentication?.type as string) || "none"}
          onValueChange={(value) =>
            onUpdate(id, "update", {
              step: {
                ...step,
                authentication: value === "none" ? undefined : { type: value },
              },
            })
          }
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="basic">Basic Auth</SelectItem>
            <SelectItem value="bearer">****** Token</SelectItem>
            <SelectItem value="apiKey">API Key</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Authentication Fields */}
      {step.authentication?.type === "basic" && (
        <>
          <div className="space-y-2">
            <Label className="text-xs">Username</Label>
            <Input
              value={(step.authentication.username as string) || ""}
              onChange={(e) =>
                onUpdate(id, "update", {
                  step: {
                    ...step,
                    authentication: { ...step.authentication, username: e.target.value },
                  },
                })
              }
              className="text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Password</Label>
            <Input
              value={(step.authentication.password as string) || ""}
              type="password"
              onChange={(e) =>
                onUpdate(id, "update", {
                  step: {
                    ...step,
                    authentication: { ...step.authentication, password: e.target.value },
                  },
                })
              }
              className="text-xs"
            />
          </div>
        </>
      )}

      {step.authentication?.type === "bearer" && (
        <div className="space-y-2">
          <Label className="text-xs">****** Token</Label>
          <Input
            value={(step.authentication.token as string) || ""}
            type="password"
            placeholder="Use {{apiToken}} variable"
            onChange={(e) =>
              onUpdate(id, "update", {
                step: {
                  ...step,
                  authentication: { ...step.authentication, token: e.target.value },
                },
              })
            }
            className="text-xs"
          />
        </div>
      )}

      {step.authentication?.type === "apiKey" && (
        <>
          <div className="space-y-2">
            <Label className="text-xs">API Key</Label>
            <Input
              value={(step.authentication.apiKey as string) || ""}
              type="password"
              onChange={(e) =>
                onUpdate(id, "update", {
                  step: {
                    ...step,
                    authentication: { ...step.authentication, apiKey: e.target.value },
                  },
                })
              }
              className="text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Header Name (optional)</Label>
            <Input
              value={(step.authentication.apiKeyHeader as string) || "X-API-Key"}
              placeholder="X-API-Key"
              onChange={(e) =>
                onUpdate(id, "update", {
                  step: {
                    ...step,
                    authentication: { ...step.authentication, apiKeyHeader: e.target.value },
                  },
                })
              }
              className="text-xs"
            />
          </div>
        </>
      )}

      {/* Store Response */}
      <div className="space-y-2">
        <Label className="text-xs">Store Response As Variable</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="webhookResponse"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>
    </div>
  );
}
