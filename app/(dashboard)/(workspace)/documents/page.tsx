import { Metadata } from "next";
import { DocumentsContent } from "@/components/documents/documents-content";

export const metadata: Metadata = { title: "Documents" };

export default function DocumentsPage() {
  return <DocumentsContent />;
}
