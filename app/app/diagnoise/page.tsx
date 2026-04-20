"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function DiagnosePage() {
  const { user, loading } = useCurrentUser();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [predictError, setPredictError] = useState<any | null | undefined>(
    undefined,
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const isMounted = useRef(true);
  const isCameraActive = useRef(false);
  const router = useRouter();

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // revoke any created object URL to avoid memory leaks
      if (objectUrlRef.current) {
        try {
          URL.revokeObjectURL(objectUrlRef.current);
        } catch (e) {
          // ignore
        }
        objectUrlRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const startCamera = async () => {
    isCameraActive.current = true;
    // revoke any previous object URL (from file upload)
    if (objectUrlRef.current) {
      try {
        URL.revokeObjectURL(objectUrlRef.current);
      } catch (e) {}
      objectUrlRef.current = null;
    }
    setCapturedImage(null);
    setSelectedFile(null);
    setResult(null);
    setPredictError(undefined);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      // If a previous stream got orphaned by StrictMode double-mounting, kill it now.
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      // If the component unmounted, OR the user already snapped a photo/uploaded a file
      // while we were waiting for permissions, we must aggressively stop the newly spawned stream.
      if (!isMounted.current || !isCameraActive.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      if (isMounted.current) router.push("/app");
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }
    startCamera();
    // The main cleanup is already handled by the first useEffect hook mapping to isMounted
  }, [loading, user]);

  const closeCamera = () => {
    isCameraActive.current = false;
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

        // If there was a previous object URL (from file upload), revoke it — we're using a data URL now
        if (objectUrlRef.current) {
          try {
            URL.revokeObjectURL(objectUrlRef.current);
          } catch (e) {}
          objectUrlRef.current = null;
        }

        setCapturedImage(dataUrl);
        setPredictError(undefined);
        isCameraActive.current = false;

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const dataUrl = URL.createObjectURL(file);

      // revoke previous object URL if any
      if (objectUrlRef.current) {
        try {
          URL.revokeObjectURL(objectUrlRef.current);
        } catch (e) {}
      }
      objectUrlRef.current = dataUrl;

      setCapturedImage(dataUrl);
      setPredictError(undefined);
      isCameraActive.current = false;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  };

  const runDiagnostic = async () => {
    if (!user || (!capturedImage && !selectedFile)) return;
    setIsAnalyzing(true);
    setPredictError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      // 1. Prepare File
      let fileToUpload: Blob;
      if (selectedFile) {
        fileToUpload = selectedFile;
      } else {
        const res = await fetch(capturedImage!);
        fileToUpload = await res.blob();
      }

      // 2. Upload
      const formData = new FormData();
      formData.append("uid", user.uid);
      formData.append("file", fileToUpload, "crop_image.jpg");

      const uploadRes = await fetch(`${apiUrl}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      const uploadData = await uploadRes.json();
      const objectName = uploadData.object_name;

      // 3. Predict
      const predictRes = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          object_names: [objectName], // Wait, predict schema
          uid: user.uid,
          object_name: objectName,
        }),
      });

      // New: handle non-leaf/plant response (HTTP 422) from backend
      if (predictRes.status === 422) {
        try {
          const errJson = await predictRes.json();
          const detail = errJson?.detail || {};
          // detail may contain message, score, or non_leaf array for batch
          setPredictError(detail);
        } catch (parseErr) {
          console.error("Failed to parse 422 response", parseErr);
          setPredictError({ message: "Uploaded image is not a leaf/plant." });
        }
        setResult(null);
        return;
      }

      if (!predictRes.ok) {
        throw new Error("Prediction failed");
      }

      const predictData = await predictRes.json();
      setResult(predictData);
    } catch (err) {
      console.error(err);
      alert("Diagnostic failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body relative">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        hidden
        onChange={handleFileUpload}
      />
      {!capturedImage ? (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center h-screen w-screen overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            controls={false}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-6 right-6 z-10 flex gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-black/50 text-white w-12 h-12 rounded-full flex justify-center items-center hover:bg-black/80 backdrop-blur-md transition"
              title="Upload Crop"
            >
              <span className="material-symbols-outlined">upload</span>
            </button>
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
        <div className="fixed inset-0 z-[100] bg-surface flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto">
          <div className="absolute top-6 right-6 flex gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-surface-container-high text-on-surface w-12 h-12 rounded-full flex justify-center items-center hover:bg-surface-container-highest transition"
              title="Upload Different Crop"
            >
              <span className="material-symbols-outlined">upload</span>
            </button>
            <button
              onClick={closeCamera}
              className="bg-surface-container-high text-on-surface w-12 h-12 rounded-full flex justify-center items-center hover:bg-surface-container-highest transition"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <h2 className="text-3xl font-headline font-extrabold text-on-surface mb-6 text-center tracking-tight shrink-0 mt-16 sm:mt-0">
            {result ? "Diagnostic Complete" : "Analyzing Crop..."}
          </h2>
          <div className="relative w-full max-w-xl h-[40vh] sm:h-[50vh] mb-8 shrink-0 mx-auto mt-40 rounded-[2rem] shadow-2xl border-4 border-primary/20 overflow-hidden bg-surface-container-high flex items-center justify-center">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured crop"
                className="w-full h-full object-cover block"
                style={{ objectPosition: "center" }}
              />
            ) : (
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">
                image
              </span>
            )}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-gradient-to-b from-primary/0 via-primary/40 to-primary/0 animate-[scan_2s_ease-in-out_infinite] pointer-events-none" />
            )}
          </div>

          {typeof predictError !== "undefined" && predictError && (
            <div className="w-full max-w-sm bg-error-container text-on-error-container rounded-2xl p-4 mb-4 shadow-md">
              <h4 className="font-bold mb-2">Not a leaf image</h4>
              <p className="text-sm">
                {predictError.message ||
                  "Uploaded image is not a clear leaf photo."}
              </p>
              {predictError.score !== undefined && (
                <p className="text-xs mt-2">
                  Leaf Confidence: {(predictError.score * 100).toFixed(1)}%
                </p>
              )}
              {predictError.non_leaf &&
                Array.isArray(predictError.non_leaf) && (
                  <div className="mt-2 text-xs">
                    <strong>Failed images:</strong>
                    <ul className="list-disc ml-5 mt-1">
                      {predictError.non_leaf.map((n: any, i: number) => (
                        <li key={i}>
                          {n.object_name} ({(n.score * 100).toFixed(1)}%)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}

          {result && (
            <div className="w-full max-w-sm bg-surface-container rounded-2xl p-4 mb-8 shadow-md">
              <h3 className="font-bold text-xl mb-4 font-headline">
                Predictions
              </h3>
              {result.top_predictions?.map((pred: any, i: number) => (
                <div key={i} className="flex justify-between items-center mb-2">
                  <span className="capitalize">
                    {pred.label.replace(/_/g, " ")}
                  </span>
                  <span className="font-mono bg-primary/10 text-primary px-2 py-1 rounded-md">
                    {(pred.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              ))}

              {/* Prediction complete — direct user to Advisory for AI analysis */}
              <div className="mt-6 pt-4 border-t border-outline-variant/40">
                <p className="text-xs text-on-surface-variant/60 mb-3 text-center">
                  Open the Advisory page to generate a full AI expert report for
                  this diagnosis.
                </p>
                <button
                  onClick={() => router.push("/app/adivise")}
                  className="w-full py-3 rounded-full font-bold bg-primary text-on-primary shadow-md hover:shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-xl">
                    grass
                  </span>
                  View in Advisory
                </button>
              </div>
            </div>
          )}

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
              disabled={isAnalyzing}
              className="flex-1 py-4 rounded-full font-bold bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition active:scale-[0.98] disabled:opacity-50"
            >
              Retake Photo
            </button>
            {!result && (
              <button
                onClick={runDiagnostic}
                disabled={isAnalyzing}
                className="flex-1 py-4 rounded-full font-bold signature-gradient text-on-primary shadow-lg shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isAnalyzing ? "Processing..." : "Run Diagnostic"}</span>
                {!isAnalyzing && (
                  <span className="material-symbols-outlined text-xl">
                    psychology
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
