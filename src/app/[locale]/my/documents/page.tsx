import { DocumentsPage } from "@/features/account/components/DocumentsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documents",
};

export default function DocumentsRoutePage() {
  return <DocumentsPage />;
}
