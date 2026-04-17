"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function DiagnosePage() {
  const { user, loading } = useCurrentUser();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();

  const startCamera = async () => {
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      router.push("/app");
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    router.push("/app");
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      }
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body relative">
      {!capturedImage ? (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center h-screen w-screen overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            controls={false}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-6 right-6 z-10">
            <button
              onClick={closeCamera}
              className="bg-black/50 text-white w-12 h-12 rounded-full flex justify-center items-center hover:bg-black/80 backdrop-blur-md transition"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="absolute top-6 left-6 z-10">
            <div className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-md font-bold font-headline">
              Diagnose Crop
            </div>
          </div>
          <div className="absolute bottom-12 left-0 right-0 flex justify-center pb-safe">
            <button
              onClick={capturePhoto}
              className="bg-primary text-white w-20 h-20 rounded-full border-[6px] border-white/60 shadow-2xl flex items-center justify-center active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-4xl">
                photo_camera
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 z-[100] bg-surface flex flex-col items-center justify-center p-6 sm:p-12">
          <div className="absolute top-6 right-6">
            <button
              onClick={closeCamera}
              className="bg-surface-container-high text-on-surface w-12 h-12 rounded-full flex justify-center items-center hover:bg-surface-container-highest transition"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <h2 className="text-3xl font-headline font-extrabold text-on-surface mb-6 text-center tracking-tight shrink-0">
            Analyzing Crop...
          </h2>
          <div className="relative w-full max-w-sm h-auto max-h-[50vh] aspect-[3/4] mb-8 shrink mx-auto rounded-[2rem] shadow-2xl border-4 border-primary/20 overflow-hidden">
            <img
              src={capturedImage}
              alt="Captured crop"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/0 via-primary/40 to-primary/0 animate-[scan_2s_ease-in-out_infinite] pointer-events-none"></div>
          </div>
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @keyframes scan {
              0% { transform: translateY(-100%); }
              100% { transform: translateY(100%); }
            }
          `,
            }}
          />
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <button
              onClick={startCamera}
              className="flex-1 py-4 rounded-full font-bold bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition active:scale-[0.98]"
            >
              Retake Photo
            </button>
            <button className="flex-1 py-4 rounded-full font-bold signature-gradient text-on-primary shadow-lg shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2">
              <span>Run Diagnostic</span>
              <span className="material-symbols-outlined text-xl">
                psychology
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
