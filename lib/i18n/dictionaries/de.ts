import { cell, type ComparisonRow, type FaqEntry, type TextBlock } from "@/lib/i18n/types";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

const pages = (count: number) => `${count} ${count === 1 ? "Seite" : "Seiten"}`;
const files = (count: number) => `${count} ${count === 1 ? "Datei" : "Dateien"}`;
const images = (count: number) => `${count} ${count === 1 ? "Bild" : "Bilder"}`;
const quote = (text: string) => `„${text}“`;

const tools: Dictionary["tools"] = {
  merge: {
    title: "PDF zusammenfügen",
    navLabel: "Zusammenfügen",
    tagline: "Mehrere PDFs in einer Datei vereinen",
    description:
      "Ziehe beliebig viele PDFs hinein, bringe sie per Drag-and-Drop in die richtige Reihenfolge und füge sie zu einem Dokument zusammen.",
    metaDescription: "PDFs kostenlos zusammenfügen – ohne Upload, direkt im Browser. Reihenfolge per Drag-and-Drop festlegen.",
    highlights: ["Unbegrenzt viele Dateien", "Reihenfolge per Drag-and-Drop", "Ohne Wasserzeichen"],
    tips: [
      {
        title: "Reihenfolge festlegen",
        text: "Ziehe Dateien am Griff an die richtige Stelle oder sortiere sie mit einem Klick nach Namen – „Seite 2“ landet dabei korrekt vor „Seite 10“.",
      },
      {
        title: "Ohne Größenlimit",
        text: "Es gibt keine Begrenzung bei Dateianzahl oder Seiten. Die einzige Grenze ist der Arbeitsspeicher deines Geräts.",
      },
      {
        title: "Nur einzelne Seiten nötig?",
        text: "Extrahiere zuerst mit „PDF teilen“ die gewünschten Seiten und füge sie danach hier zusammen.",
      },
    ],
  },
  split: {
    title: "PDF teilen & Seiten extrahieren",
    navLabel: "Teilen",
    tagline: "Seiten auswählen oder per Bereich exportieren",
    description:
      "Sieh alle Seiten als Vorschau, wähle sie per Klick oder gib Bereiche wie „1-3, 5“ ein – als eine PDF, pro Bereich oder Seite für Seite.",
    metaDescription: "PDF teilen und Seiten extrahieren – per Vorschau-Raster oder Seitenbereich wie 1-3, 5. 100 % lokal im Browser.",
    highlights: ["Vorschau-Raster aller Seiten", "Bereiche wie „1-3, 5, 8-“", "Einzelseiten als ZIP"],
    tips: [
      {
        title: "Bereiche clever eingeben",
        text: "„1-3, 5“ wählt Seite 1 bis 3 und 5. „8-“ bedeutet ab Seite 8 bis zum Ende, „-4“ die ersten vier Seiten.",
      },
      {
        title: "Vier Modi",
        text: "Extrahiere eine Auswahl, erzeuge pro Bereich eine Datei, speichere jede Seite einzeln oder teile in feste Blöcke.",
      },
      {
        title: "Schnell auswählen",
        text: "Halte die Umschalttaste gedrückt, um ganze Seitenbereiche im Vorschau-Raster mit zwei Klicks zu markieren.",
      },
    ],
  },
  organize: {
    title: "Seiten organisieren & drehen",
    navLabel: "Organisieren",
    tagline: "Seiten löschen, drehen und neu anordnen",
    description:
      "Drehe einzelne Seiten um 90°, lösche überflüssige Seiten und ordne alles per Drag-and-Drop neu – mit Live-Vorschau.",
    metaDescription: "PDF-Seiten drehen, löschen und neu anordnen – kostenlos und ohne Upload direkt im Browser.",
    highlights: ["Drehen in 90°-Schritten", "Löschen & Wiederherstellen", "Neu anordnen per Drag-and-Drop"],
    tips: [
      {
        title: "Verlustfrei",
        text: "Drehen und Löschen verändert keine Inhalte: Text, Bilder und Schriften bleiben in Originalqualität erhalten.",
      },
      {
        title: "Rückgängig machen",
        text: "Gelöschte Seiten werden erst beim Speichern entfernt. Bis dahin kannst du sie jederzeit wiederherstellen.",
      },
      {
        title: "Auf dem Smartphone",
        text: "Nutze die Pfeil-Buttons unter jeder Seite, um die Reihenfolge auch ohne Drag-and-Drop zu ändern.",
      },
    ],
  },
  "images-to-pdf": {
    title: "Bilder zu PDF",
    navLabel: "Bilder → PDF",
    tagline: "PNG, JPG & WebP zu einer PDF",
    description:
      "Wandle Fotos, Scans und Screenshots in eine PDF um – mit Seitengröße, Ausrichtung, Rändern und Drehung pro Bild.",
    metaDescription: "JPG, PNG und WebP in PDF umwandeln – kostenlos, ohne Upload, mit A4-, Letter- oder Originalgröße.",
    highlights: ["PNG, JPG, WebP, GIF, BMP, AVIF", "A4, US Letter oder Bildgröße", "EXIF-Drehung wird berücksichtigt"],
    tips: [
      {
        title: "Originalqualität",
        text: "PNG- und JPG-Dateien werden ohne erneute Kompression eingebettet. WebP & Co. werden verlustarm umgewandelt.",
      },
      {
        title: "Handyfotos",
        text: "Die Ausrichtung aus den EXIF-Daten wird automatisch berücksichtigt. Falls nötig, drehe einzelne Bilder per Klick.",
      },
      {
        title: "Seitengröße",
        text: "Wähle A4 oder US Letter für druckfertige Dokumente – oder „Bildgröße“, damit jede Seite exakt so groß wie das Bild ist.",
      },
    ],
  },
  "pdf-to-images": {
    title: "PDF zu Bildern",
    navLabel: "PDF → Bilder",
    tagline: "Seiten als hochauflösende PNGs exportieren",
    description: "Rendere jede Seite in bis zu 300 DPI als PNG oder JPG und lade alles bequem als ZIP-Archiv herunter.",
    metaDescription: "PDF in PNG oder JPG umwandeln – bis 300 DPI, alle Seiten als ZIP. 100 % lokal im Browser.",
    highlights: ["Bis 300 DPI", "PNG oder JPG", "Alle Seiten als .zip"],
    tips: [
      {
        title: "Die richtige Auflösung",
        text: "150 DPI reichen für Bildschirm und Präsentationen. 300 DPI eignen sich für den Druck und für feine Details.",
      },
      {
        title: "PNG oder JPG?",
        text: "PNG ist verlustfrei und ideal für Text und Grafiken. JPG erzeugt deutlich kleinere Dateien bei Fotos und Scans.",
      },
      {
        title: "Einzelne Seite",
        text: "Fahre über eine Seite und klicke auf das Download-Symbol, um nur diese Seite sofort als Bild zu speichern.",
      },
    ],
  },
  compress: {
    title: "PDF komprimieren",
    navLabel: "Komprimieren",
    tagline: "Dateigröße mit Qualitätsregler verringern",
    description:
      "Verkleinere PDFs für E-Mail und Upload-Portale: Fotos werden neu berechnet, Text bleibt scharf – oder maximal per Canvas-Resampling.",
    metaDescription: "PDF verkleinern ohne Upload: Qualitätsregler, Smart-Modus für scharfen Text oder maximale Kompression.",
    highlights: ["Qualitätsregler 10–100 %", "Smart-Modus: Text bleibt erhalten", "Vorher/Nachher-Vergleich"],
    tips: [
      {
        title: "Smart-Modus",
        text: "Ideal für Präsentationen und Berichte mit Fotos: Text bleibt durchsuchbar, nur eingebettete Bilder werden verkleinert.",
      },
      {
        title: "Maximal-Modus",
        text: "Perfekt für eingescannte Dokumente. Mit Graustufen und niedriger Qualität erreichst du die kleinsten Dateien.",
      },
      {
        title: "Ehrliche Ergebnisse",
        text: "PaperFree zeigt dir die exakte Ersparnis. Ist eine PDF bereits optimal, siehst du das sofort – ohne Rätselraten.",
      },
    ],
  },
};

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Preis",
    paperfree: cell.yes("Kostenlos, für immer"),
    acrobat: cell.no("Abo für den vollen Funktionsumfang"),
    ilovepdf: cell.partial("Gratis mit Limits, Premium kostenpflichtig"),
  },
  {
    feature: "Dateien bleiben auf deinem Gerät",
    paperfree: cell.yes("100 % lokal im Browser"),
    acrobat: cell.partial("Desktop lokal, Online-Tools mit Cloud-Upload"),
    ilovepdf: cell.no("Web-Version lädt auf Server hoch"),
  },
  {
    feature: "Ohne Konto nutzbar",
    paperfree: cell.yes("Ja, ohne Anmeldung"),
    acrobat: cell.partial("Viele Funktionen erfordern ein Konto"),
    ilovepdf: cell.yes("Ja, für Basisfunktionen"),
  },
  {
    feature: "Keine Datei- oder Tageslimits",
    paperfree: cell.yes("Nur durch dein Gerät begrenzt"),
    acrobat: cell.partial("Gratis-Nutzung eingeschränkt"),
    ilovepdf: cell.partial("Gratis-Version mit Limits"),
  },
  {
    feature: "Open Source & selbst hostbar",
    paperfree: cell.yes("MIT-Lizenz, 1-Klick auf Vercel"),
    acrobat: cell.no("Proprietär"),
    ilovepdf: cell.no("Proprietär"),
  },
  {
    feature: "Zusammenfügen, Teilen, Drehen",
    paperfree: cell.yes("Ja"),
    acrobat: cell.yes("Ja"),
    ilovepdf: cell.yes("Ja"),
  },
  {
    feature: "Komprimieren & PDF ↔ Bilder",
    paperfree: cell.yes("Ja"),
    acrobat: cell.yes("Ja"),
    ilovepdf: cell.yes("Ja"),
  },
  {
    feature: "Text bearbeiten, OCR, Signieren",
    paperfree: cell.soon("Auf der Roadmap"),
    acrobat: cell.yes("Ja"),
    ilovepdf: cell.partial("Teilweise (Premium)"),
  },
];

