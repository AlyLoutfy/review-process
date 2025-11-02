import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sodic Releases Dashboard",
  description: "Manage and review releases for Sodic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                console.log('=== Deployment Debug Info ===');
                console.log('Current URL:', window.location.href);
                console.log('Document Base URI:', document.baseURI);
                console.log('Document Origin:', window.location.origin);
                console.log('Document Pathname:', window.location.pathname);
                
                console.log('\\n--- CSS Links ---');
                const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
                console.log('Total CSS links found:', cssLinks.length);
                cssLinks.forEach((link, index) => {
                  const href = link.getAttribute('href');
                  console.log(\`CSS Link \${index + 1}:\`, href);
                  
                  // Check if it's a relative path
                  if (href && !href.startsWith('http') && !href.startsWith('//')) {
                    const fullUrl = new URL(href, window.location.href).href;
                    console.log(\`  → Resolved to:\`, fullUrl);
                  }
                });
                
                console.log('\\n--- JS Scripts ---');
                const jsScripts = Array.from(document.querySelectorAll('script[src]'));
                console.log('Total JS scripts found:', jsScripts.length);
                jsScripts.forEach((script, index) => {
                  const src = script.getAttribute('src');
                  if (src && !src.includes('debug')) {
                    console.log(\`JS Script \${index + 1}:\`, src);
                    
                    // Check if it's a relative path
                    if (src && !src.startsWith('http') && !src.startsWith('//')) {
                      const fullUrl = new URL(src, window.location.href).href;
                      console.log(\`  → Resolved to:\`, fullUrl);
                    }
                  }
                });
                
                console.log('\\n--- Font Links ---');
                const fontLinks = document.querySelectorAll('link[as="font"]');
                console.log('Total font links found:', fontLinks.length);
                fontLinks.forEach((link, index) => {
                  const href = link.getAttribute('href');
                  console.log(\`Font Link \${index + 1}:\`, href);
                });
                
                console.log('\\n--- Checking for _next directory ---');
                fetch('/_next/static/chunks/', { method: 'HEAD' })
                  .then(response => {
                    console.log('_next/static/chunks/ check:', response.status === 404 ? '404 - NOT FOUND' : 'FOUND (' + response.status + ')');
                  })
                  .catch(error => {
                    console.log('_next/static/chunks/ check: ERROR', error);
                  });
                
                console.log('\\n--- Document Head Info ---');
                console.log('Base tag:', document.querySelector('base') ? document.querySelector('base').href : 'None');
                console.log('=== End Debug Info ===');
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
