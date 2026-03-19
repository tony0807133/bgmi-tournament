import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

const upiQr = (upiId, upiName, amt) => {
  const str = amt
    ? `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amt}&cu=INR`
    : `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&cu=INR`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(str)}`;
};

function Steps({ current }) {
  const steps = ["Choose Amount", "Pay via UPI", "Upload Proof"];
  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
              i < current ? "bg-green-500 border-green-500 text-white" :
              i === current ? "bg-orange-500 border-orange-500 text-white" :
              "bg-transparent border-white/20 text-gray-500"
            }`}>
              {i < current ? "✓" : i + 1}
            </div>
            <span className={`text-[10px] font-semibold text-center leading-tight ${i === current ? "text-orange-400" : i < current ? "text-green-400" : "text-gray-600"}`}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 flex-1 mb-4 transition-all ${i < current ? "bg-green-500" : "bg-white/10"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function TxList({ transactions }) {
  const [filter, setFilter] = useState("all");
  const filtered = transactions.filter(tx => filter === "all" || tx.type === filter);
  return (
    <div>
      <div className="flex gap-2 mb-3">
        {[["all","All"],["credit","Credits"],["debit","Debits"]].map(([k,l]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
              filter === k ? "bg-orange-500 border-orange-500 text-white" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
            }`}>{l}</button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.length === 0
          ? <div className="card text-center py-10 text-gray-500 text-sm">No transactions yet</div>
          : filtered.map(tx => (
            <div key={tx._id} className="card flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                  tx.type === "credit" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                }`}>{tx.type === "credit" ? "+" : "−"}</div>
                <div>
                  <p className="text-sm font-medium leading-tight">{tx.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(tx.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: true })}</p>
                </div>
              </div>
              <span className={`font-black text-base ${tx.type === "credit" ? "text-green-400" : "text-red-400"}`}>
                {tx.type === "credit" ? "+" : "−"}₹{tx.amount}
              </span>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default function Wallet() {
  const { setUser } = useAuth();
  const [data, setData]               = useState({ wallet: 0, upiId: "", transactions: [] });
  const [deposits, setDeposits]       = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [referral, setReferral]       = useState(null);
  const [upiSettings, setUpiSettings] = useState({ upiId: "", upiName: "BGMI Arena", upiQrUrl: "" });
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState(false);
  const [tab, setTab]                 = useState("transactions");
  const [step, setStep]               = useState(0);
  const [amount, setAmount]           = useState("");
  const [utr, setUtr]                 = useState("");
  const [file, setFile]               = useState(null);
  const [preview, setPreview]         = useState(null);
  const [submitting, setSubmitting]   = useState(false);
  const [wForm, setWForm]             = useState({ amount: "", upiId: "" });
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchData = async () => {
    try {
      const [w, dep, wd, ref, settings] = await Promise.all([
        axios.get("/api/wallet"),
        axios.get("/api/wallet/deposits"),
        axios.get("/api/wallet/withdrawals"),
        axios.get("/api/users/referral").catch(() => ({ data: null })),
        axios.get("/api/wallet/settings").catch(() => ({ data: { upiId: "", upiName: "BGMI Arena", upiQrUrl: "" } }))
      ]);
      setData(w.data);
      setDeposits(dep.data);
      setWithdrawals(wd.data);
      setReferral(ref.data);
      setUpiSettings(settings.data);
      setWForm(f => ({ ...f, upiId: w.data.upiId || "" }));
      if (setUser) setUser(u => u ? { ...u, wallet: w.data.wallet } : u);
    } catch { setFetchError(true); }
  };

  useEffect(() => { fetchData().finally(() => setLoading(false)); }, []);

  const pickFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Only image files allowed"); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error("Max 5 MB"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submitDeposit = async () => {
    if (!file) { toast.error("Upload your payment screenshot"); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("amount", Number(amount));
      fd.append("utrNumber", utr);
      fd.append("screenshot", file);
      await axios.post("/api/wallet/deposit", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Deposit submitted! Admin will verify shortly.");
      setStep(0); setAmount(""); setUtr(""); setFile(null); setPreview(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally { setSubmitting(false); }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (Number(wForm.amount) < 10) return toast.error("Minimum Rs.10");
    setWithdrawing(true);
    try {
      await axios.post("/api/wallet/withdraw", { amount: Number(wForm.amount), upiId: wForm.upiId });
      toast.success("Withdrawal request submitted!");
      setWForm(f => ({ ...f, amount: "" }));
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setWithdrawing(false); }
  };

  const sb = {
    pending:  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    approved: "bg-green-500/10 text-green-400 border-green-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20"
  };

  if (loading) return <div className="flex justify-center items-center py-32"><div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" /></div>;
  if (fetchError) return (
    <div className="max-w-xl mx-auto px-4 py-32 text-center">
      <p className="text-gray-400 mb-4">Failed to load wallet</p>
      <button onClick={() => { setFetchError(false); setLoading(true); fetchData().finally(() => setLoading(false)); }} className="btn-primary">Retry</button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black">My Wallet</h1>
        <p className="text-gray-500 text-sm mt-1">Add money, withdraw winnings, track history</p>
      </div>

      <div className="relative overflow-hidden rounded-2xl mb-6 p-8 text-center border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent">
        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <p className="text-gray-400 text-xs mb-1 uppercase tracking-widest font-semibold">Available Balance</p>
        <p className="text-7xl font-black mt-2">
          <span className="text-gray-400 text-4xl align-top mt-3 inline-block">Rs.</span>
          <span className="text-orange-400">{data.wallet}</span>
        </p>
        <p className="text-gray-600 text-xs mt-3">Prize winnings credited to team leader</p>
      </div>

      {referral?.referralCode && (
        <div className="card mb-5 border-purple-500/20 bg-gradient-to-br from-purple-500/8 to-transparent">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-bold text-purple-400">Refer and Earn Rs.20</p>
              <p className="text-xs text-gray-500 mt-0.5">You and your friend both get Rs.20 on signup</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-lg tracking-widest text-purple-300 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">{referral.referralCode}</span>
              <button onClick={() => { navigator.clipboard.writeText(referral.referralCode); toast.success("Copied!"); }} className="btn-secondary text-xs px-3 py-2">Copy</button>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">{referral.referralCount || 0} friends referred</p>
        </div>
      )}

      <div className="card mb-5 border-green-500/15">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center text-green-400 font-black text-xl">+</div>
          <div>
            <p className="font-black text-base">Add Money</p>
            <p className="text-xs text-gray-500">UPI transfer · Admin verified · Usually within 1 hr</p>
          </div>
        </div>
        <Steps current={step} />
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {QUICK_AMOUNTS.map(a => (
                <button key={a} type="button" onClick={() => setAmount(String(a))}
                  className={`py-2.5 rounded-xl text-sm font-black border transition-all ${
                    amount === String(a)
                      ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20"
                      : "bg-white/5 border-white/10 text-gray-300 hover:border-green-500/40 hover:text-white"
                  }`}>Rs.{a}</button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-lg">{"\u20B9"}</span>
              <input className="input pl-9 text-lg font-black" type="number" min="10" step="1"
                placeholder="Custom amount" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <button onClick={() => { if (!amount || Number(amount) < 10) { toast.error("Minimum Rs.10"); return; } setStep(1); }}
              className="btn-primary w-full py-3 text-base">
              Continue to Pay
            </button>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="shrink-0 flex flex-col items-center gap-2">
                  <div className="w-[140px] h-[140px] rounded-2xl overflow-hidden bg-white p-2 shadow-xl">
                    <img src={upiSettings.upiQrUrl || upiQr(upiSettings.upiId, upiSettings.upiName, amount)} alt="UPI QR" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-xs text-gray-500">Scan with any UPI app</p>
                </div>
                <div className="flex-1 w-full space-y-3">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/8">
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Pay to UPI ID</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-black text-orange-400 text-sm break-all">{upiSettings.upiId || "Not configured"}</p>
                      <button onClick={() => { navigator.clipboard.writeText(upiSettings.upiId); toast.success("Copied!"); }}
                        className="shrink-0 text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-colors">Copy</button>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/8">
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Amount to Pay</p>
                    <p className="font-black text-2xl text-green-400">Rs.{amount}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/8">
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Account Name</p>
                    <p className="font-semibold text-white text-sm">{upiSettings.upiName}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-2 bg-yellow-500/8 border border-yellow-500/20 rounded-xl p-3">
                <span className="text-yellow-400 text-sm mt-0.5">!</span>
                <p className="text-xs text-yellow-300">Pay exactly <span className="font-black">Rs.{amount}</span>. Do not close this page after paying.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(0)} className="btn-secondary flex-1 py-3">Back</button>
              <button onClick={() => setStep(2)} className="btn-primary flex-1 py-3">I have Paid - Upload Proof</button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-green-500/8 border border-green-500/20 rounded-xl p-3 flex items-center gap-3">
              <span className="text-green-400 text-xl">✓</span>
              <div>
                <p className="text-sm font-bold text-green-400">Payment of Rs.{amount} done?</p>
                <p className="text-xs text-gray-400">Upload your payment screenshot as proof</p>
              </div>
            </div>
            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all ${
              preview ? "border-green-500/40 bg-green-500/5" : "border-white/15 hover:border-orange-500/40 hover:bg-white/3"
            }`}>
              {preview ? (
                <div className="w-full flex flex-col items-center gap-3">
                  <img src={preview} alt="screenshot" className="max-h-48 rounded-xl object-contain shadow-lg" />
                  <p className="text-xs text-green-400 font-semibold">Screenshot uploaded</p>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-3">📸</div>
                  <p className="text-sm font-semibold text-gray-300">Upload Payment Screenshot</p>
                  <p className="text-xs text-gray-500 mt-1">JPG or PNG · Max 5 MB</p>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={pickFile} />
            </label>
            {preview && (
              <button type="button" onClick={() => { setFile(null); setPreview(null); }}
                className="text-xs text-red-400 hover:text-red-300 transition-colors">Remove screenshot</button>
            )}
            <input className="input" type="text" placeholder="UTR / Transaction ID (optional)"
              value={utr} onChange={e => setUtr(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">Back</button>
              <button onClick={submitDeposit} disabled={submitting || !file} className="btn-primary flex-1 py-3 disabled:opacity-50">
                {submitting ? "Submitting..." : "Submit for Approval"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card mb-6 border-white/8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 font-black text-lg">↑</div>
          <div>
            <p className="font-black text-base">Withdraw Winnings</p>
            <p className="text-xs text-gray-500">Min Rs.10 · Sent to your UPI within 24 hrs</p>
          </div>
        </div>
        <form onSubmit={handleWithdraw} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Your UPI ID</label>
            <input className="input" placeholder="name@paytm / name@upi / name@okaxis"
              value={wForm.upiId} onChange={e => setWForm({ ...wForm, upiId: e.target.value })} required />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{"\u20B9"}</span>
              <input className="input pl-9" type="number" min="10" max={data.wallet} placeholder="0"
                value={wForm.amount} onChange={e => setWForm({ ...wForm, amount: e.target.value })} required />
            </div>
            <p className="text-xs text-gray-600 mt-1">Available: <span className="text-orange-400 font-bold">Rs.{data.wallet}</span></p>
          </div>
          <button type="submit" className="btn-primary w-full py-3" disabled={withdrawing || data.wallet < 10}>
            {withdrawing ? "Submitting..." : "Request Withdrawal"}
          </button>
        </form>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {[["transactions", data.transactions.length], ["deposits", deposits.length], ["withdrawals", withdrawals.length]].map(([t, count]) => (
          <button key={t} onClick={() => setTab(t)} className={`tab-btn capitalize ${tab === t ? "tab-active" : "tab-inactive"}`}>
            {t} <span className="ml-1 text-xs opacity-50">({count})</span>
          </button>
        ))}
      </div>

      {tab === "transactions" && <TxList transactions={data.transactions} />}

      {tab === "deposits" && (
        <div className="space-y-2">
          {deposits.length === 0
            ? <div className="card text-center py-10 text-gray-500 text-sm">No deposit requests yet</div>
            : deposits.map(d => (
              <div key={d._id} className="card py-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="font-black text-lg text-green-400">+Rs.{d.amount}</p>
                  <span className={`badge border text-xs ${sb[d.status]}`}>{d.status}</span>
                </div>
                {d.utrNumber && <p className="text-xs text-gray-400">UTR: <span className="font-mono">{d.utrNumber}</span></p>}
                <p className="text-xs text-gray-600 mt-1">{new Date(d.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: true })}</p>
                {d.adminNote && <p className="text-xs text-gray-400 mt-1.5 bg-white/3 rounded-lg px-2.5 py-1.5">Note: {d.adminNote}</p>}
                {d.screenshotUrl && <a href={d.screenshotUrl} target="_blank" rel="noreferrer" className="text-xs text-orange-400 hover:underline mt-1 block">View screenshot</a>}
              </div>
            ))
          }
        </div>
      )}

      {tab === "withdrawals" && (
        <div className="space-y-2">
          {withdrawals.length === 0
            ? <div className="card text-center py-10 text-gray-500 text-sm">No withdrawal requests</div>
            : withdrawals.map(w => (
              <div key={w._id} className="card py-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="font-black text-lg">Rs.{w.amount}</p>
                  <span className={`badge border text-xs ${sb[w.status]}`}>{w.status}</span>
                </div>
                <p className="text-sm text-gray-400 font-mono">{w.upiId}</p>
                <p className="text-xs text-gray-600 mt-1">{new Date(w.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: true })}</p>
                {w.adminNote && <p className="text-xs text-gray-400 mt-1.5 bg-white/3 rounded-lg px-2.5 py-1.5">Note: {w.adminNote}</p>}
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

