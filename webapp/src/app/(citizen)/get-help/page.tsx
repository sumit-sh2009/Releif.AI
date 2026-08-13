import GetHelpWizard from "@/components/get-help/GetHelpWizard";

export default function GetHelpPage() {
  return (
    <div className="w-full max-w-xl">
      <div className="text-center mb-14">
        <p className="type-overline text-red-400/90 mb-5">Emergency assistance</p>
        <h1 className="type-display text-[var(--text-primary)] mb-5">Request help now</h1>
        <p className="type-body-lg text-[var(--text-secondary)] prose-width mx-auto">
          Tell us what you need. We&apos;ll log your request and connect you with responders.
        </p>
      </div>
      <GetHelpWizard />
    </div>
  );
}
