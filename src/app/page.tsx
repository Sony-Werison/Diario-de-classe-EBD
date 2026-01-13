import { StudentDashboard } from "@/components/student-dashboard";
import { format } from "date-fns";

export default function Home() {
  const today = new Date();
  const dateKey = format(today, 'yyyy-MM-dd');
  // Redirect to dashboard with today's date
  // This is a client-side component, so we can use useRouter
  // But since we are on a server component, we should build the page
  return <StudentDashboard initialDate={dateKey} />;
}
