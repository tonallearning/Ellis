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
        <article className="glass-panel w-full max-w-[40rem] max-h-[min(36rem,80dvh)] overflow-y-auto rounded-3xl px-6 py-7 sm:px-8 sm:py-8">
          <header className="flex items-start justify-between gap-6">
            <div>
              <p className="text-text-secondary text-[0.65rem] tracking-[0.28em] uppercase">
                {theWork.kicker}
              </p>
              <h2
                id="the-work-title"
                className="text-text-primary mt-2 text-2xl font-medium tracking-tight"
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

          <div className="mt-5 flex flex-col gap-5">
            {theWork.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="text-text-secondary max-w-prose text-[1.05rem] leading-[1.7]"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <p className="text-text-primary mt-8 max-w-prose text-sm leading-relaxed">
            {theWork.close}
          </p>
        </article>
      </dialog>
    </>
  );
}
