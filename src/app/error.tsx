"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="section">
      <p className="eyebrow">LET’S TRY THAT AGAIN</p>
      <h1>Your workspace couldn’t load.</h1>
      <p>
        Your saved progress is unchanged. Check your connection or database
        setup and retry.
      </p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
