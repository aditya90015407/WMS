import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import GenerateForm from "@/components/generate-form";

const formatDate = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default async function GeneratePage() {
  const session = await getServerSession(authOptions);
  const sessionUser =
    typeof session?.user === "object" && session.user !== null
      ? (session.user as { loginDate?: string })
      : undefined;
  const loginDate =
    typeof sessionUser?.loginDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(sessionUser.loginDate)
      ? sessionUser.loginDate
      : formatDate(new Date());

  const minDateObj = new Date(`${loginDate}T00:00:00`);
  minDateObj.setDate(minDateObj.getDate() - 2);
  const minAllowedDate = formatDate(minDateObj);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Generate</h1>
      <p className="mt-2 text-sm text-slate-600">
        Enter waste generation details below.
      </p>

      <GenerateForm loginDate={loginDate} minAllowedDate={minAllowedDate} />
    </section>
  );
}
