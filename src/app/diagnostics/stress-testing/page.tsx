import DiagnosticPageTemplate from "@/components/DiagnosticPageTemplate";
import { diagnosticContent } from "@/data/diagnosticContent";

export default function StressTestingPage() {
  return <DiagnosticPageTemplate content={diagnosticContent["stress-testing"]} />;
}