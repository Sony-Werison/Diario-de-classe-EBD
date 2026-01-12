import { StudentDashboard } from "@/components/student-dashboard";

export default function Home() {
  return (
    <div className="flex h-screen bg-background text-slate-200">
      <StudentDashboard />
    </div>
  );
}
