import DiagnosticPageTemplate from "@/components/DiagnosticPageTemplate";
import { diagnosticContent } from "@/data/diagnosticContent";

export default function VascularPage() {
  return <DiagnosticPageTemplate content={diagnosticContent["vascular"]} />;
}