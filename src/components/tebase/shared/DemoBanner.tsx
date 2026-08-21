import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DEMO_BANNER_TEXT } from "@/lib/persistence";
import { cn } from "@/lib/utils";

interface DemoBannerProps {
  className?: string;
  message?: string;
}

const DemoBanner = ({ className, message = DEMO_BANNER_TEXT }: DemoBannerProps) => {
  return (
    <Alert className={cn("border-amber-200 bg-amber-50 text-amber-900", className)}>
      <AlertTriangle className="h-4 w-4 text-amber-700" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

export default DemoBanner;
