import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

// Import Locales
import loginVi from "./locales/login/vi";
import loginEn from "./locales/login/en";
import layoutVi from "./locales/layout/vi";
import layoutEn from "./locales/layout/en";
import dashboardVi from "./locales/dashboard/vi";
import dashboardEn from "./locales/dashboard/en";
import personnelVi from "./locales/personnel/vi";
import personnelEn from "./locales/personnel/en";
import attendanceVi from "./locales/attendance/vi";
import attendanceEn from "./locales/attendance/en";
import departmentsVi from "./locales/departments/vi";
import departmentsEn from "./locales/departments/en";
import leaveVi from "./locales/leave/vi";
import leaveEn from "./locales/leave/en";
import adminVi from "./locales/admin/vi";
import adminEn from "./locales/admin/en";
import settingsVi from "./locales/settings/vi";
import settingsEn from "./locales/settings/en";
import usersVi from "./locales/users/vi";
import usersEn from "./locales/users/en";
import profileVi from "./locales/profile/vi";
import profileEn from "./locales/profile/en";
import orgChartVi from "./locales/org-chart/vi";
import orgChartEn from "./locales/org-chart/en";
import payrollVi from "./locales/payroll/vi";
import payrollEn from "./locales/payroll/en";
import recruitmentVi from "./locales/recruitment/vi";
import recruitmentEn from "./locales/recruitment/en";
import performanceVi from "./locales/performance/vi";
import performanceEn from "./locales/performance/en";
import notificationVi from "./locales/notification/vi";
import notificationEn from "./locales/notification/en";

const messagesMap = {
  vi: {
    Login: loginVi,
    Layout: layoutVi,
    Dashboard: dashboardVi,
    Personnel: personnelVi,
    Attendance: attendanceVi,
    Departments: departmentsVi,
    Leave: leaveVi,
    Admin: adminVi,
    Settings: settingsVi,
    Users: usersVi,
    Profile: profileVi,
    OrgChart: orgChartVi,
    Payroll: payrollVi,
    Recruitment: recruitmentVi,
    Performance: performanceVi,
    Notifications: notificationVi,
  },
  en: {
    Login: loginEn,
    Layout: layoutEn,
    Dashboard: dashboardEn,
    Personnel: personnelEn,
    Attendance: attendanceEn,
    Departments: departmentsEn,
    Leave: leaveEn,
    Admin: adminEn,
    Settings: settingsEn,
    Users: usersEn,
    Profile: profileEn,
    OrgChart: orgChartEn,
    Payroll: payrollEn,
    Recruitment: recruitmentEn,
    Performance: performanceEn,
    Notifications: notificationEn,
  }
};

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'vi';

  return {
    locale,
    messages: messagesMap[locale as keyof typeof messagesMap] || messagesMap.vi
  };
});
