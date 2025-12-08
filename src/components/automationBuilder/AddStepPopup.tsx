import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { AutomationStep, stepTypes } from "../../types";
import type { Edition } from "../../types/edition";
import { EnterpriseFeatureBadge } from "../EditionBadge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface AddStepPopupProps {
  onAdd: (type: AutomationStep["type"] | "conditional") => void;
}

const AddStepPopup: React.FC<AddStepPopupProps> = ({ onAdd }) => {
  const [edition, setEdition] = useState<Edition>("community");

  useEffect(() => {
    // Get edition info from main process
    window.electronAPI?.getEdition().then((config) => {
      setEdition(config.edition);
    });
  }, []);

  // Group steps by category
  const groupedSteps = stepTypes.reduce((acc, step) => {
    const category = step.category || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(step);
    return acc;
  }, {} as Record<string, typeof stepTypes[number][]>);

  // Define category order and labels
  const categoryOrder = [
    { key: "browser", label: "Browser" },
    { key: "api", label: "API" },
    { key: "data", label: "Data" },
    { key: "filesystem", label: "File System" },
    { key: "system", label: "System" },
    { key: "database", label: "Database" },
    { key: "email", label: "Email" },
    { key: "cloud", label: "Cloud" },
  ];

  return (
    <Card className="w-64 max-h-[600px] overflow-y-auto">
      <CardHeader className="p-3">
        <h3 className="text-sm font-medium">Add Next Step</h3>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {categoryOrder.map(({ key, label }) => {
          const categorySteps = groupedSteps[key];
          if (!categorySteps || categorySteps.length === 0) return null;

          return (
            <div key={key} className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground px-2 py-1">
                {label}
              </div>
              {categorySteps.map((stepType) => {
                const isEnterprise = stepType.enterprise === true;
                const isAvailable = !isEnterprise || edition === "enterprise";

                const button = (
                  <Button
                    key={stepType.value}
                    variant="ghost"
                    className="w-full text-left justify-start text-xs py-2 px-2 h-auto"
                    onClick={() => {
                      if (isAvailable) {
                        onAdd(stepType.value as AutomationStep["type"]);
                      }
                    }}
                    disabled={!isAvailable}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <stepType.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{stepType.label}</span>
                      </div>
                      {isEnterprise && edition === "enterprise" && (
                        <EnterpriseFeatureBadge />
                      )}
                    </div>
                  </Button>
                );

                if (isEnterprise && edition === "community") {
                  return (
                    <TooltipProvider key={stepType.value}>
                      <Tooltip>
                        <TooltipTrigger asChild>{button}</TooltipTrigger>
                        <TooltipContent side="right">
                          <p className="text-xs">
                            Enterprise feature - Upgrade to unlock
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                }

                return button;
              })}
            </div>
          );
        })}

        <div className="border-t pt-2 mt-2">
          <Button
            variant="ghost"
            className="w-full text-left justify-start text-xs py-2 px-2"
            onClick={() => {
              onAdd("conditional");
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Conditional
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddStepPopup;
