import { ImageResponse } from "next/og";

export const alt = "Ellis — tybuilds. Ask about her work.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#121110",
          color: "#f2ece4",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            style={{
              fontSize: 18,
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: "#a39a90",
            }}
          >
            tybuilds
          </div>
          <div
            style={{
              fontSize: 88,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            Ellis
          </div>
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#a39a90",
            letterSpacing: "-0.01em",
          }}
        >
          Ask about her work.
        </div>
      </div>
    ),
    { ...size },
  );
}
