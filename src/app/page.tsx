import { StudentDashboard } from "@/components/student-dashboard";

export default function Home() {
  return (
    <div className="flex h-screen bg-slate-900 text-slate-200">
      <StudentDashboard />
    </div>
  );
}
