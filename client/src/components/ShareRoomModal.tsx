import { useEffect } from "react";
import ShareRoom from "./ShareRoom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  roomCode: string;
}

export default function ShareRoomModal({
  open,
  onClose,
  roomCode,
}: ModalProps) {
  // ⌨️ Close on Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose} // 🖱️ outside click
    >
      <div
        onClick={(e) => e.stopPropagation()} // stop bubbling so inside click doesn’t close
        className="relative w-full max-w-md px-4"
      >
        {/* Dialog content */}
        <ShareRoom roomCode={roomCode} />
      </div>
    </div>
  );
}
