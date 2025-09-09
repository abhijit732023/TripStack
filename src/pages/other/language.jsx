import React, { useState } from "react";
import axios from "axios";

export default function TranslateMessage() {
  const [message, setMessage] = useState("");
  const [translated, setTranslated] = useState("");
  const [translating, setTranslating] = useState(false);
  const [sourceLang, setSourceLang] = useState("mr"); // default Marathi

  const translateToEnglish = async () => {
    if (!message.trim()) return;

    setTranslating(true);

    try {
      const response = await axios.get(
        "https://api.mymemory.translated.net/get",
        {
          params: {
            q: message,
            langpair: `${sourceLang}|en`, // dynamic source → English
          },
        }
      );

      const translatedText =
        response.data.responseData.translatedText || "Translation failed";
      setTranslated(translatedText);
    } catch (err) {
      console.error(err);
      setTranslated("Translation failed. Try again later.");
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Translate WhatsApp Message</h2>

      {/* Language Selector */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Select Source Language:</label>
        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="w-full border p-2 rounded-md"
        >
          <option value="mr">Marathi</option>
          <option value="hi">Hindi</option>
          <option value="ml">Malayalam</option>
          <option value="ta">Tamil</option>
          <option value="kn">Kannada</option>
          <option value="te">Telugu</option>
          <option value="bn">Bengali</option>
          <option value="gu">Gujarati</option>
          <option value="pa">Punjabi</option>
          <option value="or">Odia</option>
          <option value="en">English</option>
          {/* Add more languages as needed */}
        </select>
      </div>

      <textarea
        rows={6}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Paste WhatsApp message here..."
        className="w-full border p-3 rounded-md mb-4"
      />

      <button
        onClick={translateToEnglish}
        disabled={translating}
        className="px-4 py-2 bg-yellow-500 text-white rounded-md mb-4"
      >
        {translating ? "Translating..." : "Translate to English"}
      </button>

      {translated && (
        <div className="mt-4 p-3 border rounded-md bg-gray-50">
          <strong>Translated:</strong>
          <p>{translated}</p>
        </div>
      )}
    </div>
  );
}
