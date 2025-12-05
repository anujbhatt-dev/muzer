import Landing from "./components/Landing";

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text-primary)" }}>
      <Landing />
    </main>
  );
}
