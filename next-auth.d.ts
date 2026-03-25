import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      username?: string;
      department?: string;
      deptId?: string;
      uid?: string;
      unit?: string;
      role?: string;
      roles?: string[];
      loginDate?: string;
      WMSUnit?: string
      WMSDept?: string
    };
  }

  interface User {
    id: string;
    username?: string;
    department?: string;
    deptId?: string;
    uid?: string;
    unit?: string;
    role?: string;
    roles?: string[];
    loginDate?: string;
    WMSUnit?: string
    WMSDept?: string
  }
}
