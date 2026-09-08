import DiagnosticPageTemplate from "@/components/DiagnosticPageTemplate";
import { diagnosticContent } from "@/data/diagnosticContent";

export default function MonitoringPage() {
  return <DiagnosticPageTemplate content={diagnosticContent["monitoring"]} />;
}