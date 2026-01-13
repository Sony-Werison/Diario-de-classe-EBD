import { StudentDashboard } from "@/components/student-dashboard";

export default function DashboardPage({ params }: { params: { date: string } }) {
  return <StudentDashboard initialDate={params.date} />;
}
