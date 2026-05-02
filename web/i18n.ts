import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

// Import Locales
import loginVi from "./app/login/locales/vi";
import loginEn from "./app/login/locales/en";
import layoutVi from "./app/layout/locales/vi";
import layoutEn from "./app/layout/locales/en";
import dashboardVi from "./app/(authenticated)/dashboard/locales/vi";
import dashboardEn from "./app/(authenticated)/dashboard/locales/en";
import personnelVi from "./app/(authenticated)/dashboard/personnel/locales/vi";
import personnelEn from "./app/(authenticated)/dashboard/personnel/locales/en";
import attendanceVi from "./app/(authenticated)/dashboard/attendance/locales/vi";
import attendanceEn from "./app/(authenticated)/dashboard/attendance/locales/en";
import departmentsVi from "./app/(authenticated)/dashboard/departments/locales/vi";
import departmentsEn from "./app/(authenticated)/dashboard/departments/locales/en";
import leaveVi from "./app/(authenticated)/dashboard/leave/locales/vi";
import leaveEn from "./app/(authenticated)/dashboard/leave/locales/en";
import adminVi from "./app/(authenticated)/dashboard/admin/locales/vi";
import adminEn from "./app/(authenticated)/dashboard/admin/locales/en";
import settingsVi from "./app/(authenticated)/settings/locales/vi";
import settingsEn from "./app/(authenticated)/settings/locales/en";
import usersVi from "./app/(authenticated)/dashboard/users/locales/vi";
import usersEn from "./app/(authenticated)/dashboard/users/locales/en";
import profileVi from "./app/(authenticated)/profile/locales/vi";
import profileEn from "./app/(authenticated)/profile/locales/en";
import orgChartVi from "./app/(authenticated)/dashboard/org-chart/locales/vi";
import orgChartEn from "./app/(authenticated)/dashboard/org-chart/locales/en";
import payrollVi from "./app/(authenticated)/dashboard/payroll/locales/vi";
import payrollEn from "./app/(authenticated)/dashboard/payroll/locales/en";
import recruitmentVi from "./app/(authenticated)/dashboard/recruitment/locales/vi";
import recruitmentEn from "./app/(authenticated)/dashboard/recruitment/locales/en";
import performanceVi from "./app/(authenticated)/dashboard/performance/locales/vi";
import performanceEn from "./app/(authenticated)/dashboard/performance/locales/en";
import { notificationMessages } from "./lib/notification-i18n";

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
    Notifications: notificationMessages.vi,
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
    Notifications: notificationMessages.en,
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
