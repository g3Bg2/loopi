export interface StepProps {
  step: any;
  id: string;
  onUpdate: (id: string, type: "update", updates?: any) => void;
  onPickWithSetter?: (setter: (s: string) => void) => Promise<void>;
}
