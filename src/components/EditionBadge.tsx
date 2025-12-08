import { Crown } from "lucide-react";
import { Badge } from "./ui/badge";

/**
 * EditionBadge - Shows Enterprise or Community badge
 */
export function EditionBadge({ edition }: { edition: "community" | "enterprise" }) {
  if (edition === "enterprise") {
    return (
      <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <Crown className="h-3 w-3 mr-1" />
        Enterprise
      </Badge>
    );
  }
  
  return (
    <Badge variant="secondary">
      Community
    </Badge>
  );
}

/**
 * EnterpriseFeatureBadge - Small badge for enterprise-only features
 */
export function EnterpriseFeatureBadge() {
  return (
    <Badge variant="default" className="ml-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs">
      <Crown className="h-2 w-2 mr-1" />
      Enterprise
    </Badge>
  );
}
