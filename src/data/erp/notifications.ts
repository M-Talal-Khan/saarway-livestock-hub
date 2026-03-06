export interface ERPNotification {
  id: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

export const erpNotifications: ERPNotification[] = [
  { id: "N-001", type: "overdue_vaccination", severity: "critical", message: "Overdue: F001-0003 FMD vaccination was due Feb 20", time: "2 hours ago", read: false, link: "/erp/health" },
  { id: "N-002", type: "rent_overdue", severity: "critical", message: "Station 2 rent overdue — was due Feb 28", time: "1 day ago", read: false, link: "/erp/finance" },
  { id: "N-003", type: "upcoming_vaccination", severity: "warning", message: "F001-0001 Deworming due in 5 days (Mar 15)", time: "3 hours ago", read: false, link: "/erp/health" },
  { id: "N-004", type: "low_feed", severity: "warning", message: "Station 3 silage stock below threshold", time: "6 hours ago", read: false, link: "/erp/feed" },
  { id: "N-005", type: "mandatory_vaccine_pending", severity: "warning", message: "F001-0013 missing mandatory vaccines: FMD, HS, BQ, LSD, Deworming", time: "1 day ago", read: true, link: "/erp/health" },
  { id: "N-006", type: "marketplace_fee_due", severity: "warning", message: "Monthly subscription fee PKR 600 due for 12 active animals", time: "2 days ago", read: true, link: "/erp/finance" },
  { id: "N-007", type: "weight_log_reminder", severity: "info", message: "Weight log due for 5 animals in Station 1", time: "5 hours ago", read: false, link: "/erp/cattle" },
  { id: "N-008", type: "password_reset_request", severity: "info", message: "User farhan.w1 requested a password reset", time: "3 days ago", read: true, link: "/erp/users" },
];
