"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw } from "lucide-react";

interface SignatureCanvasProps {
  onSignature: (data: string) => void;
  name?: string;
}

export function SignatureCanvas({ onSignature, name = "" }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [typedName, setTypedName] = useState(name);
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !lastPos.current) return;

    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
    setHasDrawing(true);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const confirmDrawn = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawing) return;
    onSignature(canvas.toDataURL("image/png"));
  };

  const confirmTyped = () => {
    if (!typedName.trim()) return;
    // Generate typed signature as canvas image
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 400, 100);
    ctx.font = "italic 42px Georgia, serif";
    ctx.fillStyle = "#1e293b";
    ctx.textBaseline = "middle";
    ctx.fillText(typedName, 20, 50);
    onSignature(canvas.toDataURL("image/png"));
  };

  // Draw guide line on canvas mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(20, 110);
    ctx.lineTo(canvas.width - 20, 110);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [mode]);

  return (
    <div className="space-y-3">
      <Tabs value={mode} onValueChange={v => setMode(v as "draw" | "type")}>
        <TabsList className="grid grid-cols-2 h-8 text-xs">
          <TabsTrigger value="draw" className="text-xs">Draw</TabsTrigger>
          <TabsTrigger value="type" className="text-xs">Type</TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="mt-2">
          <div className="relative border border-border rounded-lg bg-white overflow-hidden">
            <canvas
              ref={canvasRef}
              width={600}
              height={140}
              className="w-full cursor-crosshair touch-none"
              style={{ height: "140px" }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={endDrawing}
            />
            {!hasDrawing && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-sm text-slate-400 select-none">Sign here</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={clearCanvas}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </button>
            <Button size="sm" onClick={confirmDrawn} disabled={!hasDrawing} className="text-xs h-7">
              Use This Signature
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="type" className="mt-2">
          <div className="border border-border rounded-lg bg-white p-4 min-h-[100px] flex items-center justify-center">
            <span
              className="text-3xl text-slate-800 select-none"
              style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}
            >
              {typedName || <span className="text-slate-300 text-base">Your name will appear here</span>}
            </span>
          </div>
          <div className="mt-2 space-y-2">
            <Input
              value={typedName}
              onChange={e => setTypedName(e.target.value)}
              placeholder="Type your full name"
              className="h-8 text-sm"
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={confirmTyped} disabled={!typedName.trim()} className="text-xs h-7">
                Use This Signature
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
