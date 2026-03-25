
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createCipheriv, pbkdf2Sync } from "crypto";
import { getConnection } from "@/lib/dbConnect";
import decrypt from "@/components/Decrypt";

type AppRole = "Admin" | "Departments";

type SpAuthRow = {
  "USER ID"?: string | number;
  NAME?: string | null;
  EMAIL?: string | null;
  DEPT?: string | null;
  Desg?: string | null;
  DEPTID?: string | number | null;
  UID?: string | number | null;
  UNIT?: string | number | null;
  WMSUnit?: string | number | null;
  WMSDept?: string | number | null;
};

type TokenClaims = {
  role?: AppRole;
  roles?: string[];
  username?: string;
  department?: string;
  deptId?: string;
  uid?: string;
  unit?: string;
  loginDate?: string;
  sub?: string;
  WMSDept: string;
  WMSUnit: string;
};

const roleMap: Record<string, AppRole> = {
  ADMIN: "Admin",
  DEPARTMENT: "Departments",
  DEPARTMENTS: "Departments",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toErrorMessage = (value: unknown): string => {
  if (value instanceof Error && typeof value.message === "string") {
    return value.message;
  }
  return "Authentication failed";
};

const decryptCredential = async (value: string): Promise<string> => {
  try {
    const decrypted = await decrypt(value);
    return typeof decrypted === "string" ? decrypted : value;
  } catch {
    return value;
  }
};

const encryptPasswordForSp = (plainPassword: string): string => {
  const encryptionKey = process.env.WMS_AES_KEY || "MYKEY";
  if (!encryptionKey || encryptionKey.trim().length === 0) {
    throw new Error("Missing WMS_AES_KEY environment variable");
  }

  // .NET-compatible Rfc2898DeriveBytes settings used across enterprise apps
  const salt = Buffer.from([
    0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65,
    0x76,
  ]);
  const derived = pbkdf2Sync(encryptionKey, salt, 1000, 48, "sha1");
  const key = derived.subarray(0, 32);
  const iv = derived.subarray(32, 48);

  const algorithm = "aes-256-cbc";
  const cipher = createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([
    // C# Encoding.Unicode == UTF-16LE
    cipher.update(Buffer.from(plainPassword, "utf16le")),
    cipher.final(),
  ]);
  return encrypted.toString("base64");
};

const normalizeRole = (value: unknown): AppRole | undefined => {
  if (typeof value !== "string") return undefined;
  return roleMap[value.toUpperCase()];
};

const normalizeRoles = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter((role): role is string => typeof role === "string")
    .map((role) => role.toUpperCase());
};

