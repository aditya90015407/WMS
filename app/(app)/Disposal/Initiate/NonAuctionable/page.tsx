"use client";

import { useEffect, useState } from "react";

type Option = { id: string; name: string };

export default function NonAuctionablePage() {
  const [wasteCategory, setWasteCategory] = useState("");
  const [waste, setWaste] = useState("");
  const[Date,setDate]=useState("");
  const [loadingBase, setLoadingBase] = useState(false);
  const [loadingWaste, setLoadingWaste] = useState(false);

  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [wasteOptions, setWasteOptions] = useState<Option[]>([]);
  const [selectedWasteIds, setSelectedWasteIds] = useState<string[]>([]);
  const [wasteDropdownOpen, setWasteDropdownOpen] = useState(false);

  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    const loadBase = async () => {
      setLoadingBase(true);
      try {
        const wcRes = await fetch("/api/auth/Waste/generate?type=drop-wc", {
          cache: "no-store",
        });
        const wcPayload = (await wcRes.json()) as { success?: boolean; data?: Option[] };

        setCategoryOptions(
          wcPayload.success && Array.isArray(wcPayload.data) ? wcPayload.data : [],
        );
      } catch (err) {
        console.error("loadBase failed", err);
        setCategoryOptions([]);
      } finally {
        setLoadingBase(false);
      }
    };
    void loadBase();
  }, []);

  useEffect(() => {
    const loadWaste = async () => {
      if (!wasteCategory) {
        setWasteOptions([]);
        setSelectedWasteIds([]);
        setWaste("");
        return;
      }

      setLoadingWaste(true);
      try {
        const res = await fetch(
          `/api/auth/Waste/generate?type=drop-waste&wcid=${encodeURIComponent(wasteCategory)}`,
          { cache: "no-store" },
        );
        const payload = (await res.json()) as { success?: boolean; data?: Option[] };
        const data = payload.success && Array.isArray(payload.data) ? payload.data : [];
        setWasteOptions(data);
        setSelectedWasteIds([]);
        setWaste("");
      } catch {
        setWasteOptions([]);
        setSelectedWasteIds([]);
        setWaste("");
      } finally {
        setLoadingWaste(false);
      }
    };

    void loadWaste();
  }, [wasteCategory]);

  const selectedWasteNames = wasteOptions
    .filter((w) => selectedWasteIds.includes(w.id))
    .map((w) => w.name);

        const onSubmit = async(e: React.FormEvent) => {
          e.preventDefault();
          
          if(!Date){
            alert("Please select the Date");
            return
          }

          if (!wasteCategory || selectedWasteIds.length === 0) {
            alert("Please select waste category and at least one waste item.");
            return;
          }
          
          
            const res=await fetch("api/SetData?SetNonAuctionableDisposal",{
              method:"POST",
              headers:{"Content-Type":"application/json"},
              body:JSON.stringify({
                Auctionable:0,
                AuctionDate:Date,
                wasteCategoryId : wasteCategory,
                wasteIds:selectedWasteIds,
                remarks,
              }),

            });

          const data=await res.json();
          if(!res.ok || !data.success)
          {
            return alert(data.message || "Save Failed");
          }
        alert("Saved Successfully")
          
        };

  return (
    <section className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Non Auctionable Disposal</h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">

       <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Date</label>
          <input
            type="date"
            value={Date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Waste Category</label>
          <select
            value={wasteCategory}
            onChange={(e) => {
              setWasteCategory(e.target.value);
              setWasteDropdownOpen(false);
            }}
            className="w-full rounded border border-slate-300 px-3 py-2"
            disabled={loadingBase}
          >
            <option value="">{loadingBase ? "Loading..." : "Select Waste Category"}</option>
            {categoryOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <label className="mb-1 block text-sm font-semibold text-slate-700">Waste List</label>

          <button
            type="button"
            onClick={() => setWasteDropdownOpen((prev) => !prev)}
            disabled={!wasteCategory || loadingWaste}
            className="w-full rounded border border-slate-300 px-3 py-2 text-left disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {selectedWasteNames.length > 0
              ? selectedWasteNames.join(", ")
              : loadingWaste
              ? "Loading..."
              : "Select Waste Items"}
          </button>

          {wasteDropdownOpen && (
            <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded border border-slate-300 bg-white p-2 shadow">
              {wasteOptions.length === 0 ? (
                <p className="px-2 py-1 text-sm text-slate-500">No waste options</p>
              ) : (
                wasteOptions.map((item) => {
                  const checked = selectedWasteIds.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className="flex items-center gap-2 rounded px-2 py-1 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const nextIds = e.target.checked
                            ? [...selectedWasteIds, item.id]
                            : selectedWasteIds.filter((id) => id !== item.id);

                          setSelectedWasteIds(nextIds);

                          const names = wasteOptions
                            .filter((w) => nextIds.includes(w.id))
                            .map((w) => w.name)
                            .join(", ");
                          setWaste(names);

                          // close dropdown immediately after each selection/deselection
                          setWasteDropdownOpen(false);
                        }}
                      />
                      <span className="text-sm text-slate-700">{item.name}</span>
                    </label>
                  );
                })
              )}
            </div>
          )}

          {selectedWasteNames.length > 0 && (
            <p className="mt-1 text-xs text-slate-600">
              Selected: {selectedWasteNames.join(", ")}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800"
        >
          Submit
        </button>
      </form>
    </section>
  );
}
