import DiagnosticPageTemplate from "@/components/DiagnosticPageTemplate";
import { diagnosticContent } from "@/data/diagnosticContent";

export default function CardiacImagingPage() {
  return <DiagnosticPageTemplate content={diagnosticContent["cardiac-imaging"]} />;
}