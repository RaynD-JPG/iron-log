import { ImageResponse } from "next/og";

// App icon (used for favicon / manifest). Generated at build time.
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#34d399",
          fontSize: 300,
          fontWeight: 700,
        }}
      >
        🏋️
      </div>
    ),
    { ...size },
  );
}
