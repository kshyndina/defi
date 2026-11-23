import './globals.css';

export const metadata = {
  title: 'עיר של עצמות — קורא עברית',
  description: 'Hebrew e-reader with contextual translation and transliteration',
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
