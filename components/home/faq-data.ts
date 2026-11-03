export interface FaqEntry {
  question: string;
  answer: string;
}

export const faqEntries: FaqEntry[] = [
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
