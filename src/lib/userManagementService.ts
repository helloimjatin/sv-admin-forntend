import { ManagedUser, exportUsersCsv } from "@/data/userManagementData";

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportManagedUsers(list: ManagedUser[], filename = "sehatvaani-users.csv") {
  downloadCsv(filename, exportUsersCsv(list));
}

export function downloadUserReport(user: ManagedUser) {
  const blob = new Blob([JSON.stringify(user, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `user-report-${user.user_id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
