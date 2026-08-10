import { ComplianceDashboard } from "@/modules/compliance/ui/compliance-dashboard";
import { ComplianceShell } from "@/modules/compliance/ui/compliance-shell";
import { getComplianceReport } from "@/modules/compliance/services/get-compliance-report";

export default function CompliancePage() {
  const report = getComplianceReport();

  return (
    <ComplianceShell navItems={[{ href: "/compliance", label: "Dashboard", active: true }]}>
      <ComplianceDashboard report={report} />
    </ComplianceShell>
  );
}
