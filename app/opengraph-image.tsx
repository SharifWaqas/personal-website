import { ImageResponse } from "next/og";

export const alt =
  "Muhammad Sharif — Software Engineer, Computer Science + Mathematics";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#050607",
          color: "#f2f0ea",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 570,
            height: 570,
            left: 650,
            top: 30,
            borderRadius: 999,
            border: "1px solid rgba(242,240,234,0.12)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 430,
            height: 430,
            left: 720,
            top: 100,
            borderRadius: 999,
            border: "1px solid rgba(120,211,203,0.3)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            left: 785,
            top: 165,
            borderRadius: 999,
            border: "1px solid rgba(141,124,255,0.32)",
            display: "flex",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 890,
            top: 118,
            width: 2,
            height: 150,
            background: "rgba(242,240,234,0.7)",
            transform: "rotate(24deg)",
            transformOrigin: "top center",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 952,
            top: 255,
            width: 2,
            height: 150,
            background: "rgba(242,240,234,0.55)",
            transform: "rotate(-42deg)",
            transformOrigin: "top center",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 884,
            top: 108,
            width: 12,
            height: 12,
            borderRadius: 999,
            background: "#f2f0ea",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 948,
            top: 249,
            width: 12,
            height: 12,
            borderRadius: 999,
            background: "#e7a84f",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 852,
            top: 352,
            width: 12,
            height: 12,
            borderRadius: 999,
            background: "#8d7cff",
            display: "flex",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: "72px 74px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 760,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 18,
              letterSpacing: 4,
              color: "rgba(242,240,234,0.48)",
            }}
          >
            DETERMINISTIC DIVERGENCE / PORTFOLIO
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 70,
                lineHeight: 0.96,
                letterSpacing: -4,
                fontWeight: 500,
              }}
            >
              Muhammad Sharif
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 28,
                color: "rgba(242,240,234,0.72)",
              }}
            >
              Software Engineering · Computer Science + Mathematics
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 28,
              fontSize: 18,
              color: "rgba(242,240,234,0.46)",
            }}
          >
            <span>BACKEND SYSTEMS</span>
            <span>DISTRIBUTED INFRASTRUCTURE</span>
            <span>AI APPLICATIONS</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
