import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Textarea } from "../../../ui/textarea";
import { StepProps } from "./types";

export function DatabaseQueryStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "databaseQuery") return null;

  return (
    <div className="space-y-4">
      {/* Database Type */}
      <div className="space-y-2">
        <Label className="text-xs">Database Type</Label>
        <Select
          value={step.databaseType || "postgresql"}
          onValueChange={(value) =>
            onUpdate(id, "update", { step: { ...step, databaseType: value as any } })
          }
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="postgresql">PostgreSQL</SelectItem>
            <SelectItem value="mysql">MySQL</SelectItem>
            <SelectItem value="mongodb">MongoDB</SelectItem>
            <SelectItem value="sqlite">SQLite</SelectItem>
            <SelectItem value="mssql">SQL Server</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Connection String */}
      <div className="space-y-2">
        <Label className="text-xs">Connection String</Label>
        <Input
          value={step.connectionString || ""}
          placeholder="******localhost:5432/mydb"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, connectionString: e.target.value } })
          }
          className="text-xs font-mono"
          type="password"
        />
        <p className="text-xs text-gray-500">
          Use credential variables: {"{"}dbConnectionString{"}"}
        </p>
      </div>

      {/* Query */}
      <div className="space-y-2">
        <Label className="text-xs">Query</Label>
        <Textarea
          value={step.query || ""}
          placeholder={
            step.databaseType === "mongodb"
              ? '{ "collection": "users", "operation": "find", "filter": { "active": true } }'
              : "SELECT * FROM users WHERE active = $1"
          }
          onChange={(e) => onUpdate(id, "update", { step: { ...step, query: e.target.value } })}
          className="text-xs min-h-24 font-mono"
        />
        <p className="text-xs text-gray-500">
          {step.databaseType === "mongodb"
            ? "MongoDB query as JSON object"
            : "SQL query. Use $1, $2 for parameterized queries"}
        </p>
      </div>

      {/* Store Result */}
      <div className="space-y-2">
        <Label className="text-xs">Store Result As Variable</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="queryResult"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 p-3 rounded border border-blue-200">
        <p className="text-xs font-semibold mb-1">📦 Dependencies Required</p>
        <p className="text-xs text-blue-800">
          Install the appropriate driver: pg (PostgreSQL), mysql2 (MySQL), mongodb (MongoDB),
          better-sqlite3 (SQLite), or mssql (SQL Server)
        </p>
      </div>
    </div>
  );
}
