import SpecialtyPageTemplate from "@/components/SpecialtyPageTemplate";
import { specialtyContent } from "@/data/specialtyContent";

export default function EndocrinologyPage() {
  return <SpecialtyPageTemplate content={specialtyContent["endocrinology"]} />;
}