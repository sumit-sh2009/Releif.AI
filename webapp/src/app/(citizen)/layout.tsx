import { CitizenShell } from "@/components/citizen/CitizenShell";

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return <CitizenShell>{children}</CitizenShell>;
}
