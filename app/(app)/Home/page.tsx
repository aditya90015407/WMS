const modules = [
  {
    title: "Waste Generation Tracking",
    description:
      "Capture daily waste generation from each department with source-wise quantity and traceable records.",
  },
  {
    title: "Category and Process Mapping",
    description:
      "Classify waste streams, assign treatment paths, and standardize operational handling across units.",
  },
  {
    title: "Compliance and Reporting",
    description:
      "Generate structured reports for internal audits, statutory requirements, and management review.",
  },
];

const outcomes = [
  "Centralized visibility of waste data across plants, departments, and timelines.",
  "Faster decision making using consistent records and measurable trends.",
  "Improved accountability through role-based tracking and process ownership.",
  "Support for sustainability targets through monitored reduction initiatives.",
];

export default function HomePage() {
  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-no-repeat p-2 md:p-4"
      style={{ backgroundImage: 'url("/wms pic.jpg")' }}
    >
      <div className="absolute inset-0 bg-white/75" />
      <div className="relative z-10 mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-sm md:p-10">
          <p className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Waste Management System
          </p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Digital platform for tracking, controlling, and improving waste
            management operations
          </h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600 md:text-base">
            This application is built to monitor waste generation, standardize
            handling workflows, and provide actionable insights for operational
            and environmental performance. It helps teams capture accurate data,
            maintain compliance, and drive continuous improvement in waste
            reduction practices.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {modules.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-slate-900">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <h2 className="text-2xl font-semibold text-slate-900">
            What This Application Delivers
          </h2>
          <ul className="mt-5 grid gap-3">
            {outcomes.map((point) => (
              <li
                key={point}
                className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
              >
                {point}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
