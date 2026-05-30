"use client";

import { useState, useEffect, use } from "react";
import {
  CheckCircle, AlertTriangle, FileText, User, Clock,
  ChevronRight, Loader2, Shield, ExternalLink, PenLine
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignatureCanvas } from "@/components/signatures/signature-canvas";
import type { SignatureField } from "@/types";

interface SigningSession {
  participant: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    signed_at?: string;
  };
  request: {
    id: string;
    title: string;
    document_name: string;
    document_id: string;
    deal_address?: string;
    expires_at: string;
    status: string;
  };
  fields: SignatureField[];
  documentUrl?: string | null;
}

type ViewState = "loading" | "error" | "intro" | "review" | "sign" | "done";

export default function SigningPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [view, setView] = useState<ViewState>("loading");
  const [session, setSession] = useState<SigningSession | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [allComplete, setAllComplete] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);

  useEffect(() => {
    fetch(`/api/sign/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setErrorMsg(data.error);
          setView("error");
        } else {
          setSession(data.session);
          setView("intro");
        }
      })
      .catch(() => {
        setErrorMsg("Failed to load signing session. Please try again.");
        setView("error");
      });
  }, [token]);

  const handleSignatureCapture = (data: string) => {
    setSignatureData(data);
  };

  const handleSubmit = async () => {
    if (!signatureData) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sign/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signature_data: signatureData,
          field_values: fieldValues,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");
      setAllComplete(data.completed ?? false);
      setView("done");
    } catch (e) {
      setErrorMsg((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const fields = session?.fields ?? [];
  const requiredTextFields = fields.filter(f => f.field_type !== "signature" && f.field_type !== "initials");
  const allRequiredFieldsFilled = requiredTextFields.every((f: SignatureField) => f.value || fieldValues[f.id] || !f.required);

  if (view === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
          <p className="text-slate-400 text-sm">Loading your document…</p>
        </div>
      </div>
    );
  }

  if (view === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Unable to Open Document</h1>
          <p className="text-slate-400 text-sm">{errorMsg}</p>
          <p className="text-xs text-slate-500">
            If you believe this is an error, please contact the sender for a new signing link.
          </p>
        </div>
      </div>
    );
  }

  if (view === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="max-w-md text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">You&apos;re Done!</h1>
            <p className="text-slate-300">
              You have successfully signed <strong className="text-white">{session?.request.title}</strong>.
            </p>
            {allComplete && (
              <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
                All parties have signed. The document is complete.
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Shield className="w-3 h-3" />
            Legally binding · Secured by CloseTrack
          </div>
          {signatureData && (
            <div className="border border-slate-800 rounded-lg p-3 bg-slate-900">
              <p className="text-xs text-slate-500 mb-2">Your signature</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={signatureData} alt="Your signature" className="max-h-16 mx-auto" />
            </div>
          )}
          <p className="text-xs text-slate-600">
            A confirmation has been logged with your IP address and timestamp for audit purposes.
          </p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const daysLeft = Math.ceil((new Date(session.request.expires_at).getTime() - Date.now()) / 86400000);

  // Intro screen
  if (view === "intro") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full space-y-6">
          {/* CloseTrack branding */}
          <div className="flex items-center gap-2 justify-center">
            <PenLine className="w-5 h-5 text-indigo-400" />
            <span className="text-white font-semibold text-lg">CloseTrack</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="space-y-1">
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px]">
                SIGNATURE REQUIRED
              </Badge>
              <h1 className="text-xl font-bold text-white mt-2">{session.request.title}</h1>
              {session.request.deal_address && (
                <p className="text-slate-400 text-sm">{session.request.deal_address}</p>
              )}
            </div>

            <div className="space-y-3 border-t border-slate-800 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{session.participant.name}</p>
                  <p className="text-slate-500 text-xs">{session.participant.email}</p>
                </div>
                <Badge className="ml-auto bg-slate-800 text-slate-300 border-slate-700 text-[10px] capitalize">
                  {session.participant.role?.replace("_", " ")}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {daysLeft > 0
                    ? `Expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`
                    : "Expires today"}
                </span>
              </div>

              {fields.length > 0 && (
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>{fields.length} field{fields.length !== 1 ? "s" : ""} to complete</span>
                </div>
              )}
            </div>

            <div className="bg-slate-800/50 rounded-xl p-3 text-xs text-slate-400 space-y-1">
              <p className="font-medium text-slate-300">Before you sign:</p>
              <p>• Read the entire document carefully</p>
              <p>• Ensure all information is correct</p>
              <p>• Your signature is legally binding</p>
            </div>

            <Button
              className="w-full gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
              onClick={() => setView("review")}
            >
              Review Document <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
            <Shield className="w-3 h-3" />
            256-bit encryption · ESIGN compliant · Audit trail maintained
          </div>
        </div>
      </div>
    );
  }

  // Review + Sign screen
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900 flex-shrink-0">
        <div className="flex items-center gap-2">
          <PenLine className="w-4 h-4 text-indigo-400" />
          <span className="text-white font-medium text-sm truncate max-w-[200px] md:max-w-none">
            {session.request.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden md:block">{session.participant.name}</span>
          <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-[10px]">
            <Clock className="w-2.5 h-2.5 mr-1" />
            {daysLeft}d left
          </Badge>
        </div>
      </div>

      {/* Main content: document viewer + signing panel */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Document viewer */}
        <div className="flex-1 overflow-y-auto bg-slate-900 p-4">
          {session.documentUrl ? (
            <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-slate-800">
              <iframe
                src={session.documentUrl}
                className="w-full h-full min-h-[600px]"
                title="Document to sign"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 border border-dashed border-slate-700 rounded-xl">
              <div className="text-center space-y-3">
                <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                <div>
                  <p className="text-slate-400 text-sm font-medium">{session.request.document_name}</p>
                  <p className="text-slate-600 text-xs mt-1">
                    Document preview not available in this session.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Signing panel */}
        <div className="w-full lg:w-80 xl:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-white font-semibold text-sm">Complete Your Signature</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {fields.length > 0 ? `${fields.length} field${fields.length !== 1 ? "s" : ""} required` : "Sign to complete"}
            </p>
          </div>

          <div className="flex-1 p-4 space-y-5 overflow-y-auto">
            {/* Text fields */}
            {requiredTextFields.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Required Fields</p>
                {requiredTextFields.map(field => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-xs text-slate-300 capitalize">
                      {field.label || field.field_type.replace("_", " ")}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {field.field_type === "checkbox" ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={fieldValues[field.id] === "true"}
                          onChange={e => setFieldValues(prev => ({ ...prev, [field.id]: String(e.target.checked) }))}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-xs text-slate-400">I agree</span>
                      </div>
                    ) : field.field_type === "date" ? (
                      <input
                        type="date"
                        value={fieldValues[field.id] ?? new Date().toISOString().split("T")[0]}
                        onChange={e => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                        className="w-full h-8 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs px-2"
                      />
                    ) : (
                      <input
                        type="text"
                        value={fieldValues[field.id] ?? (field.field_type === "full_name" ? session.participant.name : "")}
                        onChange={e => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                        placeholder={field.field_type === "full_name" ? "Your full name" : field.label ?? ""}
                        className="w-full h-8 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs px-2 placeholder:text-slate-600"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Signature input */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {fields.some(f => f.field_type === "signature") ? "Your Signature" : "Sign Below"}
              </p>
              {signatureData ? (
                <div className="border border-emerald-500/30 rounded-xl p-3 bg-emerald-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Signature captured
                    </span>
                    <button
                      onClick={() => setSignatureData(null)}
                      className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      Redo
                    </button>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={signatureData} alt="Your signature" className="max-h-12 mx-auto" />
                </div>
              ) : (
                <div className="bg-slate-800 rounded-xl p-3">
                  <SignatureCanvas
                    onSignature={handleSignatureCapture}
                    name={session.participant.name}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="p-4 border-t border-slate-800 space-y-3">
            <div className="text-xs text-slate-500 text-center leading-relaxed">
              By clicking Sign, you agree this is your legally binding signature.
            </div>
            <Button
              className="w-full gap-2 bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
              onClick={handleSubmit}
              disabled={!signatureData || submitting || !allRequiredFieldsFilled}
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
              ) : (
                <><PenLine className="w-4 h-4" /> Sign Document</>
              )}
            </Button>
            {errorMsg && (
              <p className="text-xs text-red-400 text-center">{errorMsg}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
