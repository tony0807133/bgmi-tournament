import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const statusConfig = {
  paid: 'bg-green-500/10 text-green-400 border-green-500/20',
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  refunded: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
};

const steps = [
  { step: '1', icon: '🎮', title: 'Play the Match', desc: 'Join the room using the ID & password sent to your email.' },
  { step: '2', icon: '📸', title: 'Take Screenshot', desc: 'After the match ends, screenshot the final results screen showing your rank & kills.' },
  { step: '3', icon: '⬆️', title: 'Upload Here', desc: 'Come back to My Matches and upload the screenshot. Only team leader uploads.' },
  { step: '4', icon: '💰', title: 'Get Paid', desc: 'Admin verifies your screenshot and credits the prize to your wallet.' },
];

export default function MyRegistrations() {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileRefs = useRef({});

  const fetchRegs = () => axios.get('/api/registrations/my').then(r => setRegs(r.data));
  useEffect(() => { fetchRegs().finally(() => setLoading(false)); }, []);

  const uploadScreenshot = async (regId) => {
    const file = fileRefs.current[regId]?.files[0];
    if (!file) return toast.error('Select a file first');
    const fd = new FormData();
    fd.append('screenshot', file);
    try {
      await axios.post(`/api/registrations/${regId}/screenshot`, fd);
      toast.success('Screenshot uploaded!');
      fetchRegs();
    } catch {
      toast.error('Upload failed');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent"></div>
    </div>
  );

  const hasActiveMatch = regs.some(r =>
    (r.tournament?.status === 'ongoing' || r.tournament?.status === 'completed') &&
    r.paymentStatus !== 'refunded'
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black">My Registrations</h1>
        <p className="text-gray-500 text-sm mt-1">{regs.length} total registrations</p>
      </div>

      {regs.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-5xl mb-4">🎮</div>
          <p className="text-gray-400 font-medium">No registrations yet</p>
          <p className="text-gray-600 text-sm mt-1">Join a tournament to get started</p>
          <a href="/tournaments" className="btn-primary mt-4 inline-flex">Browse Tournaments</a>
        </div>
      ) : (
        <div>
          {/* How to claim prize — instruction banner */}
          {hasActiveMatch && (
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4 mb-6">
              <h3 className="font-bold text-orange-400 mb-3 flex items-center gap-2 text-sm">
                <span>📋</span> How to Claim Your Prize
              </h3>
              <div className="space-y-3">
                {steps.map(s => (
                  <div key={s.step} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {s.step}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{s.icon} {s.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-orange-500/10">
                <p className="text-xs text-gray-500 flex items-start gap-1.5">
                  <span className="text-yellow-400 shrink-0">⚠️</span>
                  <span>Screenshot must show the <span className="text-white font-medium">end-game results screen</span> with your BGMI name, rank &amp; kills. Cropped or edited screenshots will be rejected.</span>
                </p>
              </div>
            </div>
          )}

          {/* Registration cards */}
          <div className="space-y-4">
            {regs.map(reg => (
              <div key={reg._id} className="card hover:border-white/10 transition-all">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{reg.tournament?.title}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-gray-500 text-sm">Team: <span className="text-white font-medium">{reg.teamName}</span></span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-500 text-sm">Slot <span className="text-orange-400 font-bold">#{reg.slotNumber}</span></span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`badge border text-xs ${statusConfig[reg.paymentStatus]}`}>{reg.paymentStatus}</span>
                    <span className="badge bg-white/5 text-gray-400 text-xs uppercase">{reg.tournament?.type}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white/3 rounded-xl p-3 text-center border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">Paid</p>
                    <p className="font-black text-orange-400">₹{reg.amountPaid}</p>
                  </div>
                  <div className="bg-white/3 rounded-xl p-3 text-center border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">Rank</p>
                    <p className="font-black text-white">{reg.rank || '—'}</p>
                  </div>
                  <div className="bg-white/3 rounded-xl p-3 text-center border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">Kills</p>
                    <p className="font-black text-yellow-400">{reg.kills || '—'}</p>
                  </div>
                </div>

                {reg.prizeAwarded > 0 && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4 flex items-center gap-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <p className="text-green-400 font-black text-lg">₹{reg.prizeAwarded} Won!</p>
                      <p className="text-xs text-gray-500">Credited to your wallet</p>
                    </div>
                  </div>
                )}

                {/* Screenshot section */}
                {(reg.tournament?.status === 'ongoing' || reg.tournament?.status === 'completed') && reg.paymentStatus !== 'refunded' && (
                  <div className="mt-3">
                    {!reg.winningScreenshot ? (
                      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                        <p className="text-sm font-bold text-yellow-400 mb-2">📸 Upload Winning Screenshot</p>
                        <div className="text-xs text-gray-500 mb-3 space-y-1.5">
                          <p className="flex items-start gap-1.5"><span className="text-green-400 shrink-0">✓</span> <span>Screenshot of the <span className="text-white font-medium">end-game results screen</span></span></p>
                          <p className="flex items-start gap-1.5"><span className="text-green-400 shrink-0">✓</span> <span>Your BGMI name, rank &amp; kills must be visible</span></p>
                          <p className="flex items-start gap-1.5"><span className="text-red-400 shrink-0">✕</span> <span>Do not crop or edit the screenshot</span></p>
                          <p className="flex items-start gap-1.5"><span className="text-blue-400 shrink-0">i</span> <span>Only team leader uploads (for duo/squad)</span></p>
                        </div>
                        <div className="flex gap-2">
                          <input type="file" accept="image/*" ref={el => fileRefs.current[reg._id] = el}
                            className="input text-sm flex-1 py-2 min-w-0" />
                          <button onClick={() => uploadScreenshot(reg._id)} className="btn-primary text-sm px-4 py-2 shrink-0">Upload</button>
                        </div>
                      </div>
                    ) : reg.screenshotVerified ? (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-3">
                        <span className="text-xl">✅</span>
                        <div>
                          <p className="text-green-400 font-bold text-sm">Screenshot Verified</p>
                          <p className="text-xs text-gray-500">Admin has verified your result</p>
                        </div>
                        <img src={reg.winningScreenshot} alt="Screenshot" className="h-12 w-16 rounded-lg object-cover border border-white/10 ml-auto" />
                      </div>
                    ) : (
                      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">⏳</span>
                            <div>
                              <p className="text-blue-400 font-bold text-sm">Screenshot Submitted</p>
                              <p className="text-xs text-gray-500">Waiting for admin verification</p>
                            </div>
                          </div>
                          <img src={reg.winningScreenshot} alt="Screenshot" className="h-12 w-16 rounded-lg object-cover border border-white/10" />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <input type="file" accept="image/*" ref={el => fileRefs.current[reg._id] = el}
                            className="input text-xs flex-1 py-1.5" />
                          <button onClick={() => uploadScreenshot(reg._id)} className="btn-secondary text-xs px-3 py-1.5">Re-upload</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
