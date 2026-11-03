import { ImageResponse } from "next/og";

export const alt = "PaperFree – Kostenlose PDF-Werkzeuge, 100 % lokal im Browser";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const tools = ["Zusammenfügen", "Teilen", "Drehen", "Komprimieren", "Bilder zu PDF", "PDF zu Bildern"];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #3b0764 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
            }}
          >
            P
          </div>
          <div style={{ fontSize: "44px", display: "flex" }}>
            Paper<span style={{ color: "#a5b4fc" }}>Free</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ fontSize: "66px", lineHeight: 1.08, maxWidth: "1000px" }}>
            Alle PDF-Werkzeuge. Kostenlos. Komplett privat.
          </div>
          <div style={{ fontSize: "30px", color: "#cbd5e1" }}>Die quelloffene Alternative zu Adobe Acrobat & iLovePDF.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <div style={{ display: "flex", fontSize: "24px", color: "#94a3b8" }}>{tools.join("  ·  ")}</div>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "14px 28px",
              borderRadius: "999px",
              background: "rgba(16, 185, 129, 0.18)",
              border: "2px solid rgba(52, 211, 153, 0.6)",
              color: "#6ee7b7",
              fontSize: "28px",
              whiteSpace: "nowrap",
            }}
          >
            100% Lokal: Deine Dateien verlassen niemals deinen Browser.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
