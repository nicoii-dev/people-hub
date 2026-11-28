"use client";

import * as React from "react";
import {
  Camera,
  ClockArrowDown,
  ClockArrowUp,
  MapPin,
  RefreshCw,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface TimeClockCapture {
  address: string;
  photo: string | null;
}

interface TimeClockCaptureDialogProps {
  open: boolean;
  mode: "time_in" | "time_out";
  address: string;
  photo: string | null;
  resolvingAddress: boolean;
  addressError: string;
  busy: boolean;
  onAddressChange: (address: string) => void;
  onPhotoChange: (photo: string | null) => void;
  onRefreshAddress: () => void;
  onClose: () => void;
  onSubmit: (capture: TimeClockCapture) => void;
}

type CameraStatus = "idle" | "starting" | "active" | "error";

export function TimeClockCaptureDialog({
  open,
  mode,
  address,
  photo,
  resolvingAddress,
  addressError,
  busy,
  onAddressChange,
  onPhotoChange,
  onRefreshAddress,
  onClose,
  onSubmit,
}: TimeClockCaptureDialogProps) {
  const [cameraStatus, setCameraStatus] = React.useState<CameraStatus>("idle");
  const [cameraError, setCameraError] = React.useState("");
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const stopCamera = React.useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraStatus("idle");
  }, []);

  const startCamera = React.useCallback(async () => {
    setCameraError("");
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is not available in this browser. Upload a photo instead.");
      setCameraStatus("error");
      return;
    }

    setCameraStatus("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setCameraStatus("active");
    } catch {
      setCameraError("Camera access was denied. Upload a photo instead.");
      setCameraStatus("error");
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    // Defer side effects that set state to avoid cascading renders during the
    // effect pass.
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      if (open) {
        onRefreshAddress();
        void startCamera();
      } else {
        stopCamera();
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      stopCamera();
    };
  }, [open, onRefreshAddress, startCamera, stopCamera]);

  React.useEffect(() => {
    if (open && cameraStatus === "active" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play().catch(() => undefined);
    }
  }, [cameraStatus, open]);

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    onPhotoChange(canvas.toDataURL("image/jpeg", 0.7));
    stopCamera();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onPhotoChange(String(reader.result));
      stopCamera();
    };
    reader.readAsDataURL(file);
  }

  function handleClose() {
    stopCamera();
    onClose();
  }

  const title = mode === "time_in" ? "Time in" : "Time out";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "time_in" ? (
              <ClockArrowUp className="size-5 text-primary" />
            ) : (
              <ClockArrowDown className="size-5 text-primary" />
            )}
            {title}
          </DialogTitle>
          <DialogDescription>
            Take a photo and confirm your current address before recording.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-2">
              <Label>Camera photo</Label>
              {photo ? (
                <Badge variant="default">Photo captured</Badge>
              ) : (
                <Badge variant="outline">Required</Badge>
              )}
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black">
              {cameraStatus === "active" ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="size-full object-cover"
                  />
                  <Video className="absolute left-2 top-2 size-4 text-white/80" />
                </>
              ) : photo ? (
                <div
                  role="img"
                  aria-label="Captured time clock photo"
                  className="size-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${photo})` }}
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 text-white/60">
                  <Camera className="size-8" />
                  <span className="text-xs">Camera preview</span>
                </div>
              )}
            </div>

            {cameraError ? <p className="text-xs text-destructive">{cameraError}</p> : null}

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={cameraStatus === "active" || cameraStatus === "starting"}
                onClick={() => void startCamera()}
              >
                <Camera className="size-4" />
                {cameraStatus === "starting"
                  ? "Starting…"
                  : photo
                    ? "Retake photo"
                    : "Open camera"}
              </Button>
              {cameraStatus === "active" ? (
                <Button type="button" size="sm" onClick={capturePhoto}>
                  <Camera className="size-4" />
                  Capture
                </Button>
              ) : null}
              <Label
                htmlFor="time-clock-capture-photo"
                className="cursor-pointer text-sm font-normal text-muted-foreground hover:text-foreground"
              >
                Upload instead
              </Label>
              <Input
                id="time-clock-capture-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="time-clock-capture-address">Current address</Label>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Refresh current address"
                disabled={resolvingAddress}
                onClick={onRefreshAddress}
              >
                <RefreshCw
                  className={cn("size-4", resolvingAddress && "animate-spin")}
                />
              </Button>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="time-clock-capture-address"
                className="pl-9"
                value={address}
                onChange={(event) => onAddressChange(event.target.value)}
                placeholder={
                  resolvingAddress
                    ? "Resolving your address…"
                    : "Enter your current address"
                }
              />
            </div>
            {resolvingAddress ? (
              <p className="text-xs text-muted-foreground">Looking up your address…</p>
            ) : addressError ? (
              <p className="text-xs text-destructive">{addressError}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Resolved from your current location. You can edit it before recording.
              </p>
            )}

            <div className="rounded-md border bg-background p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Address to record
              </p>
              <p className="mt-1 break-words text-sm font-medium">
                {address.trim() || "—"}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!address.trim() || !photo || busy}
            onClick={() => onSubmit({ address: address.trim(), photo })}
          >
            {busy
              ? "Working…"
              : mode === "time_in"
                ? "Confirm time in"
                : "Continue to time out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
