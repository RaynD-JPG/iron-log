import { ImageResponse } from "next/og";

// Apple touch icon for iOS "Add to Home Screen". Generated at build time.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          fontSize: 110,
        }}
      >
        🏋️
      </div>
    ),
    { ...size },
  );
}
