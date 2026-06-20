import React, { useState, useEffect } from "react";

// --- TYPE INTERFACES FOR AUDIT LOGGING ---
interface VisitorLog {
  timestamp: string;
  action: string;
  device: string;
}

interface RegisteredUserLog extends VisitorLog {
  userId: string;
  savedAlertsCount: number;
}

interface BargainOwnerLog extends VisitorLog {
  showroomName: string;
  activeInventoryCount: number;
}

export default function App() {
  // --- STATE ENGINES ---
  const [language, setLanguage] = useState<"EN" | "UR">("EN");
  const [activeTab, setActiveTab] = useState<"marketplace" | "upload">(
    "marketplace",
  );
  const [budget, setBudget] = useState<string>("");
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [aiInput, setAiInput] = useState<string>("");

  // Custom theme selector for Bargain/Showroom custom micro-themes
  const [currentShowroomTheme, setCurrentShowroomTheme] = useState<
    "neon-cyan" | "amber-glow"
  >("neon-cyan");

  // Logs tracking state
  const [logs, setLogs] = useState<
    Array<VisitorLog | RegisteredUserLog | BargainOwnerLog>
  >([]);

  // --- AUTOMOTIVE SEED DATA DICTIONARIES (PAKISTAN STANDARDS) ---
  const pakistaniBrands = [
    "Suzuki",
    "Toyota",
    "Honda",
    "KIA",
    "Hyundai",
    "Changan",
    "MG",
    "Proton",
    "Porsche",
    "BMW",
    "Audi",
    "Mercedes-Benz",
  ];

  const pakistaniModels: Record<string, string[]> = {
    Suzuki: ["Alto", "Cultus", "Swift", "Wagon R", "Mehran"],
    Toyota: ["Corolla", "Yaris", "Fortuner", "Prado", "Hilux Revo"],
    Honda: ["Civic", "City", "BR-V", "HR-V"],
    KIA: ["Sportage", "Picanto", "Stonic", "Sorento"],
    Hyundai: ["Tucson", "Elantra", "Sonata", "Porter"],
    Changan: ["Alsvin", "Oshan X7", "Karvaan"],
    MG: ["HS", "ZS", "MG4"],
  };

  // Generate dynamic array of years from 2000 to 2026
  const yearsArray = Array.from({ length: 2026 - 2000 + 1 }, (_, i) =>
    (2026 - i).toString(),
  );

  // --- SIMULATED USER LOGGING AUDITS ---
  const captureLog = (actionDescription: string) => {
    const newLog: VisitorLog = {
      timestamp: new Date().toLocaleTimeString(),
      action: actionDescription,
      device: window.innerWidth < 768 ? "Mobile Viewport" : "Desktop Monitor",
    };
    setLogs((prevLogs) => [newLog, ...prevLogs].slice(0, 5)); // Keep last 5 actions
  };

  // Log entry event on component mounting
  useEffect(() => {
    captureLog("Anonymous Portal Session Initiated");
  }, []);

  // --- AI LOGIC PARSER MOCKUP ---
  const handleAiParsing = () => {
    if (!aiInput.trim()) return;
    captureLog(`AI Query Submited: "${aiInput.substring(0, 20)}..."`);
    // Simulating Gemini processing engine filling the structured data points
    setBudget("3450000");
    setSelectedMake("Toyota");
    setSelectedModel("Yaris");
    setSelectedYear("2022");
    alert(
      language === "EN"
        ? "AI has successfully analyzed description and populated form fields!"
        : "مصنوعی ذہانت نے تفصیل کا تجزیہ کر کے فارم بھر دیا ہے!",
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white antialiased">
      {/* 🚀 1. HIGH-SPEED TOP LIVE ACTIVITY TICKER */}
      <div className="w-full bg-orange-600 text-white overflow-hidden py-1.5 border-b border-orange-500 relative z-50 text-xs font-bold tracking-wide shadow-md">
        <div className="inline-block whitespace-nowrap animate-[marquee_12s_linear_infinite] hover:[animation-play-state:paused] cursor-pointer">
          🔥 LIVE REVENUE FEED: Toyota Corolla 2021 sold in Lahore for Rs.
          5,200,000 • Suzuki Alto 2023 verified at Islamabad Showroom • Civic X
          2018 Deal closed in Karachi • New Bargain Owner "Auto Choice Lahore"
          registered online • 🔥 LIVE REVENUE FEED: Toyota Corolla 2021 sold in
          Lahore for Rs. 5,200,000 • Suzuki Alto 2023 verified at Islamabad
          Showroom • Civic X 2018 Deal closed in Karachi • New Bargain Owner
          "Auto Choice Lahore" registered online •
        </div>
      </div>

      {/* 🛡️ 2. REFINED CLEAN TOP NAVIGATION NAVBAR */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Main Focused App Brand identity */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => {
              setActiveTab("marketplace");
              captureLog("Navigated to main market");
            }}
          >
            <span className="text-2xl font-black tracking-tighter text-white">
              BAZAR<span className="text-orange-500">360</span>
            </span>
            <span className="bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded">
              Automotive Portal
            </span>
          </div>

          {/* Interactive Core Layout Management */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                setActiveTab("marketplace");
                captureLog("Viewed Fleet Market");
              }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === "marketplace" ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
            >
              {language === "EN" ? "Browse Showrooms" : "شورومز دیکھیں"}
            </button>
            <button
              onClick={() => {
                setActiveTab("upload");
                captureLog("Opened Inventory Submission Form");
              }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === "upload" ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
            >
              {language === "EN" ? "✦ Sell Your Car (AI)" : "✦ گاڑی بیچیں (AI)"}
            </button>

            {/* NEW ADDITION: Top Header Verified Showrooms Button Shortcut */}
            <button
              onClick={() => {
                captureLog(
                  "Header Action: Filtered to verified inventory status",
                );
                setCurrentShowroomTheme(
                  currentShowroomTheme === "neon-cyan"
                    ? "amber-glow"
                    : "neon-cyan",
                );
              }}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {language === "EN" ? "Verified Showrooms" : "تصدیق شدہ شورومز"}
            </button>

            {/* Globalization Language Switch Utility Toggle */}
            <button
              onClick={() => {
                setLanguage(language === "EN" ? "UR" : "EN");
                captureLog(
                  `Changed Language state to ${language === "EN" ? "Urdu" : "English"}`,
                );
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-2 text-xs rounded-lg border border-slate-700 transition-all"
            >
              {language === "EN" ? "اردو (UR)" : "English (EN)"}
            </button>
          </div>
        </div>
      </header>

      {/* 🔮 3. MAIN DASHBOARD CONTENT GRID MULTI-DEVICE WRAPPER */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {activeTab === "marketplace" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ================= LEFT COLUMN STRUCTURES ================= */}
            <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
              {/* BLOCK A: VERIFIED SHOWROOM MODULE (TOP LEFT POSITION) */}
              <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 text-sm">
                        🏪
                      </span>
                      {language === "EN"
                        ? "Premium Premium Showrooms"
                        : "پریمیم کار ڈیلرشپ"}
                    </h2>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {language === "EN"
                        ? "Top authorized dealerships nationwide"
                        : "ملک بھر کے بہترین ڈیلرز کی لسٹ"}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-sky-400 bg-sky-400/10 px-2.5 py-1 rounded-full border border-sky-400/20">
                    Active Channels
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Custom Dealer Card with adaptive Micro Theme Elements */}
                  <div
                    className={`p-4 rounded-xl transition-all border ${currentShowroomTheme === "neon-cyan" ? "bg-slate-950 border-sky-500/20 shadow-md shadow-sky-500/5" : "bg-slate-950 border-amber-500/20 shadow-md shadow-amber-500/5"}`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm text-white">
                        Auto Choice Motors
                      </h3>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      G-11 Markaz, Islamabad
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-slate-900 flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">
                        14 Active Fleet Cars
                      </span>
                      <span
                        className="text-orange-400 hover:underline cursor-pointer"
                        onClick={() =>
                          captureLog("Opened Auto Choice Inventory View")
                        }
                      >
                        View Collection →
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl hover:border-slate-700 transition-all">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm text-white">
                        Karakoram Wheels
                      </h3>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      DHA Phase 6, Karachi
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-slate-900 flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">
                        29 Active Fleet Cars
                      </span>
                      <span
                        className="text-orange-400 hover:underline cursor-pointer"
                        onClick={() =>
                          captureLog("Opened Karakoram Inventory View")
                        }
                      >
                        View Collection →
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* BLOCK B: LIVE ACTIVITY FEED MODULE (BENEATH VERIFIED SHOWROOMS) */}
              <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                    {language === "EN"
                      ? "Live System Audit Feeds"
                      : "لائیو سسٹم سرگرمی"}
                  </h2>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Real-time Session Track
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-850 rounded-xl divide-y divide-slate-900 font-mono text-xs overflow-hidden shadow-inner">
                  {logs.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">
                      Awaiting user platform events to generate standard runtime
                      logs...
                    </div>
                  ) : (
                    logs.map((log, index) => (
                      <div
                        key={index}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-900/50 transition-colors"
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="text-slate-500">
                            [{log.timestamp}]
                          </span>
                          <span className="text-orange-400 font-medium">
                            {log.action}
                          </span>
                        </div>
                        <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-300 self-start sm:self-auto">
                          {log.device}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* VEHICLE LISTINGS CARDS SUBGRID */}
              <section className="space-y-4">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {language === "EN"
                    ? "Featured Live Inventory"
                    : "موجودہ گاڑیاں"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Car Card 1 */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col group">
                    <div className="h-44 bg-slate-950 flex items-center justify-center text-slate-600 relative font-black text-xl uppercase tracking-widest border-b border-slate-850 group-hover:text-slate-500 transition-colors">
                      [ Vehicle Preview Canvas ]
                      <span className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur text-orange-400 text-xs px-2.5 py-1 rounded font-bold border border-slate-800">
                        Rs. 3,850,000
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-white text-base">
                          Suzuki Cultus VXL
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Model Year: 2022 • Islamabad Registered • Manual
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          captureLog(
                            "Initiated communication route with dealer",
                          )
                        }
                        className="mt-4 w-full bg-slate-800 hover:bg-orange-600 hover:text-white text-slate-200 text-xs font-bold py-2.5 rounded-lg border border-slate-700 hover:border-orange-500 transition-all"
                      >
                        {language === "EN"
                          ? "Contact Showroom Owner"
                          : "ڈیلر سے رابطہ کریں"}
                      </button>
                    </div>
                  </div>

                  {/* Car Card 2 */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col group">
                    <div className="h-44 bg-slate-950 flex items-center justify-center text-slate-600 relative font-black text-xl uppercase tracking-widest border-b border-slate-850 group-hover:text-slate-500 transition-colors">
                      [ Vehicle Preview Canvas ]
                      <span className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur text-orange-400 text-xs px-2.5 py-1 rounded font-bold border border-slate-800">
                        Rs. 7,400,000
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-white text-base">
                          Honda Civic Oriel
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Model Year: 2020 • Lahore Registered • Automatic
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          captureLog(
                            "Initiated communication route with dealer",
                          )
                        }
                        className="mt-4 w-full bg-slate-800 hover:bg-orange-600 hover:text-white text-slate-200 text-xs font-bold py-2.5 rounded-lg border border-slate-700 hover:border-orange-500 transition-all"
                      >
                        {language === "EN"
                          ? "Contact Showroom Owner"
                          : "ڈیلر سے رابطہ کریں"}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* ================= RIGHT COLUMN STRUCTURES ================= */}
            {/* 🔄 MERGED UNIFIED COMMAND SEARCH CONSOLE CONTAINER */}
            <div className="order-1 lg:order-2">
              <aside className="sticky top-28 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                    <span className="text-orange-500">⚡</span>
                    {language === "EN"
                      ? "Unified Filter Matrix"
                      : "سرچ اور فلٹرز مکس"}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === "EN"
                      ? "Refine global vehicle data in real-time"
                      : "بیک وقت تمام تر چیزیں فلٹر کریں"}
                  </p>
                </div>

                {/* Live Model Filter Block */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {language === "EN"
                        ? "Select Brand (Make)"
                        : "برانڈ منتخب کریں"}
                    </label>
                    <select
                      value={selectedMake}
                      onChange={(e) => {
                        setSelectedMake(e.target.value);
                        setSelectedModel("");
                        captureLog(`Selected Make Filter: ${e.target.value}`);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                    >
                      <option value="">
                        {language === "EN"
                          ? "-- All Available Brands --"
                          : "-- تمام برانڈز --"}
                      </option>
                      {pakistaniBrands.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dropdown 2: Dynamic Model Mapping */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {language === "EN"
                        ? "Select Car Model"
                        : "ماڈل منتخب کریں"}
                    </label>
                    <select
                      value={selectedModel}
                      disabled={!selectedMake}
                      onChange={(e) => {
                        setSelectedModel(e.target.value);
                        captureLog(`Selected Model Filter: ${e.target.value}`);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 disabled:opacity-40 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                    >
                      <option value="">
                        {language === "EN"
                          ? "-- Choose Variant/Model --"
                          : "-- ماڈل چنیں --"}
                      </option>
                      {selectedMake &&
                        pakistaniModels[selectedMake]?.map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Dropdown 3: Minimum Year Constraint Filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {language === "EN"
                        ? "Minimum Registration Year"
                        : "کم از کم ماڈل سال"}
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => {
                        setSelectedYear(e.target.value);
                        captureLog(
                          `Set Minimum Year filter to: ${e.target.value}`,
                        );
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                    >
                      <option value="">
                        {language === "EN"
                          ? "-- Select Year Limit (Min 2000) --"
                          : "-- سال کا انتخاب --"}
                      </option>
                      {yearsArray.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PKR Budget Input Box Area */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {language === "EN"
                        ? "Maximum Budget (PKR / Rs.)"
                        : "زیادہ سے زیادہ بجٹ (روپے)"}
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <span className="text-slate-500 text-xs font-bold">
                          Rs.
                        </span>
                      </div>
                      <input
                        type="number"
                        placeholder="e.g. 4500000"
                        value={budget}
                        onChange={(e) => {
                          setBudget(e.target.value);
                          captureLog(
                            `Updated target budget range limit to Rs. ${e.target.value}`,
                          );
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      captureLog(
                        `Executed Comprehensive Search Query Engine: ${selectedMake || "Any"} ${selectedModel || "All"} up to Rs. ${budget || "Any"}`,
                      );
                      alert(
                        language === "EN"
                          ? "Filtering inventory matches across all verified networks..."
                          : "گاڑیوں کی ڈیٹا بیس میں سرچنگ جاری ہے...",
                      );
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98]"
                  >
                    {language === "EN" ? "Execute Search Command" : "تلاش کریں"}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedMake("");
                      setSelectedModel("");
                      setBudget("");
                      setSelectedYear("");
                      captureLog(
                        "Reset Search Filters Matrix to Initial Parameters",
                      );
                    }}
                    className="w-full mt-2 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs py-2 rounded-lg transition-colors"
                  >
                    {language === "EN"
                      ? "Clear Active Filters"
                      : "فلٹرز صاف کریں"}
                  </button>
                </div>
              </aside>
            </div>
          </div>
        ) : (
          /* ================= INTERACTIVE COMPREHENSIVE UPLOAD ADVERTISEMENT VIEW ================= */
          <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-2xl space-y-8 animate-[fadeIn_0.3s_ease-out]">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>📝</span>
                {language === "EN"
                  ? "Create Premium Inventory Advertisement"
                  : "نئی گاڑی کا اشتہار لگائیں"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {language === "EN"
                  ? "Supports External Individual Sellers, Registered Showrooms, and Fleet Administrators."
                  : "تمام بائرز، ڈیلرز اور ایڈمنز کے لئے یکساں اور آسان فارم"}
              </p>
            </div>

            {/* PART A: THE GEMINI SUPPORTIVE RAW NATURAL TEXT WINDOW */}
            <div className="p-4 bg-gradient-to-r from-sky-950/40 to-slate-950 border border-sky-500/10 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                  {language === "EN"
                    ? "Gemini AI Intelligent Description Helper"
                    : "جیمنی آرٹیشل انٹیلیجنس سپورٹ ونڈو"}
                </label>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-md font-mono">
                  AI Active
                </span>
              </div>
              <textarea
                rows={3}
                placeholder={
                  language === "EN"
                    ? "Paste raw paragraph text descriptive details here (e.g., 'I want to list my 2022 red Toyota Yaris for 34.5 Lakhs...')"
                    : "یہاں گاڑی کی تفصیل لکھیں، جیسے: 'میرے پاس ٹویوٹا یارس ۲۰۲۲ ماڈل ہے، مانگی گئی قیمت ساڑھے ۳۴ لاکھ روپے ہے...۔'"
                }
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-400 font-sans leading-relaxed"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAiParsing}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-md shadow-sky-600/10"
                >
                  {language === "EN"
                    ? "✦ Auto-Populate Fields via AI"
                    : "✦ جیمنی سے ڈیٹا فارم بھریں"}
                </button>
              </div>
            </div>

            {/* PART B: STANDARD STRUCTURED FORM CONTROLS */}
            <form
              className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2"
              onSubmit={(e) => {
                e.preventDefault();
                captureLog("Submitted structural vehicle form packet");
                alert("Inventory form processed successfully");
              }}
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">
                  {language === "EN" ? "Vehicle Brand Name" : "گاڑی کا برانڈ"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Toyota"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">
                  {language === "EN" ? "Model Variant Code" : "گاڑی کا ماڈل"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Yaris Ativ X"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">
                  {language === "EN"
                    ? "Engine Power Output (CC)"
                    : "انجن کی گنجائش (CC)"}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1300"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">
                  {language === "EN"
                    ? "Total Mileage Record (KM)"
                    : "چلی ہوئی مائلیج (کلومیٹر)"}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 45000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">
                  {language === "EN"
                    ? "Transmission Configuration"
                    : "ٹرانسمیشن کی قسم"}
                </label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500">
                  <option>Automatic / CVT</option>
                  <option>Manual Gearbox</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">
                  {language === "EN"
                    ? "City of Registration"
                    : "رجسٹریشن کا شہر"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Islamabad"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="sm:col-span-2 pt-4 border-t border-slate-850 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("marketplace");
                    captureLog("Cancelled inventory submission steps");
                  }}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {language === "EN" ? "Cancel & Exit" : "منسوخ کریں"}
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/20"
                >
                  {language === "EN"
                    ? "Publish Advertisement Live"
                    : "اشتہار آن لائن اپ لوڈ کریں"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* 🏢 4. FOOTER CREDITS BRAND LAYER */}
      <footer className="mt-16 border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500 font-mono tracking-tight">
        <div>
          &copy; 2026 BAZAR360 Ecosystem Portal Network. All Rights Reserved.
        </div>
        <div className="text-[10px] text-slate-600 mt-1">
          Compiled Securely via Dedicated Production Framework. Running Active
          Node Hooks.
        </div>
      </footer>
    </div>
  );
}
