export default function FairPlay() {
  const rules = [
    {
      icon: '🚫',
      title: 'No Hacks or Cheats',
      desc: 'Using any third-party software, aimbots, wallhacks, speed hacks, or any tool that provides an unfair advantage is strictly prohibited. Detected cheaters are permanently banned.'
    },
    {
      icon: '🤝',
      title: 'No Teaming',
      desc: 'In solo matches, teaming with other players is not allowed. In duo/squad matches, only your registered team members may play together. Teaming with opponents results in immediate disqualification.'
    },
    {
      icon: '📱',
      title: 'Use Your Registered Account',
      desc: 'You must play on the BGMI account whose ID you registered with. Account sharing or playing on behalf of another player is not allowed and will result in a ban.'
    },
    {
      icon: '📸',
      title: 'Honest Screenshots',
      desc: 'Submit only genuine, unedited screenshots of the end-game results screen. The screenshot must clearly show your BGMI name, rank, and kill count. Cropped, edited, or fake screenshots result in disqualification and a permanent ban.'
    },
    {
      icon: '⏰',
      title: 'Join on Time',
      desc: 'Room ID and password are sent to your email before the match. You must join the room within the specified time. Late joiners may forfeit their slot with no refund.'
    },
    {
      icon: '🎮',
      title: 'Play on the Correct Map & Mode',
      desc: 'Always play on the map and mode specified in the tournament details. Playing on a different map or mode will result in your result being invalidated.'
    },
    {
      icon: '🔇',
      title: 'Respectful Conduct',
      desc: 'Harassment, abuse, or toxic behavior toward other players or admins will not be tolerated. This includes in-game chat, social media, or any other platform related to BGMI Arena.'
    },
    {
      icon: '📋',
      title: 'Result Disputes',
      desc: 'If you believe a result is incorrect, raise a dispute within 24 hours with clear screenshot evidence. Admin decisions after review are final.'
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <div className="text-5xl mb-4">⚖️</div>
        <h1 className="text-3xl font-black mb-2">Fair Gameplay Policy</h1>
        <p className="text-gray-500 text-sm max-w-xl mx-auto">
          BGMI Arena is built on fair competition. These rules ensure every player has an equal chance to win. Violations are taken seriously.
        </p>
      </div>

      <div className="space-y-4">
        {rules.map((r, i) => (
          <div key={i} className="card flex gap-4 items-start">
            <div className="text-2xl shrink-0 mt-0.5">{r.icon}</div>
            <div>
              <h3 className="font-bold text-white mb-1">{r.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 card border-red-500/20 bg-red-500/5">
        <h3 className="font-bold text-red-400 mb-2">⚠️ Consequences of Violations</h3>
        <div className="text-sm text-gray-400 space-y-1.5">
          <p>• First offence: Disqualification from current tournament, no refund</p>
          <p>• Second offence: 30-day account suspension</p>
          <p>• Third offence / severe violation: Permanent ban and forfeiture of wallet balance</p>
        </div>
      </div>

      <p className="text-center text-gray-600 text-xs mt-8">
        Questions? Contact us at support@bgmiarena.com
      </p>
    </div>
  );
}
