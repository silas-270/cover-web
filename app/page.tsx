import FileProcessor from "@/components/FileProcessor";
import DownloadSection from "@/components/DownloadSection";
import DataFormSection from "@/components/DataFormSection";
import SettingsModal from "@/components/SettingsModal";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">

      {/* ── Top bar ── */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">

          {/* Wordmark */}
          <div className="flex items-center gap-3">
            {/* TUM Blue accent rule */}
            <span
              className="block w-[3px] h-6 rounded-full"
              style={{ background: "var(--primary)" }}
              aria-hidden="true"
            />
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
              PDF Tools
            </span>
          </div>

          <SettingsModal />
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="max-w-4xl mx-auto px-6 py-10">

        {/* Page title block */}
        <div className="mb-10 pb-8 border-b border-border">
          <p className="text-[11px] font-medium tracking-[0.16em] uppercase text-primary mb-2">
            Document Generator
          </p>
          <h1 className="text-[1.75rem] font-semibold tracking-tight text-foreground leading-snug">
            Cover PDF Generator
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Lade ein kombiniertes PDF oder mehrere Bilder hoch, die alle deine Aufgaben in der richtigen Reihenfolge enthalten.
            <br /> Die Seite fügt je nach Auswahl ein Deckblatt zum gesamten Dokument hinzu oder teilt es in einzelne Aufgaben auf.
            <br /> Füge deine Teammitglieder in den Einstellungen hinzu.
          </p>
        </div>

        {/* Step sections */}
        <div className="space-y-6">

          {/* Step 1 */}
          <Section step={1} title="Deine Daten">
            <DataFormSection />
          </Section>

          {/* Step 2 */}
          <Section step={2} title="Dateien hochladen">
            <FileProcessor />
          </Section>

          {/* Step 3 */}
          <Section step={3} title="Download">
            <DownloadSection />
          </Section>

        </div>
      </main>

    </div>
  );
};

/* ── Section wrapper ── */
interface SectionProps {
  step: number;
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ step, title, children }) => (
  <section className="rounded-lg border border-border bg-card overflow-hidden">

    {/* Section header */}
    <div
      className="flex items-center gap-3 px-6 py-4 border-b border-border"
      style={{ background: "var(--muted)" }}
    >
      {/* Step badge */}
      <span
        className="flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-semibold text-primary-foreground flex-shrink-0"
        style={{ background: "var(--primary)" }}
      >
        {step}
      </span>
      <h2 className="text-sm font-semibold text-foreground tracking-wide">
        {title}
      </h2>
    </div>

    {/* Section body */}
    <div className="px-6 py-6">
      {children}
    </div>

  </section>
);

export default Home;