import { createEleve } from "@/app/eleves/actions";
import EleveForm from "@/components/EleveForm";

export default function NouvelElevePage() {
  return (
    <div className="max-w-lg mx-auto">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Nouvel élève
      </h1>
      <EleveForm action={createEleve} />
    </div>
  );
}
