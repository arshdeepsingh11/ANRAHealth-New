import SpecialtyPageTemplate from "@/components/SpecialtyPageTemplate";
import { specialtyContent } from "@/data/specialtyContent";

export default function NutritionPage() {
  return <SpecialtyPageTemplate content={specialtyContent["nutrition"]} />;
}