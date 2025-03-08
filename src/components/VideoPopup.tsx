import { useEffect } from "react";

interface VideoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

export default function VideoPopup({
  isOpen,
  onClose,
  videoUrl,
}: VideoPopupProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose} />x
      <div className="relative w-full max-w-5xl mx-4 z-10">
        <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={videoUrl + "?&autoplay=1&rel=0"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