const faq: FaqEntry[] = [
  {
    question: "Werden meine Dateien wirklich nicht hochgeladen?",
    answer:
      "Ja, wirklich. PaperFree verarbeitet PDFs mit pdf-lib und pdf.js direkt in deinem Browser. Es gibt keinen Server, der Dateien entgegennimmt. Zusätzlich verbietet eine Content-Security-Policy der Seite technisch, Daten an fremde Server zu senden. Prüfe es selbst: Öffne die Entwicklertools (F12), wechsle zum Tab „Netzwerk“ und bearbeite eine PDF – du wirst keinen Upload sehen.",
  },
  {
    question: "Ist PaperFree wirklich kostenlos? Wo ist der Haken?",
    answer:
      "Es gibt keinen. PaperFree ist Open Source unter der MIT-Lizenz, ohne Werbung, ohne Tracking und ohne Premium-Stufe. Da die Arbeit in deinem Browser passiert, entstehen kaum Serverkosten. Das Projekt finanziert sich ausschließlich über freiwillige Spenden auf Ko-fi.",
  },
  {
    question: "Gibt es Limits für Dateigröße oder Anzahl?",
    answer:
      "Keine künstlichen. Die einzige Grenze ist der Arbeitsspeicher deines Geräts. Dateien mit mehreren hundert Megabyte funktionieren in aktuellen Desktop-Browsern problemlos; auf Smartphones kann es bei sehr großen Dateien eng werden.",
  },
  {
    question: "Funktioniert PaperFree mit passwortgeschützten PDFs?",
    answer:
      "Noch nicht. Verschlüsselte PDFs müssen vorher entsperrt werden, z. B. indem du sie in einem PDF-Viewer öffnest und über „Drucken → Als PDF speichern“ neu speicherst. PaperFree zeigt dir in diesem Fall eine klare Fehlermeldung.",
  },
  {
    question: "Warum ist Text nach dem Komprimieren manchmal nicht mehr markierbar?",
    answer:
      "Das passiert nur im Modus „Maximal“: Dort wird jede Seite als Bild neu berechnet (Canvas-Resampling), was maximale Ersparnis bringt. Im empfohlenen Smart-Modus bleiben Text, Links und Vektorgrafiken erhalten – nur eingebettete Fotos werden verkleinert.",
  },
  {
    question: "Welche Browser werden unterstützt?",
    answer:
      "Alle aktuellen Versionen von Chrome, Edge, Firefox und Safari – auf dem Desktop wie auf Smartphone und Tablet. Eine Installation ist nicht nötig.",
  },
  {
    question: "Kann ich PaperFree selbst hosten oder in meiner Firma einsetzen?",
    answer:
      "Ja. Dank MIT-Lizenz darfst du PaperFree frei nutzen, anpassen und selbst betreiben – z. B. mit einem Klick auf Vercel oder per „npm run build“ auf deinem eigenen Server. Ideal für Kanzleien, Praxen und Behörden mit strengen Datenschutzanforderungen.",
  },
];

