"use client"
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const modules = [
  {
    title: "Waste Generation Tracking",
    description:
      "Capture daily waste generation from each department with source-wise quantity and traceable records.",
  },
  {
    title: "Category & Process Mapping",
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

  const { data: session } = useSession()
  const [username, setUsername] = useState("")

  useEffect(() => {
    if (!session) return
    // console.log(session)
    setUsername(session?.user?.name!)
  }, [session, username])

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-no-repeat "
    // style={{ backgroundImage: 'url("/homepage.png")' }}
    >
      <h1 className="font-medium text-md text-center text-gray-950 place-self-center ">
        Hello! <span className="text-lg px-1 py-0.5  text-teal-700  rounded  font-semibold opacity-75">{session?.user.username}</span>.
        {/* <br /> */}
        You are logged in as <span className="ps-1 py-0.5 text-[#b5056c] text-lg rounded font-semibold opacity-75">{session?.user.roleName}</span>.
        <br />
        <span className="text-xs">Use the navigation menu on the left to get started</span>
      </h1>

      <img src="/homepage.png" alt="" className="h-[400px] w-full mt-1.5" />


      {/* <div className="absolute bg-white/75" />
      <div className="relative mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl p-8 shadow-sm md:p-10"> */}

      {/* <p className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Waste Management System
          </p> */}
      {/* <h1 className="font-medium text-md text-center text-gray-500">
            Hello ! <span className="text-[#4795ed] text-lg font-semibold">{session?.user.username} </span>
            <br />
            Welcome to <span className="text-teal-600 text-xl">Waste Management System</span>
            <br />
            You are logged in as <span className="px-1 py-0.5 text-[#db0058] font-semibold">{session?.user.roleName} </span>
          </h1> */}
      {/* <h1 className="text-3xl font-bold text-slate-900 md:text-2xl">
            Digital platform for tracking, controlling, and improving waste
            management operations
          </h1> */}
      {/* <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600 md:text-sm">
            This application is built to monitor waste generation, standardize
            handling workflows, and provide actionable insights for operational
            and environmental performance. It helps teams capture accurate data,
            maintain compliance, and drive continuous improvement in waste
            reduction practices.
          </p> */}
      {/* </section> */}

      {/* <section className="grid gap-4 md:grid-cols-3">
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
        </section> */}

      {/* <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            What This Application Delivers
          </h2>
          <ul className="mt-5 grid gap-2">
            {outcomes.map((point) => (
              <li
                key={point}
                className="rounded-xl bg-slate-200 px-4 py-3 text-sm text-slate-700"
              >
                {point}
              </li>
            ))}
          </ul>
        </section> */}
      {/* </div> */}
    </main >
  );
}
