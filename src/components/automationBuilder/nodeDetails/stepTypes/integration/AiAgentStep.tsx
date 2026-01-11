import { Button } from "@components/ui/button";
import { CredentialSelector } from "@components/ui/credential-selector";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Textarea } from "@components/ui/textarea";
import { useState } from "react";
import { StepProps } from "../types";

export function AiAgentStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "aiAgent") return null;

  const [useManualKey, setUseManualKey] = useState(!step.credentialId && !!step.apiKey);

  // Ollama doesn't need API key (local), OpenAI and Anthropic do
  const requiresApiKey = step.provider !== "ollama";

  const handleAuthToggle = () => {
    const nextManual = !useManualKey;
    setUseManualKey(nextManual);
    if (!nextManual) {
      onUpdate(id, "update", { step: { ...step, apiKey: undefined } });
    } else {
      onUpdate(id, "update", { step: { ...step, credentialId: undefined } });
    }
  };

  const updateField = <K extends keyof typeof step>(key: K, value: (typeof step)[K]) => {
    onUpdate(id, "update", { step: { ...step, [key]: value } });
  };

  // Model lists for each provider
  const getModelPlaceholder = (): string => {
    switch (step.provider) {
      case "openai":
        return "gpt-4-turbo, gpt-4, gpt-3.5-turbo";
      case "anthropic":
        return "claude-3-5-sonnet-20241022, claude-3-opus-20240229";
      case "ollama":
        return "mistral, neural-chat, llama2, dolphin-mixtral";
      default:
        return "model name";
    }
  };

  const getProviderNote = (): string => {
    switch (step.provider) {
      case "openai":
        return "Recommended: gpt-4-turbo for agentic tasks";
      case "anthropic":
        return "Recommended: claude-3-5-sonnet for agentic tasks";
      case "ollama":
        return "Recommended: mistral (7B) or neural-chat (13B) for tool calling. Must have Ollama running locally.";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Provider</Label>
        <Select
          value={step.provider || "openai"}
          onValueChange={(value) => updateField("provider", value as "openai" | "anthropic" | "ollama")}
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI (GPT-4 Turbo)</SelectItem>
            <SelectItem value="anthropic">Anthropic (Claude 3.5 Sonnet)</SelectItem>
            <SelectItem value="ollama">Ollama (Local LLM)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground">
          All providers now support tool-calling and agentic behavior.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Model</Label>
        <Input
          value={step.model || ""}
          placeholder={getModelPlaceholder()}
          onChange={(e) => updateField("model", e.target.value)}
          className="text-xs"
        />
        <p className="text-[11px] text-muted-foreground">{getProviderNote()}</p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Goal (what agent should accomplish)</Label>
        <Textarea
          value={step.goal || ""}
          placeholder="Find a GitHub user by username and get their public repo count"
          onChange={(e) => updateField("goal", e.target.value)}
          className="text-xs min-h-20"
        />
        <p className="text-[11px] text-muted-foreground">
          Describe the end goal. Agent will choose which available steps to call.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs">Temperature</Label>
          <Input
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={step.temperature ?? 0}
            onChange={(e) => updateField("temperature", Number(e.target.value))}
            className="text-xs"
          />
          <p className="text-[11px] text-muted-foreground">Usually 0 for determinism.</p>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Max Tokens</Label>
          <Input
            type="number"
            min={256}
            value={step.maxTokens ?? 2048}
            onChange={(e) => updateField("maxTokens", Number(e.target.value))}
            className="text-xs"
          />
          <p className="text-[11px] text-muted-foreground">Higher for complex plans.</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Base URL (optional)</Label>
        <Input
          value={step.baseUrl || ""}
          placeholder={
            step.provider === "ollama"
              ? "http://localhost:11434"
              : step.provider === "openai"
                ? "https://api.openai.com/v1"
                : "https://api.anthropic.com"
          }
          onChange={(e) => updateField("baseUrl", e.target.value)}
          className="text-xs"
        />
        <p className="text-[11px] text-muted-foreground">
          {step.provider === "ollama"
            ? "Ollama runs on localhost:11434 by default. Use custom URL for remote instances."
            : "For proxy/custom deployments."}
        </p>
      </div>

      {requiresApiKey && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Authentication</Label>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleAuthToggle}
              className="text-xs h-7"
            >
              {useManualKey ? "Use Saved Credential" : "Enter API Key"}
            </Button>
          </div>
          {useManualKey ? (
            <Input
              type="password"
              value={step.apiKey || ""}
              placeholder="sk-..."
              onChange={(e) => updateField("apiKey", e.target.value)}
              className="text-xs"
            />
          ) : (
            <CredentialSelector
              value={step.credentialId}
              onChange={(credId) => updateField("credentialId", credId)}
              type={step.provider === "anthropic" ? "anthropic" : "openai"}
              label=""
            />
          )}
        </div>
      )}

      {step.provider === "ollama" && (
        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-700">
          <strong>Ollama Setup:</strong> Make sure Ollama is running locally on port 11434. Pull models with: <code>ollama pull mistral</code>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs">System Prompt (optional)</Label>
        <Textarea
          value={step.systemPrompt || ""}
          placeholder="You are an intelligent automation agent that can control browser automation..."
          onChange={(e) => updateField("systemPrompt", e.target.value)}
          className="text-xs min-h-16"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Store Result As</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="agentResult"
          onChange={(e) => updateField("storeKey", e.target.value)}
          className="text-xs"
        />
        <p className="text-[11px] text-muted-foreground">Variable name to store outcome/result.</p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Timeout (ms, optional)</Label>
        <Input
          type="number"
          min={5000}
          step={1000}
          value={step.timeoutMs ?? ""}
          onChange={(e) =>
            updateField("timeoutMs", e.target.value === "" ? undefined : Number(e.target.value))
          }
          className="text-xs"
        />
      </div>
    </div>
  );
}
