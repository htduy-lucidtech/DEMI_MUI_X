type Params = Record<string, any>;

import notificationVi from "./notification/vi";
import notificationEn from "./notification/en";

const messages = {
  vi: notificationVi,
  en: notificationEn,
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
