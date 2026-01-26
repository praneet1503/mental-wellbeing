export const metadata = {
  title: "EchoMind Terms",
  description: "Terms of service for EchoMind.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-16 max-w-3xl space-y-6">
        <h1 className="text-3xl font-semibold text-slate-900">Terms</h1>
        <p className="text-sm text-slate-600">
          EchoMind is for emotional wellbeing support and reflection. It does not provide medical
          advice, diagnosis, or treatment. By using this service, you agree to use it responsibly
          and seek professional help when needed.
        </p>
        <p className="text-sm text-slate-600">
          Do not use EchoMind for emergencies. If you are in immediate danger, contact local
          emergency services.
        </p>
      </div>
    </main>
  );
}
