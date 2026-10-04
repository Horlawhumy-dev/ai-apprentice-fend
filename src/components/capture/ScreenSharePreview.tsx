"use client";

import { useEffect, useRef } from "react";
import { useScreenShare } from "@/hooks/use-screen-share";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default function ScreenSharePreview() {
  const { isSharing, error, streamRef, startSharing, stopSharing } = useScreenShare();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const attach = (stream: MediaStream | null) => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  useEffect(() => {
    attach(streamRef.current);
  }, [streamRef, isSharing]);

  useEffect(() => () => attach(null), []);

  return (
    <div className="mt-6">
      <div className="relative overflow-hidden rounded-2xl border border-line-strong bg-surface-inset">
        {!isSharing ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="relative grid size-16 place-items-center">
              <span className="absolute inset-0 animate-halo rounded-full bg-brand/40" />
              <span className="relative grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-strong ring-1 ring-line">
                <Icon name="monitor" size={24} />
              </span>
            </span>
            <p className="mt-5 text-base font-semibold tracking-tight">Screen share preview</p>
            <p className="mt-1.5 max-w-sm text-sm text-muted text-pretty">
              Grant screen access and the selected surface is mirrored here. Nothing leaves your machine
              until you start the capture.
            </p>
          </div>
        ) : (
          <>
            <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-bad px-2.5 py-1 text-xs font-semibold text-white shadow-lg">
              <span className="size-1.5 rounded-full bg-white" />
              LIVE
            </span>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="max-h-96 w-full bg-black object-contain"
            />
          </>
        )}
      </div>

      <div className="mt-4">
        {isSharing ? (
          <Button variant="danger" icon="stop" onClick={stopSharing}>
            Stop screen share
          </Button>
        ) : (
          <Button variant="primary" icon="monitor" onClick={() => void startSharing()}>
            Start screen share
          </Button>
        )}
      </div>

      {error && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">
          <Icon name="alert" size={15} />
          {error}
        </p>
      )}
    </div>
  );
}
