import EleveForm from "@/components/EleveForm";

export default function NouvelElevePage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Nouvel élève</h1>
      <EleveForm action="create" />
    </div>
  );
}
