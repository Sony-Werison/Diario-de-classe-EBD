import { StudentDashboard } from "@/components/student-dashboard";

export default function DashboardPage({ params, searchParams }: { params: { date: string }, searchParams: { [key: string]: string | string[] | undefined } }) {
  const classId = typeof searchParams.classId === 'string' ? searchParams.classId : undefined;
  return <StudentDashboard initialDate={params.date} classId={classId} />;
}
