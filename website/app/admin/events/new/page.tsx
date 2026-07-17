import EventForm from "../EventForm";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add New Event</h1>
      <EventForm />
    </div>
  );
}
