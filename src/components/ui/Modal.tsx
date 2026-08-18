import { X } from "lucide-react";
import { useEffect, useId, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  onClose: () => void;
}

export function Modal({ open, title, eyebrow, description, children, footer, wide = false, onClose }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="modal-layer" role="presentation">
      <button className="modal-backdrop" type="button" onClick={onClose} aria-label="关闭对话框" />
      <section className={`modal-card${wide ? " modal-wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="modal-header">
          <div>
            {eyebrow ? <span className="detail-kicker">{eyebrow}</span> : null}
            <h2 id={titleId}>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="关闭"><X size={17} /></button>
        </header>
        <div className="modal-body">{children}</div>
        {footer ? <footer className="modal-footer">{footer}</footer> : null}
      </section>
    </div>
  );
}
