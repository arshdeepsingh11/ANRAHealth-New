import SpecialtyPageTemplate from "@/components/SpecialtyPageTemplate";
import { specialtyContent } from "@/data/specialtyContent";

export default function PrecisionMedicinePage() {
  return <SpecialtyPageTemplate content={specialtyContent["precision-medicine"]} />;
}