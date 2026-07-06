import { useState } from "react";
import { useLocation } from "react-router-dom";

import { useGenerateReport, useReportsList } from "../../hooks/useReports";
import { downloadReport } from "../../api/reports";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Input";
import { EmptyState, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../../components/ui/Table";
import { useToast } from "../../components/ui/Toast";
import { formatDateTime, titleCase } from "../../utils/formatters";
import type { ReportFormat, ReportPeriod, ReportType } from "../../types/report";

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: "equipment_summary", label: "Equipment Summary" },
  { value: "maintenance_history", label: "Maintenance History" },
  { value: "assignment_history", label: "Assignment History" },
  { value: "full_history", label: "Full History (Audit Trail)" },
];

export function ReportsPage() {
  const location = useLocation();
  const { notify } = useToast();
  const [reportType, setReportType] = useState<ReportType>(
    (location.state as { reportType?: ReportType })?.reportType ?? "equipment_summary",
  );
  const [period, setPeriod] = useState<ReportPeriod>("monthly");
  const [format, setFormat] = useState<ReportFormat>("csv");

  const generateMutation = useGenerateReport();
  const { data: reports, isLoading } = useReportsList(1);

  const handleGenerate = async () => {
    try {
      const report = await generateMutation.mutateAsync({ report_type: reportType, period, format });
      if (report.status === "completed") {
        await downloadReport(report.id, `${report.report_type}.${report.format}`);
        notify("Report generated and downloading — check your browser's Downloads folder.", "success");
      } else {
        notify("Report generation failed. See Report History below for details.", "error");
      }
    } catch {
      notify("Failed to generate report.", "error");
    }
  };

  const handleDownload = async (id: number, type: string, fmt: string) => {
    try {
      await downloadReport(id, `${type}.${fmt}`);
    } catch {
      notify("Failed to download report.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-950">Reports</h1>
        <p className="text-sm text-slate-500">Generate weekly, monthly, or full-history reports as PDF or CSV.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Generate a Report</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Select label="Report Type" value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)}>
            {REPORT_TYPES.map((rt) => (
              <option key={rt.value} value={rt.value}>
                {rt.label}
              </option>
            ))}
          </Select>
          <Select label="Period" value={period} onChange={(e) => setPeriod(e.target.value as ReportPeriod)}>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="full_history">Full History</option>
          </Select>
          <Select label="Format" value={format} onChange={(e) => setFormat(e.target.value as ReportFormat)}>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </Select>
          <div className="flex items-end">
            <Button onClick={handleGenerate} disabled={generateMutation.isPending} className="w-full">
              {generateMutation.isPending ? "Generating…" : "Generate"}
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-1 text-sm font-semibold text-slate-700">Report History</h2>
        <p className="mb-3 text-xs text-slate-400">
          Every report you've generated, past and present — click Download any time to save it again.
        </p>
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Format</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Requested By</TableHeaderCell>
              <TableHeaderCell>Created</TableHeaderCell>
              <TableHeaderCell></TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {isLoading && <EmptyState message="Loading…" colSpan={6} />}
            {!isLoading && reports?.results.length === 0 && <EmptyState message="No reports generated yet." colSpan={6} />}
            {!isLoading &&
              reports?.results.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium text-slate-900">{titleCase(report.report_type)}</TableCell>
                  <TableCell className="uppercase">{report.format}</TableCell>
                  <TableCell>{titleCase(report.status)}</TableCell>
                  <TableCell>{report.requested_by_name ?? "—"}</TableCell>
                  <TableCell>{formatDateTime(report.created_at)}</TableCell>
                  <TableCell>
                    {report.status === "completed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(report.id, report.report_type, report.format)}
                      >
                        Download
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
