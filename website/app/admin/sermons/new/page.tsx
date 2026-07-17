import SermonForm from "../SermonForm";

export default function NewSermonPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add New Sermon</h1>
      <SermonForm />
    </div>
  );
}
