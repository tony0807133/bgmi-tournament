import { Link } from 'react-router-dom';

const steps = [
  {
    phase: 'Getting Started',
    color: 'orange',
    items: [
      {
        step: '1',
        icon: '📝',
        title: 'Create an Account',
        desc: 'Register with your email or sign in with Google. Fill in your BGMI in-game name and ID — these are used to verify your identity during matches.',
        tip: 'Make sure your BGMI ID matches exactly what appears in-game.'
      },
      {
        step: '2',
        icon: '🔍',
        title: 'Browse Tournaments',
        desc: 'Go to the Tournaments page to see all upcoming events. Filter by type (Solo, Duo, Squad) or check the prize pool and entry fee before joining.',
        tip: 'Free tournaments are a great way to get started without any risk.'
      },
      {
        step: '3',
        icon: '💰',
        title: 'Add Wallet Balance (for paid tournaments)',
        desc: 'Go to your Wallet page and deposit money using Razorpay (UPI, cards, net banking). Your balance is stored securely and can be used for any tournament.',
        tip: 'You can also pay directly via Razorpay at registration without pre-loading your wallet.'
      },
    ]
  },
  {
    phase: 'Joining a Tournament',
    color: 'blue',
    items: [
      {
        step: '4',
        icon: '🎮',
        title: 'Register for a Tournament',
        desc: 'Open a tournament and click "Register Now". For solo, your BGMI name is auto-filled. For duo/squad, enter your teammates\' BGMI IDs and names.',
        tip: 'Only the team leader registers and pays. Make sure your teammates\' IDs are correct.'
      },
      {
        step: '5',
        icon: '📧',
        title: 'Receive Room Details',
        desc: 'Before the match starts, the admin sends the Room ID and Password to your registered email. Check your inbox (and spam folder) around match time.',
        tip: 'Do not share the room ID with anyone outside your registered team.'
      },
      {
        step: '6',
        icon: '⚔️',
        title: 'Play the Match',
        desc: 'Join the custom room in BGMI using the Room ID and Password from your email. Play your best — kills and rank both count toward prizes.',
        tip: 'Join the room at least 5 minutes before the match starts to avoid missing your slot.'
      },
    ]
  },
  {
    phase: 'Claiming Your Prize',
    color: 'green',
    items: [
      {
        step: '7',
        icon: '📸',
        title: 'Take a Screenshot',
        desc: 'After the match ends, take a screenshot of the final results screen. It must clearly show your BGMI name, rank, and kill count. Do not crop or edit it.',
        tip: 'Screenshot the full results screen — partial screenshots are rejected.'
      },
      {
        step: '8',
        icon: '⬆️',
        title: 'Upload Your Screenshot',
        desc: 'Go to My Matches, find the tournament, and upload your screenshot. Only the team leader uploads for duo/squad teams.',
        tip: 'You can re-upload if you made a mistake, until admin verifies.'
      },
      {
        step: '9',
        icon: '✅',
        title: 'Admin Verification',
        desc: 'The admin reviews your screenshot and verifies your result. Once verified, your prize is automatically credited to your BGMI Arena wallet.',
        tip: 'Verification usually happens within a few hours after the match ends.'
      },
      {
        step: '10',
        icon: '🏦',
        title: 'Withdraw Your Winnings',
        desc: 'Go to your Wallet, add your UPI ID, and request a withdrawal. Minimum withdrawal is ₹10. Funds are sent to your UPI within 3–5 business days.',
        tip: 'Make sure your UPI ID is correct before requesting a withdrawal.'
      },
    ]
  }
];

const colorMap = {
  orange: { badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30', dot: 'bg-orange-500', line: 'bg-orange-500/20' },
  blue:   { badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',   dot: 'bg-blue-500',   line: 'bg-blue-500/20'   },
  green:  { badge: 'bg-green-500/20 text-green-400 border-green-500/30', dot: 'bg-green-500',  line: 'bg-green-500/20'  },
};

export default function HowToUse() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="text-5xl mb-4">📖</div>
        <h1 className="text-3xl font-black mb-2">How to Use BGMI Arena</h1>
        <p className="text-gray-500 text-sm max-w-xl mx-auto">
          From registration to withdrawing your winnings — everything you need to know in one place.
        </p>
      </div>

      <div className="space-y-10">
        {steps.map(phase => {
          const c = colorMap[phase.color];
          return (
            <div key={phase.phase}>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold mb-5 ${c.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
                {phase.phase}
              </div>
              <div className="space-y-4">
                {phase.items.map((item) => (
                  <div key={item.step} className="card flex gap-4 items-start">
                    <div className={`w-8 h-8 rounded-full ${c.dot} flex items-center justify-center text-white font-black text-sm shrink-0`}>
                      {item.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white mb-1">{item.icon} {item.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-2">{item.desc}</p>
                      <div className="flex items-start gap-1.5 bg-white/3 rounded-lg px-3 py-2 border border-white/5">
                        <span className="text-yellow-400 text-xs shrink-0 mt-0.5">💡</span>
                        <p className="text-xs text-gray-500">{item.tip}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 card border-orange-500/20 text-center">
        <p className="text-gray-400 text-sm mb-4">Ready to play your first tournament?</p>
        <Link to="/tournaments" className="btn-primary">Browse Tournaments</Link>
      </div>
    </div>
  );
}
