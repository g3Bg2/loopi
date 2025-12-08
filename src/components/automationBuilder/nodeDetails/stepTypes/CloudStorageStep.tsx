import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { StepProps } from "./types";

export function CloudStorageStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "cloudStorage") return null;

  return (
    <div className="space-y-4">
      {/* Provider */}
      <div className="space-y-2">
        <Label className="text-xs">Cloud Provider</Label>
        <Select
          value={step.provider || "aws"}
          onValueChange={(value) =>
            onUpdate(id, "update", { step: { ...step, provider: value as any } })
          }
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aws">AWS S3</SelectItem>
            <SelectItem value="azure">Azure Blob Storage</SelectItem>
            <SelectItem value="gcp">Google Cloud Storage</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Operation */}
      <div className="space-y-2">
        <Label className="text-xs">Operation</Label>
        <Select
          value={step.operation || "upload"}
          onValueChange={(value) =>
            onUpdate(id, "update", { step: { ...step, operation: value as any } })
          }
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upload">Upload</SelectItem>
            <SelectItem value="download">Download</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="list">List Files</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bucket */}
      <div className="space-y-2">
        <Label className="text-xs">
          {step.provider === "azure" ? "Container" : "Bucket"}
        </Label>
        <Input
          value={step.bucket || ""}
          placeholder="my-bucket"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, bucket: e.target.value } })}
          className="text-xs"
        />
      </div>

      {/* Key */}
      <div className="space-y-2">
        <Label className="text-xs">File Key/Path</Label>
        <Input
          value={step.key || ""}
          placeholder="folder/file.txt"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, key: e.target.value } })}
          className="text-xs"
        />
        <p className="text-xs text-gray-500">
          Supports variables: reports/{"{"}date{"}"}.txt
        </p>
      </div>

      {/* Local Path */}
      {(step.operation === "upload" || step.operation === "download") && (
        <div className="space-y-2">
          <Label className="text-xs">Local File Path</Label>
          <Input
            value={step.localPath || ""}
            placeholder="/path/to/local/file.txt"
            onChange={(e) =>
              onUpdate(id, "update", { step: { ...step, localPath: e.target.value } })
            }
            className="text-xs"
          />
        </div>
      )}

      {/* Store Result */}
      {step.operation === "list" && (
        <div className="space-y-2">
          <Label className="text-xs">Store File List As Variable</Label>
          <Input
            value={step.storeKey || ""}
            placeholder="fileList"
            onChange={(e) =>
              onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })
            }
            className="text-xs"
          />
        </div>
      )}

      {/* Credentials Note */}
      <div className="bg-amber-50 p-3 rounded border border-amber-200">
        <p className="text-xs font-semibold mb-1">🔐 Credentials</p>
        <p className="text-xs text-amber-800">
          Store access keys in variables. Configure credentials in step settings (accessKey, secretKey, region).
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 p-3 rounded border border-blue-200">
        <p className="text-xs font-semibold mb-1">📦 Dependencies Required</p>
        <p className="text-xs text-blue-800">
          Install SDK: aws-sdk (AWS), @azure/storage-blob (Azure), or @google-cloud/storage (GCP)
        </p>
      </div>
    </div>
  );
}
