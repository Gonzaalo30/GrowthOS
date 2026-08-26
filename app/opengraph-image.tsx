import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "GrowthOS — Haz crecer tu negocio online";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff7ed",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 88, fontWeight: 700, color: "#0a0a0a" }}>
          Growth
          <span style={{ color: "#f97316" }}>OS</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 34,
            color: "#44403c",
            maxWidth: 900,
            textAlign: "center",
          }}
        >
          Descubre cuántas oportunidades está perdiendo tu negocio online
        </div>
      </div>
    ),
    { ...size },
  );
}
