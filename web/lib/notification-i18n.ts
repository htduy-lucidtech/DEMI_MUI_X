type Params = Record<string, any>;

const messages = {
  en: {
    leave: {
      request: {
        created: "New leave request (ID: {id}) from user {userId}",
        status: "Your leave request (ID: {id}) has been {status}",
      },
    },
    attendance: {
      checkin: "You have checked in",
      checkout: "You have checked out",
      correction: {
        requested: "Attendance correction requested (ID: {id})",
        result: "Attendance correction (ID: {id}) is {status}",
      },
    },
    system: { welcome: "Welcome to HRM Pro! This is a realtime message." },
  },
  vi: {
    leave: {
      request: {
        created: "Yêu cầu nghỉ mới (ID: {id}) từ user {userId}",
        status: "Đơn nghỉ (ID: {id}) của bạn đã {status}",
      },
    },
    attendance: {
      checkin: "Bạn đã điểm danh (check-in)",
      checkout: "Bạn đã điểm danh (check-out)",
      correction: {
        requested: "Yêu cầu sửa chấm công (ID: {id})",
        result: "Yêu cầu sửa chấm công (ID: {id}) đã {status}",
      },
    },
    system: {
      welcome: "Chào mừng bạn đến với HRM Pro! Đây là thông báo realtime.",
    },
  },
};

function format(template: string, params?: Params) {
  if (!params) return template;
  return template.replace(/\{([^}]+)\}/g, (_, key) => {
    const val = params[key];
    return val === undefined || val === null ? "" : String(val);
  });
}

export function translate(key: string, params?: Params, locale = "vi") {
  const dict = (messages as any)[locale] || messages.vi;
  if (!key) return "";
  // support dotted keys (e.g. "leave.request.created") by walking the object
  const parts = key.split(".");
  let current: any = dict;
  for (const p of parts) {
    if (current && typeof current === "object" && p in current) {
      current = current[p];
    } else {
      current = null;
      break;
    }
  }
  const tpl = typeof current === "string" ? current : key;
  return format(tpl, params);
}

export const notificationMessages = messages;

export default { translate };
