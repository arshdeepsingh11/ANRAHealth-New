import SpecialtyPageTemplate from "@/components/SpecialtyPageTemplate";
import { specialtyContent } from "@/data/specialtyContent";

export default function InternalMedicinePage() {
  return <SpecialtyPageTemplate content={specialtyContent["internal-medicine"]} />;
}