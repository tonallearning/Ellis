"use client";

import { useRef } from "react";
import { theWork } from "../../../content/from-ty/the-work";

export function TheWork() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function open() {
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="focus-ring rounded-full px-3 py-2 text-xs tracking-wide text-text-secondary uppercase transition hover:text-text-primary"
      >
        The work
      </button>

      <dialog
        ref={dialogRef}
        className="work-dialog"
        aria-labelledby="the-work-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <article className="work-note glass-panel w-full max-w-[52rem] overflow-y-auto rounded-3xl px-6 py-7 sm:px-10 sm:py-9">
          <header className="flex items-start justify-between gap-6">
            <div>
              <p className="text-text-secondary text-[0.65rem] tracking-[0.28em] uppercase">
                {theWork.kicker}
              </p>
              <h2
                id="the-work-title"
                className="text-text-primary mt-4 max-w-[17ch] text-[clamp(2rem,6vw,3.4rem)] leading-[1.03] font-medium tracking-[-0.045em]"
              >
                {theWork.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              className="focus-ring text-text-secondary hover:text-text-primary -mt-1 -mr-1 rounded-full px-2 py-1 text-xs tracking-wide uppercase"
            >
              Close
            </button>
          </header>

          <div className="mt-8 max-w-[43rem] space-y-4 sm:mt-10">
            {theWork.lead.map((paragraph, index) => (
              <p
                key={paragraph}
                className={
                  index === 0
                    ? "text-text-secondary text-[1.05rem] leading-[1.75] sm:text-[1.15rem]"
                    : "text-text-primary text-xl font-medium tracking-tight sm:text-2xl"
                }
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="border-border mt-9 grid border-y sm:grid-cols-3">
            {theWork.pieces.map((piece, index) => (
              <section
                key={piece.name}
                className="work-piece border-border py-5 sm:px-5 sm:py-6"
              >
                <p className="text-text-secondary font-mono text-[0.62rem] tracking-[0.18em] uppercase">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="text-text-primary mt-3 text-sm font-semibold">
                  {piece.name}
                </h3>
                <p className="text-text-secondary mt-2 text-sm leading-[1.65]">
                  {piece.text}
                </p>
              </section>
            ))}
          </div>

          <blockquote className="text-text-primary mt-9 max-w-[36rem] text-[clamp(1.3rem,3.4vw,1.8rem)] leading-[1.35] tracking-[-0.025em]">
            {theWork.question}
          </blockquote>

          <div className="border-border mt-8 flex max-w-[43rem] gap-4 border-t pt-6">
            <span aria-hidden="true" className="text-accent mt-[0.15rem] text-lg">
              —
            </span>
            <p className="text-text-secondary text-sm leading-[1.7] sm:text-[0.95rem]">
              {theWork.close}
            </p>
          </div>
        </article>
      </dialog>
    </>
  );
}
