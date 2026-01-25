export const metadata = {
  title: "EchoMind Disclaimer",
  description: "Safety disclaimer for EchoMind.",
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-16 max-w-3xl space-y-6">
        <h1 className="text-3xl font-semibold text-slate-900">Disclaimer</h1>
        <p className="text-sm text-slate-600">
          EchoMind is not a medical device and does not provide medical advice or diagnoses.
          It is intended for general wellbeing and reflection. If you are in crisis or at risk
          of harm, contact local emergency services immediately.
        </p>
      </div>
    </main>
  );
}
