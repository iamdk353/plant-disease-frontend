"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function DiagnosePage() {
  const { user, loading } = useCurrentUser();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [result, setResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const startCamera = async () => {
    setCapturedImage(null);
    setSelectedFile(null);
    setResult(null);
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
  }, [loading, user]);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const dataUrl = URL.createObjectURL(file);
      setCapturedImage(dataUrl);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  };

  const runDiagnostic = async () => {
    if (!user || (!capturedImage && !selectedFile)) return;
    setIsAnalyzing(true);
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
          object_name: objectName
        }),
      });

      if (!predictRes.ok) {
        throw new Error("Prediction failed");
      }

      const predictData = await predictRes.json();
      setResult(predictData);

      // Fetch AI Report
      if (predictData.prediction_id) {
          setIsGeneratingReport(true);
          // Get Live Location
          let locData = null;
          try {
             const getLoc = () => new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
             });
             const position = await getLoc();
             locData = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
             };
          } catch (locErr) {
             console.warn("Could not fetch location:", locErr);
          }

          const aiReportRes = await fetch(`${apiUrl}/api/ai/report`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  prediction_id: predictData.prediction_id,
                  location: locData
              })
          });

          if (aiReportRes.ok) {
              const reportData = await aiReportRes.json();
              setResult({ ...predictData, ai_report: reportData });
          }
          setIsGeneratingReport(false);
      }

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
          <div className="relative w-full max-w-sm h-auto max-h-[50vh] aspect-[3/4] mb-8 shrink mx-auto rounded-[2rem] shadow-2xl border-4 border-primary/20 overflow-hidden">
            <img
              src={capturedImage}
              alt="Captured crop"
              className="w-full h-full object-cover"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-gradient-to-b from-primary/0 via-primary/40 to-primary/0 animate-[scan_2s_ease-in-out_infinite] pointer-events-none"></div>
            )}
          </div>
          
          {result && (
            <div className="w-full max-w-sm bg-surface-container rounded-2xl p-4 mb-8 shadow-md">
              <h3 className="font-bold text-xl mb-4 font-headline">Predictions</h3>
              {result.top_predictions?.map((pred: any, i: number) => (
                <div key={i} className="flex justify-between items-center mb-2">
                  <span className="capitalize">{pred.label.replace(/_/g, ' ')}</span>
                  <span className="font-mono bg-primary/10 text-primary px-2 py-1 rounded-md">
                    {(pred.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
              
              {isGeneratingReport && (
                <div className="mt-6 pt-6 border-t border-outline-variant flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-primary font-bold animate-pulse">
                    <span className="material-symbols-outlined animate-spin text-xl">psychology</span>
                    Generating AI Expert Analysis...
                  </div>
                  <div className="h-4 w-full bg-surface-variant/50 animate-pulse rounded-full"></div>
                  <div className="h-4 w-[80%] bg-surface-variant/50 animate-pulse rounded-full"></div>
                  <div className="h-24 w-full bg-surface-variant/50 animate-pulse rounded-xl mt-2"></div>
                </div>
              )}
              
              {result.ai_report && !isGeneratingReport && (
                <div className="mt-6 pt-4 border-t border-outline-variant text-center">
                  <div className="inline-flex items-center justify-center p-3 bg-secondary-container text-on-secondary-container rounded-full mb-3">
                    <span className="material-symbols-outlined text-3xl">check_circle</span>
                  </div>
                  <h3 className="font-bold text-lg font-headline text-on-surface">AI Expert Report Saved</h3>
                  <p className="text-sm text-on-surface-variant mb-4">A complete agricultural analysis has been generated for your record.</p>
                  <button 
                    onClick={() => router.push('/app/adivise')}
                    className="w-full py-3 rounded-full font-bold bg-primary text-on-primary shadow-md hover:shadow-lg transition-transform active:scale-95"
                  >
                    Read Full Advisory Report
                  </button>
                </div>
              )}
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
