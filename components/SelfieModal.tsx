import React, { useRef, useState, useEffect } from "react";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import { Camera } from "@mediapipe/camera_utils";

// Backgrounds
const BACKGROUNDS = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab",
];

const AVATAR_URL =
  "https://thumbs.dreamstime.com/b/racing-driver-avatar-vector-7967425.jpg";

const SelfieModal = ({ onClose }: { onClose: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mergedSelfie, setMergedSelfie] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<HTMLImageElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [selectedBg, setSelectedBg] = useState<string | null>(null);

  const canvasWidth = 640;
  const canvasHeight = 480;
  let selfieSegmentation: SelfieSegmentation | null = null;
  let camera: Camera | null = null;

  // Load avatar and remove white background
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = "/alonso_avatar.png"; // Use local avatar image
    img.onload = () => {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvasWidth / 2;
      tempCanvas.height = canvasHeight;
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
        // Remove white background by setting alpha to 0 for white pixels
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          if (r > 240 && g > 240 && b > 240) {
            imageData.data[i + 3] = 0;
          }
        }
        tempCtx.putImageData(imageData, 0, 0);
        const avatarNoBg = new window.Image();
        avatarNoBg.src = tempCanvas.toDataURL();
        avatarNoBg.onload = () => setAvatar(avatarNoBg);
      }
    };
  }, []);

  // Start camera with live background replacement
  const startCamera = async () => {
    if (!selectedBg) {
      setCameraError("Please select a background first!");
      return;
    }
    setCameraError(null);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      selfieSegmentation = new SelfieSegmentation({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });
      selfieSegmentation.setOptions({ modelSelection: 1 });

      selfieSegmentation.onResults((results) => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        // Draw selected background first
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.src = selectedBg!;
        bgImg.onload = () => {
          ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);

          // Binary mask cleanup
          const maskCanvas = document.createElement("canvas");
          maskCanvas.width = canvasWidth;
          maskCanvas.height = canvasHeight;
          const maskCtx = maskCanvas.getContext("2d");
          if (!maskCtx) return;
          maskCtx.drawImage(results.segmentationMask, 0, 0, canvasWidth, canvasHeight);

          const maskData = maskCtx.getImageData(0, 0, canvasWidth, canvasHeight);
          for (let i = 0; i < maskData.data.length; i += 4) {
            const val = maskData.data[i];
            if (val > 128) {
              maskData.data[i] = 255;
              maskData.data[i + 1] = 255;
              maskData.data[i + 2] = 255;
              maskData.data[i + 3] = 255;
            } else {
              maskData.data[i + 3] = 0;
            }
          }
          maskCtx.putImageData(maskData, 0, 0);

          // Use mask to overlay person
          ctx.save();
          ctx.globalCompositeOperation = "source-over";
          ctx.drawImage(results.image, 0, 0, canvasWidth, canvasHeight);
          ctx.restore();
        };
      });

      camera = new Camera(videoRef.current!, {
        onFrame: async () => {
          await selfieSegmentation!.send({ image: videoRef.current! });
        },
        width: canvasWidth,
        height: canvasHeight,
      });

      camera.start();
    } catch (err) {
      setCameraError("Camera not accessible. Allow permissions and reload.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Take selfie (capture canvas + add avatar enlarged)
  const takeSelfie = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
  
    if (avatar) {
      const marginTop = 5; // tiny gap at top
      const avatarH = canvasHeight - marginTop; // full height
      const aspectRatio = avatar.width / avatar.height;
      const avatarW = avatarH * aspectRatio;
  
      const avatarX = 0; // align to left
  
      ctx.drawImage(avatar, avatarX, marginTop, avatarW, avatarH);
    }
  
    const data = canvasRef.current.toDataURL("image/png");
    setMergedSelfie(data);
    stopCamera();
  };
  

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#1A1A1A] rounded-2xl p-6 w-[700px] relative flex flex-col items-center">
        <button onClick={handleClose} className="absolute top-2 right-2 text-white">
          ✖
        </button>
        <h2 className="text-white text-xl font-bold mb-2">
          Selfie with Virtual Background
        </h2>

        {cameraError && <p className="text-red-400">{cameraError}</p>}

        {/* Background picker */}
        {!mergedSelfie && (
          <div className="flex gap-2 mb-4">
            {BACKGROUNDS.map((bg, i) => (
              <img
                key={i}
                src={bg}
                alt="bg"
                className={`w-24 h-16 object-cover cursor-pointer rounded-lg border-2 ${
                  selectedBg === bg ? "border-blue-400" : "border-gray-500"
                }`}
                onClick={() => setSelectedBg(bg)}
              />
            ))}
          </div>
        )}

        {!mergedSelfie && (
          <>
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="rounded-lg border border-gray-400"
            />
            <video ref={videoRef} style={{ display: "none" }} />

            <div className="mt-4 flex gap-2">
              <button onClick={startCamera} className="bg-green-400 px-3 py-2 rounded-lg">
                Start Camera
              </button>
              <button onClick={takeSelfie} className="bg-blue-400 px-3 py-2 rounded-lg">
                Take Selfie
              </button>
              <button onClick={stopCamera} className="bg-red-400 px-3 py-2 rounded-lg">
                Stop Camera
              </button>
            </div>
          </>
        )}

        {mergedSelfie && (
          <div className="mt-4 flex flex-col items-center">
            <img src={mergedSelfie} alt="Selfie" className="rounded-lg border border-green-400" />
            <a
              href={mergedSelfie}
              download="selfie_with_background.png"
              className="bg-blue-400 px-4 py-2 rounded-lg mt-4 text-white"
            >
              Download Selfie
            </a>
            <button
              onClick={() => setMergedSelfie(null)}
              className="bg-yellow-400 px-4 py-2 rounded-lg mt-4"
            >
              Retake
            </button>
            <button onClick={handleClose} className="bg-green-400 px-4 py-2 rounded-lg mt-4">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelfieModal;
