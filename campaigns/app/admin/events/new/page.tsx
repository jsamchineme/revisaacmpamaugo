import EventForm from "@/components/admin/EventForm";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create Event</h1>
      <EventForm />
    </div>
  );
}