const resolveAppRole = (
  designation: unknown,
): { role: AppRole; roles: string[] } => {
  const normalized =
    typeof designation === "string" ? designation.trim().toUpperCase() : "";
  if (normalized === "ADMIN") {
    return { role: "Admin", roles: ["ADMIN"] };
  }
  return { role: "Departments", roles: ["DEPARTMENTS"] };
};

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing username or password");
        }

        try {
          const username = (await decryptCredential(credentials.username)).trim();
          const password = await decryptCredential(credentials.password);

          if (!username || !password) {
            throw new Error("Missing username or password");
          }

          const pool = await getConnection();

          // Authenticate via PRO_WMS-GET with APP-IN flag
          const loginResult = await pool
            .request()
            .input("FLAG", "APP-IN")
            .input("EmpCode", username)
            .input("Pwd", encryptPasswordForSp(password))
            .execute("PRO-WMS_GET");

          const firstRow = loginResult.recordset?.[0] as
            | SpAuthRow
            | Record<string, unknown>
            | undefined;

          if (!firstRow) {
            throw new Error("Invalid credentials");
          }
          // console.log(firstRow, "firstrow")

          const firstValue = Object.values(firstRow)[0];
          if (
            typeof firstValue === "string" &&
            firstValue.toLowerCase().includes("unauthorised")
          ) {
            throw new Error("Unauthorised User !");
          }

          const user = firstRow as SpAuthRow;
          const employeeCode = user["USER ID"];
          const displayName = user.NAME;
          const email = user.EMAIL;
          const { role: defaultRole, roles } = resolveAppRole(user.Desg);

          if (employeeCode === undefined || employeeCode === null) {
            throw new Error("Invalid login response");
          }

          return {
            id: String(employeeCode),
            username:
              typeof displayName === "string" && displayName.trim().length > 0
                ? displayName
                : username,
            email: typeof email === "string" ? email : null,
            department:
              typeof user.DEPT === "string" && user.DEPT.trim().length > 0
                ? user.DEPT
                : undefined,
            deptId:
              user.DEPTID !== null && user.DEPTID !== undefined
                ? String(user.DEPTID)
                : undefined,
            uid:
              user.UID !== null && user.UID !== undefined
                ? String(user.UID)
                : undefined,
            unit:
              user.UNIT !== null && user.UNIT !== undefined
                ? String(user.UNIT)
                : undefined,
            WMSDept:
              user.WMSDept !== null && user.WMSDept !== undefined
                ? String(user.WMSDept)
                : undefined,
            WMSUnit:
              user.WMSUnit !== null && user.WMSUnit !== undefined
                ? String(user.WMSUnit)
                : undefined,
            role: defaultRole,
            roles: roles,
          };
        } catch (error: unknown) {
          console.error("Auth Error:", error);
          throw new Error(toErrorMessage(error));
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const tokenRecord = token as Record<string, unknown>;
      const tokenClaims = tokenRecord as TokenClaims;

      if (process.env.NODE_ENV === "development") {
        // console.log("[jwt][before]", { token, user });
      }

      if (user) {

        const safeUser: Record<string, unknown> = isRecord(user) ? user : {};
        const userRole = normalizeRole(safeUser.role);
        const userRoles = normalizeRoles(safeUser.roles);
        const userName =
          typeof safeUser.username === "string" ? safeUser.username : undefined;
        const userDepartment =
          typeof safeUser.department === "string"
            ? safeUser.department
            : undefined;
        const userDeptId =
          safeUser.deptId !== null && safeUser.deptId !== undefined
            ? String(safeUser.deptId)
            : undefined;
        const userUid =
          safeUser.uid !== null && safeUser.uid !== undefined
            ? String(safeUser.uid)
            : undefined;
        const userUnit =
          safeUser.unit !== null && safeUser.unit !== undefined
            ? String(safeUser.unit)
            : undefined;

        const userWMSUnit =
          safeUser.WMSUnit !== null && safeUser.WMSUnit !== undefined
            ? String(safeUser.WMSUnit)
            : undefined;

        const userWMSDept =
          safeUser.WMSDept !== null && safeUser.WMSDept !== undefined
            ? String(safeUser.WMSDept)
            : undefined;

        if (process.env.NODE_ENV === "development") {
          // console.log("[jwt][initial-signin]", {
          //   role: userRole,
          //   roles: userRoles,
          // });
        }
        tokenClaims.role = userRole;
        tokenClaims.roles = userRoles;
        tokenClaims.username = userName;
        tokenClaims.department = userDepartment;
        tokenClaims.deptId = userDeptId;
        tokenClaims.uid = userUid;
        tokenClaims.unit = userUnit;
        tokenClaims.WMSUnit = userWMSUnit!;
        tokenClaims.WMSDept = userWMSDept!;
        tokenClaims.loginDate = new Date().toISOString().slice(0, 10);
      }

      if (process.env.NODE_ENV === "development") {
        // console.log("[jwt][after]", token);
      }

      return token;
    },
    async session({ session, token }) {
      const tokenRecord = token as Record<string, unknown>;
      const tokenClaims = tokenRecord as TokenClaims;

      if (process.env.NODE_ENV === "development") {
        // console.log("[session][before]", { session, token });
      }

      if (session.user) {
        const safeSessionUser = session.user as typeof session.user &
          Record<string, unknown>;
        safeSessionUser.role =
          typeof tokenClaims.role === "string" ? tokenClaims.role : undefined;
        safeSessionUser.roles = Array.isArray(tokenClaims.roles)
          ? tokenClaims.roles.map((role) => role)
          : undefined;
        safeSessionUser.username =
          typeof tokenClaims.username === "string"
            ? tokenClaims.username
            : undefined;
        safeSessionUser.department =
          typeof tokenClaims.department === "string"
            ? tokenClaims.department
            : undefined;
        safeSessionUser.deptId =
          typeof tokenClaims.deptId === "string"
            ? tokenClaims.deptId
            : undefined;
        safeSessionUser.uid =
          typeof tokenClaims.uid === "string" ? tokenClaims.uid : undefined;
        safeSessionUser.unit =
          typeof tokenClaims.unit === "string" ? tokenClaims.unit : undefined;
        safeSessionUser.WMSUnit =
          typeof tokenClaims.WMSUnit === "string" ? tokenClaims.WMSUnit : undefined;
        safeSessionUser.WMSDept =
          typeof tokenClaims.WMSDept === "string" ? tokenClaims.WMSDept : undefined;
        safeSessionUser.loginDate =
          typeof tokenClaims.loginDate === "string"
            ? tokenClaims.loginDate
            : undefined;
        safeSessionUser.id =
          typeof tokenClaims.sub === "string" ? tokenClaims.sub : "";
      }

      if (process.env.NODE_ENV === "development") {
        // console.log("[session][after]", session);
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
