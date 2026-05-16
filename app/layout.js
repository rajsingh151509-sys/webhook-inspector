export const metadata = {
  title: 'Webhook Inspector',
  description: 'Capture and inspect incoming HTTP requests',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        margin: 0,
        background: '#0e0f12',
        color: '#e6e6e6',
        minHeight: '100vh',
      }}>
        {children}
      </body>
    </html>
  );
}
