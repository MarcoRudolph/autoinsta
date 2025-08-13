import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optional: Wenn du externe Pakete nutzt, die auf dem Server laufen müssen
  // serverExternalPackages: ['pg'], // Behalte dies nur, wenn du es wirklich brauchst

  // Diese Einstellung ist nicht mehr für die Optimierung nötig
  // und kann oft entfernt werden, teste es ohne.
  // images: {
  //   unoptimized: true
  // },
};

export default nextConfig;