import SpecialtyPageTemplate from "@/components/SpecialtyPageTemplate";
import { specialtyContent } from "@/data/specialtyContent";

export default function GeriatricMedicinePage() {
  return <SpecialtyPageTemplate content={specialtyContent["geriatric-medicine"]} />;
}