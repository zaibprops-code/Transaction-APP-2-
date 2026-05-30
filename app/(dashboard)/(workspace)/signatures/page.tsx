import { Metadata } from "next";
import { SignaturesContent } from "@/components/signatures/signatures-content";

export const metadata: Metadata = { title: "E-Signatures" };

export default function SignaturesPage() {
  return <SignaturesContent />;
}