const benefits: TextBlock[] = [
  {
    title: "Privatsphäre by Design",
    text: "Verträge, Steuerunterlagen, Arztbriefe: Deine Dateien bleiben auf deinem Gerät. Ideal für DSGVO-sensible Dokumente.",
  },
  {
    title: "Blitzschnell",
    text: "Kein Hochladen, keine Warteschlange, kein Herunterladen vom Server. Die Verarbeitung startet sofort.",
  },
  {
    title: "Keine Limits",
    text: "Keine Begrenzung bei Dateigröße, Seitenzahl oder Anzahl der Aufgaben pro Tag. Nutze PaperFree, so oft du willst.",
  },
  {
    title: "Kein Konto, keine E-Mail",
    text: "Öffnen, Datei hineinziehen, fertig. Keine Registrierung, keine Newsletter-Falle, keine Abo-Upsells.",
  },
  {
    title: "100 % Open Source",
    text: "Der komplette Quellcode ist öffentlich unter MIT-Lizenz. Prüfe selbst, was mit deinen Dateien passiert.",
  },
  {
    title: "Ohne Wasserzeichen & Werbung",
    text: "Saubere Ergebnisse ohne Branding, ohne Banner und ohne Cookie-Banner – weil es schlicht keine Cookies gibt.",
  },
];

