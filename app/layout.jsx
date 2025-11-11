/* eslint-disable react/prop-types */
import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: {
    default: "ZoctorAI",
    template: "%s | ZoctorAI",
  },
  description: "ZoctorAI — AI-powered medical insights, reports and healthcare solutions.",
  icons: {
    icon: "/fav.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

