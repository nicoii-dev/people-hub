"use client";

import * as React from "react";
import { CheckCircle2, ClockArrowDown, ClockArrowUp } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useAuth } from "@/features/auth/hooks";
import { useTimeClock, useTimeIn, useTimeOut } from "@/hooks/use-attendance";
import { formatDate, formatDateTime } from "@/lib/utils";
import { locationService } from "@/services/location.service";
import type { TimeClockInput } from "@/types/attendance";
import {
  TimeClockCaptureDialog,
  type TimeClockCapture,
} from "./time-clock-capture-dialog";

type CaptureMode = "time_in" | "time_out";

function localDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

interface TimeDetailProps {
  label: string;
  value: React.ReactNode;
}

function TimeDetail({ label, value }: TimeDetailProps) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function PhotoPreview({ label, src }: { label: string; src: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div
        role="img"
        aria-label={label}
        className="h-40 w-full rounded-md border bg-cover bg-center"
        style={{ backgroundImage: `url(${src})` }}
      />
    </div>
  );
}

export function EmployeeTimeClock() {
  const { user } = useAuth();
  const employeeId = user?.employeeId ?? "";
  const timeClockQuery = useTimeClock(employeeId);
  const timeIn = useTimeIn();
  const timeOut = useTimeOut();

  const [today, setToday] = React.useState(() => localDateKey(new Date()));
  const [captureOpen, setCaptureOpen] = React.useState(false);
  const [captureMode, setCaptureMode] = React.useState<CaptureMode>("time_in");
  const [address, setAddress] = React.useState("");
  const [photo, setPhoto] = React.useState<string | null>(null);
  const [resolvingAddress, setResolvingAddress] = React.useState(false);
  const [addressError, setAddressError] = React.useState("");
  const [pendingCapture, setPendingCapture] = React.useState<TimeClockCapture | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  React.useEffect(() => {
    const dateTimer = window.setInterval(
      () => setToday(localDateKey(new Date())),
      60_000,
    );
    return () => window.clearInterval(dateTimer);
  }, []);

  const resolveCurrentAddress = React.useCallback(async () => {
    setResolvingAddress(true);
    setAddressError("");
    try {
      const location = await locationService.getCurrentAddress();
      setAddress(location.address);
    } catch (error) {
      setAddressError(
        error instanceof Error
          ? error.message
          : "Address unavailable. Enter it manually.",
      );
    } finally {
      setResolvingAddress(false);
    }
  }, []);

  const refreshAddress = React.useCallback(() => {
    void resolveCurrentAddress();
  }, [resolveCurrentAddress]);

  const record = timeClockQuery.data?.data ?? null;
  const hasTimeIn = Boolean(record?.timeIn);
  const hasTimeOut = Boolean(record?.timeOut);
  const busy = timeIn.isPending || timeOut.isPending;

  function resetCapture() {
    setAddress("");
    setPhoto(null);
    setAddressError("");
    setPendingCapture(null);
  }

  function openCapture(mode: CaptureMode) {
    setCaptureMode(mode);
    setAddress("");
    setPhoto(null);
    setAddressError("");
    setPendingCapture(null);
    setCaptureOpen(true);
  }

  function clockInput(capture: TimeClockCapture): TimeClockInput {
    return {
      location: capture.address,
      ...(capture.photo ? { photo: capture.photo } : {}),
    };
  }

  async function submitTimeIn(capture: TimeClockCapture) {
    setCaptureOpen(false);
    try {
      await timeIn.mutateAsync({ employeeId, input: clockInput(capture) });
      toast.success("Time in recorded");
      setPendingCapture(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not time in");
    }
  }

  function submitTimeOut(capture: TimeClockCapture) {
    setPendingCapture(capture);
    setCaptureOpen(false);
    setConfirmOpen(true);
  }

  async function handleTimeOut() {
    const capture = pendingCapture;
    if (!employeeId || !capture?.address) return;
    try {
      await timeOut.mutateAsync({ employeeId, input: clockInput(capture) });
      setConfirmOpen(false);
      toast.success("Time out recorded");
      resetCapture();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not time out");
    }
  }

  if (!employeeId) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          No employee profile is linked to your account, so the time clock is
          unavailable.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            {hasTimeOut ? (
              <CheckCircle2 className="size-5 text-emerald-600" />
            ) : hasTimeIn ? (
              <ClockArrowDown className="size-5 text-primary" />
            ) : (
              <ClockArrowUp className="size-5 text-primary" />
            )}
            My time clock
          </CardTitle>
          <CardDescription>
            Clock in or out with a photo and your current address.
          </CardDescription>
        </div>
        <Badge variant="secondary">{formatDate(today)}</Badge>
      </CardHeader>

      <CardContent className="space-y-5">
        {timeClockQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Loading your time record…</p>
        ) : null}

        {hasTimeIn ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <TimeDetail
              label="Time in"
              value={record?.timeIn ? formatDateTime(record.timeIn) : "—"}
            />
            <TimeDetail
              label="Time in address"
              value={record?.timeInLocation || address || "—"}
            />
            <TimeDetail
              label="Photo evidence"
              value={record?.hasTimeInPhoto ? "Captured" : "Not captured"}
            />
            <TimeDetail
              label="Status"
              value={hasTimeOut ? "Completed" : "Timed in"}
            />
          </div>
        ) : null}

        {record?.timeInPhoto || record?.timeOutPhoto || (hasTimeIn && photo) ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {record?.timeInPhoto || (hasTimeIn && photo) ? (
              <PhotoPreview
                label="Time-in photo"
                src={record?.timeInPhoto || photo || ""}
              />
            ) : null}
            {record?.timeOutPhoto ? (
              <PhotoPreview label="Time-out photo" src={record.timeOutPhoto} />
            ) : null}
          </div>
        ) : null}

        {!hasTimeIn ? (
          <Button
            type="button"
            size="lg"
            className="w-full sm:w-auto"
            disabled={busy}
            onClick={() => openCapture("time_in")}
          >
            <ClockArrowUp className="size-5" />
            Time in
          </Button>
        ) : !hasTimeOut ? (
          <Button
            type="button"
            size="lg"
            variant="destructive"
            className="w-full sm:w-auto"
            disabled={busy}
            onClick={() => openCapture("time_out")}
          >
            <ClockArrowDown className="size-5" />
            Time out
          </Button>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <TimeDetail
              label="Time out"
              value={record?.timeOut ? formatDateTime(record.timeOut) : "—"}
            />
            <TimeDetail
              label="Time out address"
              value={record?.timeOutLocation || "—"}
            />
          </div>
        )}
      </CardContent>

      <TimeClockCaptureDialog
        open={captureOpen}
        mode={captureMode}
        address={address}
        photo={photo}
        resolvingAddress={resolvingAddress}
        addressError={addressError}
        busy={busy}
        onAddressChange={setAddress}
        onPhotoChange={setPhoto}
        onRefreshAddress={refreshAddress}
        onClose={() => setCaptureOpen(false)}
        onSubmit={(capture) =>
          captureMode === "time_in"
            ? void submitTimeIn(capture)
            : submitTimeOut(capture)
        }
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm time out"
        description={
          <>
            You timed in at{" "}
            <strong>
              {record?.timeIn ? formatDateTime(record.timeIn) : "—"}
            </strong>
            . Are you sure you want to time out now?
          </>
        }
        confirmLabel="Yes, time out"
        destructive
        loading={timeOut.isPending}
        onConfirm={() => void handleTimeOut()}
      />
    </Card>
  );
}
