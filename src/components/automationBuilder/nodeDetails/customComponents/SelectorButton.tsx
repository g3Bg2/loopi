import { Button } from "../../../ui/button";
import { Target } from "lucide-react";

export default function SelectorButton({
  onPick,
  title = "Pick element from browser",
}: {
  onPick: () => Promise<void>;
  title?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        await onPick();
      }}
      title={title}
    >
      <Target className="h-3 w-3" />
    </Button>
  );
}
