import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sistema COLIH",
    short_name: "COLIH",
    description: "Gestão de Médicos e Membros",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb", // Azul (cor principal do seu sistema)
    icons: [
      {
        src: "./public/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "./public/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
