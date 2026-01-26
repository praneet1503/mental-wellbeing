export const metadata = {
  title: "EchoMind Privacy",
  description: "Privacy policy for EchoMind.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-16 max-w-3xl space-y-6">
        <h1 className="text-3xl font-semibold text-slate-900">Privacy</h1>
        <p className="text-sm text-slate-600">
          EchoMind collects only the data needed to provide the service. We do not sell personal
          data. Authentication is handled by Firebase. Chat content is not logged in application
          logs.
        </p>
        <p className="text-sm text-slate-600">
          You can request deletion by contacting support. We recommend not sharing sensitive
          information you do not want stored.
        </p>
      </div>
    </main>
  );
}
