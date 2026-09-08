import DiagnosticPageTemplate from "@/components/DiagnosticPageTemplate";
import { diagnosticContent } from "@/data/diagnosticContent";

export default function PulmonaryPage() {
  return <DiagnosticPageTemplate content={diagnosticContent["pulmonary"]} />;
}