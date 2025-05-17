import { useState, useEffect } from "react";
import { ClipboardCopy, Check, Share2 } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  roomCode: string; // e.g. "ABCD"
}

export default function ShareRoom({ roomCode }: Props) {
  const inviteURL = `${window.location.origin}/room/${roomCode}`;

  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(!!navigator.share);
  }, []);

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join my Spotify room",
          text: `Use code ${roomCode} to join our playlist room!`,
          url: inviteURL,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-zinc-800/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-zinc-700"
    >
      <h3 className="text-xl font-semibold text-white mb-6 text-center">
        🎉 Room {roomCode}
      </h3>

      {/* Invite Link */}
      <label className="block text-sm text-zinc-400 mb-1">Invite Link</label>
      <div className="flex items-center gap-2 mb-4">
        <input
          readOnly
          value={inviteURL}
          onFocus={(e) => e.target.select()}
          className="flex-1 px-3 py-2 rounded-lg bg-zinc-700 text-white select-all cursor-pointer"
        />
        <button
          onClick={() => copyText(inviteURL)}
          className="p-2 rounded-lg bg-zinc-600 hover:bg-zinc-500"
        >
          {copied ? <Check size={18} /> : <ClipboardCopy size={18} />}
        </button>
      </div>

      {/* Room Code */}
      <label className="block text-sm text-zinc-400 mb-1">Room Code</label>
      <div className="flex items-center gap-2 mb-6">
        <input
          readOnly
          value={roomCode}
          onFocus={(e) => e.target.select()}
          className="flex-1 px-3 py-2 rounded-lg bg-zinc-700 text-white select-all cursor-pointer"
        />
        <button
          onClick={() => copyText(roomCode)}
          className="p-2 rounded-lg bg-zinc-600 hover:bg-zinc-500"
        >
          {copied ? <Check size={18} /> : <ClipboardCopy size={18} />}
        </button>
      </div>

      {/* Native Share (mobile) */}
      {canShare && (
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl transition-colors duration-200"
        >
          <Share2 size={18} />
          {shared ? "Shared!" : "Share"}
        </button>
      )}

      {!canShare && (
        <p className="text-sm text-zinc-400 text-center">
          Copy the link above and send it to friends.
        </p>
      )}
    </motion.div>
  );
}
