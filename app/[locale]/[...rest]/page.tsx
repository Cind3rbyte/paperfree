import { notFound } from "next/navigation";

/** Unknown paths inside a language segment render the localized 404 page. */
export default function CatchAll() {
  notFound();
}