export const de: Dictionary = {
  meta: {
    title: "PaperFree – Kostenlose PDF-Werkzeuge, 100 % lokal im Browser",
    titleTemplate: "%s · PaperFree – 100 % lokal & kostenlos",
    description:
      "PDFs zusammenfügen, teilen, drehen, komprimieren und in Bilder umwandeln – kostenlos, quelloffen und zu 100 % lokal im Browser. Deine Dateien verlassen niemals dein Gerät.",
    shortDescription: "Kostenlose PDF-Werkzeuge ohne Upload, ohne Konto, ohne Limits.",
    keywords: [
      "PDF zusammenfügen",
      "PDF teilen",
      "PDF komprimieren",
      "PDF drehen",
      "Bilder zu PDF",
      "PDF zu JPG",
      "PDF zu PNG",
      "Adobe Acrobat Alternative",
      "iLovePDF Alternative",
      "PDF ohne Upload",
      "Open Source PDF",
    ],
  },
  common: {
    pages,
    files,
    images,
    quote,
    skipToContent: "Zum Inhalt springen",
    unknownError: "Unbekannter Fehler. Bitte versuche es erneut.",
    progress: "Fortschritt",
    yes: "Ja",
    no: "Nein",
  },
  language: {
    label: "Sprache",
    switchLabel: "English",
    switchShort: "EN",
    switchAria: "Show this page in English",
  },
  header: {
    navLabel: "Werkzeuge",
    mobileNavLabel: "Werkzeuge (mobil)",
    github: "GitHub",
    githubAria: "PaperFree auf GitHub (öffnet in neuem Tab)",
    sourceOnGithub: "Quellcode auf GitHub",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
    themeToggle: "Zwischen hellem und dunklem Design wechseln",
    themeToggleTitle: "Hell/Dunkel umschalten",
  },
  kofi: {
    label: "Buy Me a Coffee",
    short: "Ko-fi",
    ariaSuffix: "– PaperFree unterstützen (öffnet in neuem Tab)",
  },
  privacyBadge: {
    strong: "100% Lokal:",
    text: "Deine Dateien verlassen niemals deinen Browser.",
  },
  footer: {
    ctaTitle: "PaperFree ist kostenlos – und soll es bleiben. ☕",
    ctaText:
      "Keine Werbung, kein Tracking, keine Abo-Falle. Wenn dir PaperFree Zeit oder Geld spart, hilft ein Kaffee dabei, das Projekt weiterzuentwickeln.",
    ctaKofi: "Unterstütze mich auf Ko-fi",
    ctaBmc: "Buy Me a Coffee",
    trustLine: "Keine Uploads · Keine Cookies · Kein Tracking",
    toolsHeading: "Werkzeuge",
    openSourceHeading: "Open Source",
    source: "Quellcode auf GitHub",
    issues: "Fehler melden & Ideen einreichen",
    privacy: "So funktioniert der Datenschutz",
    kofi: "☕ Ko-fi / Buy Me a Coffee",
    copyright: (year: number, license: string) =>
      `© ${year} PaperFree · Open Source unter der ${license}-Lizenz · Adobe, Acrobat und iLovePDF sind Marken ihrer jeweiligen Inhaber.`,
    builtWith: "Gebaut mit",
    love: "Liebe",
    builtWithSuffix: "und pdf-lib, pdf.js & Next.js",
  },
  dropzone: {
    dropToAdd: "Loslassen zum Hinzufügen",
    orDragHere: "oder hierher ziehen",
    selectFile: "Datei auswählen",
    selectFiles: "Dateien auswählen",
    localNote: "🔒 Wird ausschließlich lokal in deinem Browser verarbeitet",
    rejected: (names: string) => `Nicht unterstütztes Format übersprungen: ${names}`,
  },
  toolShell: {
    home: "Start",
    breadcrumb: "Brotkrumen",
    tipsHeading: "Gut zu wissen",
    moreTools: "Weitere Werkzeuge",
  },
  toolCard: {
    open: "Jetzt öffnen",
  },
  tools,
  workspace: {
    errorTitle: "Das hat leider nicht geklappt",
    loadErrorTitle: "PDF konnte nicht geladen werden",
    fileName: "Dateiname",
    resultTitle: "Fertig! Deine Datei ist bereit.",
    download: "Herunterladen",
    kofiAsk: "Hat dir PaperFree geholfen? Ein Kaffee hält das Projekt kostenlos.",
    replaceFile: "Andere Datei",
    previewProgress: (rendered: number, total: number) => `Erzeuge Vorschau … ${rendered} von ${total} Seiten`,
    moveUp: "Nach oben verschieben",
    moveDown: "Nach unten verschieben",
    moveEarlier: "Nach vorne verschieben",
    moveLater: "Nach hinten verschieben",
    remove: (name: string) => `${quote(name)} entfernen`,
    removeAll: "Alle entfernen",
    sortByName: "Nach Name sortieren",
    reverse: "Umkehren",
    rotateLeft: "Nach links drehen",
    rotateRight: "Nach rechts drehen",
    select: (label: string) => `${label} auswählen`,
    deselect: (label: string) => `${label} abwählen`,
    pageLabel: (page: number) => `Seite ${page}`,
    starting: "Starte …",
    done: "Fertig!",
  },
  merge: {
    dropTitle: "PDF-Dateien auswählen",
    dropDescription: "oder hierher ziehen · mehrere PDFs gleichzeitig möglich",
    dropButton: "PDFs auswählen",
    dragHintBefore: "Ziehe die Dateien am Griff",
    dragHintAfter: "in die gewünschte Reihenfolge oder nutze die Pfeile.",
    reading: (name: string, index: number, total: number) => `Lese ${quote(name)} (${index}/${total}) …`,
    readingShort: "wird gelesen …",
    addMoreTitle: "Weitere PDFs hinzufügen",
    addMoreDescription: "Klicken oder Dateien hierher ziehen",
    panelTitle: "Zusammenfügen",
    statFiles: "Dateien",
    statPages: "Seiten gesamt",
    statSize: "Gesamtgröße",
    broken: (count: number) =>
      count === 1
        ? "Eine Datei konnte nicht gelesen werden und wird übersprungen."
        : `${count} Dateien konnten nicht gelesen werden und werden übersprungen.`,
    needTwo: "Füge mindestens zwei PDF-Dateien hinzu.",
    button: "PDFs zusammenfügen",
    working: "Wird zusammengefügt …",
    resetLabel: "Neue Dateien zusammenfügen",
    defaultName: "zusammengefuegt",
    details: (fileCount: number, pageCount: number) => `${files(fileCount)} · ${pages(pageCount)}`,
  },
  split: {
    modes: {
      extract: { label: "Auswahl", hint: "eine PDF" },
      ranges: { label: "Bereiche", hint: "je eine PDF" },
      every: { label: "Einzeln", hint: "jede Seite" },
      chunks: { label: "Alle N", hint: "Seiten" },
    },
    dropTitle: "PDF zum Teilen auswählen",
    dropDescription: "oder hierher ziehen · du siehst danach alle Seiten als Vorschau",
    dropButton: "PDF auswählen",
    selectedCount: (selected: number, total: number) => `${selected} von ${total} ausgewählt`,
    all: "Alle",
    none: "Keine",
    odd: "Ungerade",
    even: "Gerade",
    invert: "Umkehren",
    clickHintBefore: "Klicke auf Seiten, um sie auszuwählen. Mit gedrückter",
    shiftKey: "Umschalt",
    clickHintAfter: "-Taste wählst du ganze Bereiche.",
    panelTitle: "Teilen & Extrahieren",
    modeLabel: "Modus",
    rangeLabel: "Seitenbereich",
    rangePlaceholder: "z. B. 1-3, 5, 8-",
    hintRanges: "Jeder durch Komma getrennte Bereich wird eine eigene PDF.",
    hintEvery: "Leer lassen, um jede Seite des Dokuments einzeln zu speichern.",
    hintExtract: "„8-“ bedeutet: ab Seite 8 bis zum Ende.",
    chunkLabel: "Seiten pro Datei",
    baseName: "Basis-Dateiname",
    summaryNone: "Noch keine Seiten ausgewählt",
    summaryOne: (pageCount: number) => `→ 1 PDF mit ${pages(pageCount)}`,
    summaryMany: (fileCount: number, pageCount: number) => `→ ${fileCount} PDFs (${pages(pageCount)}) als ZIP-Archiv`,
    buttonExtract: "Seiten extrahieren",
    buttonZip: "Teilen & ZIP erstellen",
    working: "Wird verarbeitet …",
    resetLabel: "Andere PDF teilen",
    extractSuffix: "auszug",
    splitSuffix: "geteilt",
    detailsExtracted: (pageCount: number) => `${pages(pageCount)} extrahiert`,
    detailsZip: (fileCount: number) => `${fileCount} PDF-Dateien im ZIP-Archiv`,
  },
  organize: {
    dropTitle: "PDF zum Organisieren auswählen",
    dropDescription: "oder hierher ziehen · Seiten danach drehen, löschen und neu anordnen",
    dropButton: "PDF auswählen",
    rotateAllLeft: "Alle links drehen",
    rotateAllRight: "Alle rechts drehen",
    resetAll: "Alles zurücksetzen",
    hint: "Fahre über eine Seite, um sie zu drehen oder zu löschen. Ziehe Seiten, um die Reihenfolge zu ändern.",
    willBeRemoved: "Wird entfernt",
    restorePage: (page: number) => `Seite ${page} wiederherstellen`,
    rotateLeftPage: (page: number) => `Seite ${page} nach links drehen`,
    rotateRightPage: (page: number) => `Seite ${page} nach rechts drehen`,
    deletePage: (page: number) => `Seite ${page} löschen`,
    panelTitle: "Änderungen",
    statRemaining: "Seiten im Ergebnis",
    statRotated: "Gedreht",
    statDeleted: "Gelöscht",
    statReordered: "Reihenfolge geändert",
    restoreDeleted: "Gelöschte Seiten wiederherstellen",
    needOne: "Mindestens eine Seite muss erhalten bleiben.",
    button: "Änderungen anwenden",
    working: "Wird gespeichert …",
    resetLabel: "Andere PDF bearbeiten",
    editedSuffix: "bearbeitet",
  },
  imagesToPdf: {
    pageSizes: { a4: "A4", letter: "US Letter", fit: "Bildgröße" },
    orientations: { auto: "Automatisch", portrait: "Hochformat", landscape: "Querformat" },
    margins: { none: "Kein Rand", small: "Schmal", large: "Breit" },
    dropTitle: "Bilder auswählen",
    dropDescription: "oder hierher ziehen · PNG, JPG, WebP (auch GIF, BMP, AVIF)",
    dropButton: "Bilder auswählen",
    moreTitle: "Mehr Bilder",
    moreDescription: "Klicken oder ziehen",
    panelTitle: "PDF-Einstellungen",
    pageSizeLabel: "Seitengröße",
    orientationLabel: "Ausrichtung",
    marginLabel: "Seitenrand",
    statPages: "Seiten",
    statSize: "Bildgröße gesamt",
    button: "PDF erstellen",
    working: "PDF wird erstellt …",
    resetLabel: "Neue Bilder umwandeln",
    defaultName: "bilder",
    details: (count: number) => `${images(count)} → ${pages(count)}`,
  },
  pdfToImages: {
    formats: { png: { label: "PNG", hint: "verlustfrei" }, jpeg: { label: "JPG", hint: "kleiner" } },
    dpiHints: { "72": "Web", "150": "Standard", "200": "Hoch", "300": "Druck" },
    dropTitle: "PDF in Bilder umwandeln",
    dropDescription: "oder hierher ziehen · jede Seite wird als PNG oder JPG gespeichert",
    dropButton: "PDF auswählen",
    selectedCount: (selected: number, total: number) => `${selected} von ${total} Seiten ausgewählt`,
    all: "Alle",
    none: "Keine",
    downloadOnly: (page: number) => `Nur Seite ${page} herunterladen`,
    panelTitle: "Bild-Export",
    formatLabel: "Format",
    dpiLabel: "Auflösung (DPI)",
    jpgQuality: "JPG-Qualität",
    statImages: "Bilder",
    statSize: "Größe (Seite 1)",
    statDownloadAs: "Download als",
    zipArchive: "ZIP-Archiv",
    buttonZip: "Bilder als ZIP exportieren",
    buttonSingle: "Bild exportieren",
    working: "Bilder werden erzeugt …",
    resetLabel: "Andere PDF umwandeln",
    imagesSuffix: "bilder",
    detailsZip: (count: number, format: string, dpi: string) => `${count} ${format}-Bilder in ${dpi} DPI`,
  },
  compress: {
    presets: [
      { label: "Gering", value: 85, hint: "beste Qualität" },
      { label: "Empfohlen", value: 60, hint: "ausgewogen" },
      { label: "Extrem", value: 25, hint: "kleinste Datei" },
    ],
    modes: {
      smart: {
        title: "Smart (empfohlen)",
        text: "Text & Vektoren bleiben gestochen scharf und durchsuchbar. Eingebettete Fotos werden verkleinert und neu komprimiert.",
      },
      raster: {
        title: "Maximal (Canvas-Resampling)",
        text: "Jede Seite wird als Bild neu berechnet. Ideal für Scans – Text ist danach aber nicht mehr markierbar.",
      },
    },
    dropTitle: "PDF zum Komprimieren auswählen",
    dropDescription: "oder hierher ziehen · ideal für E-Mail-Anhänge und Upload-Portale",
    dropButton: "PDF auswählen",
    previewAlt: "Vorschau der ersten Seite",
    presetLabel: "Voreinstellung",
    qualityLabel: "Qualität",
    smallest: "Kleinste Datei",
    best: "Beste Qualität",
    settingsSmart: (maxSide: string, quality: number) =>
      `Fotos: max. ${maxSide} px Kantenlänge, JPEG-Qualität ${quality} %`,
    settingsRaster: (dpi: number, quality: number) =>
      `Seiten werden mit ${dpi} DPI und JPEG-Qualität ${quality} % neu berechnet`,
    grayscale: "In Graustufen umwandeln (spart zusätzlich Platz)",
    rasterWarning:
      "Im Modus „Maximal“ wird jede Seite zu einem Bild. Text lässt sich danach nicht mehr markieren, kopieren oder durchsuchen, und Links sowie Formularfelder gehen verloren.",
    before: "Vorher",
    after: "Nachher",
    optimizedImages: (optimized: number, total: number) => `${optimized} von ${total} Fotos optimiert.`,
    notSmallerTip:
      "Tipp: Probiere eine niedrigere Qualität oder den Modus „Maximal“. Deine Originaldatei ist evtl. bereits optimal.",
    panelTitle: "Komprimieren",
    statOriginal: "Originalgröße",
    statPages: "Seiten",
    statMode: "Modus",
    modeSmart: "Smart",
    modeRaster: "Maximal",
    statQuality: "Qualität",
    button: "PDF komprimieren",
    working: "Wird komprimiert …",
    resetLabel: "Andere PDF komprimieren",
    saved: (percent: number) => `${percent} % kleiner als das Original`,
    notSmaller: "Die Datei ließ sich mit diesen Einstellungen nicht weiter verkleinern.",
    compressedSuffix: "komprimiert",
  },
  home: {
    kicker: "Open Source · Kostenlos · Ohne Anmeldung",
    titleLine1: "Alle PDF-Werkzeuge.",
    titleLine2: "Kostenlos & komplett privat.",
    subtitle:
      "PaperFree ist die quelloffene Alternative zu Adobe Acrobat und iLovePDF – nur ohne Upload, ohne Konto und ohne Limits. Alles läuft direkt in deinem Browser.",
    ctaPrimary: "Werkzeug wählen",
    ctaSecondary: "Quellcode ansehen",
    stats: [
      { value: "0", label: "Uploads auf Server" },
      { value: "0 €", label: "Kosten, für immer" },
      { value: "∞", label: "Dateien & Seiten" },
      { value: "6", label: "PDF-Werkzeuge" },
    ],
    toolsHeading: "Was möchtest du tun?",
    toolsSub: "Wähle ein Werkzeug – deine Dateien werden in jedem Fall ausschließlich lokal verarbeitet.",
    benefitsHeading: "Warum PaperFree?",
    benefitsSub: "Weil du für das Zusammenfügen von zwei PDFs weder ein Abo noch deine Daten hergeben solltest.",
    benefits,
    privacy: {
      kicker: "So funktioniert der Datenschutz",
      heading: "Deine Dateien verlassen niemals deinen Browser.",
      text: "Klassische Online-PDF-Dienste laden deine Dokumente auf ihre Server. PaperFree dreht das Prinzip um: Die Software kommt zu deinen Dateien – nicht umgekehrt.",
      enforcedTitle: "Technisch erzwungen, nicht nur versprochen",
      enforcedBefore: "Eine Content-Security-Policy (",
      enforcedAfter:
        ") verbietet der Seite jede Verbindung zu fremden Servern. Öffne die Entwicklertools (F12 → Netzwerk) und überzeuge dich selbst.",
      stepLabel: (step: number) => `Schritt ${step}`,
      steps: [
        {
          title: "Datei auswählen",
          text: "Deine PDF wird vom Browser direkt in den Arbeitsspeicher gelesen – nicht ins Internet.",
        },
        {
          title: "Lokal verarbeiten",
          text: "pdf-lib und pdf.js (JavaScript & WebAssembly) bearbeiten das Dokument in einem Web Worker auf deinem Gerät.",
        },
        {
          title: "Direkt speichern",
          text: "Das Ergebnis entsteht als lokale Datei und wird ohne Umweg über einen Server heruntergeladen.",
        },
      ],
    },
    comparison: {
      heading: "PaperFree im Vergleich",
      sub: "Ehrlich gegenübergestellt: Für die alltäglichen PDF-Aufgaben brauchst du kein Abo.",
      swipeHint: "← Tabelle seitlich wischen, um alle Anbieter zu sehen →",
      caption: "Funktionsvergleich: PaperFree, Adobe Acrobat und iLovePDF",
      featureColumn: "Funktion",
      disclaimer: "Stand: 2026. Angaben zu Drittanbietern ohne Gewähr; Funktionen und Preise können sich ändern.",
      rows: comparisonRows,
    },
    faqHeading: "Häufige Fragen",
    faq,
    support: {
      heading: "Gefällt dir PaperFree?",
      text: "PaperFree wird in der Freizeit entwickelt und bleibt für alle kostenlos. Mit einem Kaffee auf Ko-fi oder einem Stern auf GitHub hilfst du, neue Werkzeuge wie OCR, Signieren und Text-Bearbeitung umzusetzen.",
      kofi: "Buy Me a Coffee auf Ko-fi",
      star: "Stern auf GitHub geben",
    },
  },
  notFound: {
    kicker: "Fehler 404",
    title: "Diese Seite gibt es nicht.",
    text: "Vielleicht suchst du eines dieser Werkzeuge? Alle laufen zu 100 % lokal in deinem Browser.",
    back: "Zur Startseite",
  },
  og: {
    headline: "Alle PDF-Werkzeuge. Kostenlos. Komplett privat.",
    subtitle: "Die quelloffene Alternative zu Adobe Acrobat & iLovePDF.",
    tools: ["Zusammenfügen", "Teilen", "Drehen", "Komprimieren", "Bilder zu PDF", "PDF zu Bildern"],
    badge: "100% Lokal: Deine Dateien verlassen niemals deinen Browser.",
  },
  pdf: {
    theFile: "Die Datei",
    browserOnly: "pdf.js steht nur im Browser zur Verfügung.",
    engineLoadFailed: "Die PDF-Render-Engine konnte nicht geladen werden. Bitte lade die Seite neu.",
    passwordProtected: (subject: string) =>
      `${subject} ist passwortgeschützt. Bitte entferne zuerst das Passwort und versuche es erneut.`,
    invalidPdf: (subject: string) => `${subject} ist keine gültige PDF-Datei oder beschädigt.`,
    openFailed: (subject: string) => `${subject} konnte nicht geöffnet werden.`,
    encrypted: (subject: string) =>
      `${subject} ist verschlüsselt bzw. passwortgeschützt. Bitte entferne zuerst den Schutz (z. B. über „Drucken als PDF“) und versuche es erneut.`,
    unreadable: (subject: string) => `${subject} konnte nicht als PDF gelesen werden. Ist die Datei beschädigt?`,
    needTwo: "Bitte wähle mindestens zwei PDF-Dateien zum Zusammenfügen aus.",
    mergedEmpty: "Die ausgewählten PDFs enthalten keine Seiten.",
    noPagesSelected: "Es wurden keine Seiten ausgewählt.",
    pageMissing: (page: number) => `Seite ${page} existiert nicht im Dokument.`,
    noPagesToSplit: "Es wurden keine Seiten zum Teilen ausgewählt.",
    rangeOutOfBounds: (page: number, pageCount: number) =>
      `Seite ${page} existiert nicht – das Dokument hat ${pages(pageCount)}.`,
    rangeInvalid: (token: string) => `${quote(token)} ist kein gültiger Seitenbereich. Beispiel: 1-3, 5, 8-`,
    canvasFailed:
      "Dein Browser konnte keine Zeichenfläche (Canvas) erstellen. Bitte schließe andere Tabs und versuche es erneut.",
    imageFailed: "Das Bild konnte nicht erzeugt werden – eventuell ist zu wenig Arbeitsspeicher frei.",
    imageUnreadable: "Das Bild konnte nicht gelesen werden. Wird das Format von deinem Browser unterstützt?",
    needImage: "Bitte füge mindestens ein Bild hinzu.",
    fileLabel: (index: number) => `Datei ${index}`,
    progress: {
      adding: (name: string, index: number, total: number) => `Füge ${quote(name)} hinzu (${index}/${total}) …`,
      savingMerged: "Speichere die zusammengefügte PDF …",
      done: "Fertig!",
      reading: "Lese PDF …",
      extracting: (count: number) => `Extrahiere ${pages(count)} …`,
      creatingFile: (index: number, total: number) => `Erstelle Datei ${index} von ${total} …`,
      arranging: (count: number) => `Ordne ${pages(count)} an …`,
      packingZip: "Packe ZIP-Archiv …",
      opening: "Öffne PDF …",
      rendering: (page: number, index: number, total: number) => `Rendere Seite ${page} (${index}/${total}) …`,
      processingImage: (name: string, index: number, total: number) =>
        `Verarbeite ${quote(name)} (${index}/${total}) …`,
      savingPdf: "Speichere PDF …",
      analyzing: "Analysiere PDF-Struktur …",
      optimizingImage: (index: number, total: number) => `Optimiere Bild ${index} von ${total} …`,
      optimizingStructure: "Optimiere Dateistruktur …",
      compressingPage: (page: number, total: number) => `Komprimiere Seite ${page} von ${total} …`,
      savingCompressed: "Speichere komprimierte PDF …",
    },
    fileNames: {
      page: "seite",
      pages: "seiten",
    },
  },
};
