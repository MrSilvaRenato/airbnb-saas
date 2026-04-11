import { useState } from "react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  // 🔥 Toggle this manually or later connect to backend
  const agentAvailable = false;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 bg-black text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-800"
      >
        Chat
      </button>

      {/* Chat Box */}
      {open && (
        <div className="fixed bottom-20 right-5 w-80 bg-white border rounded-2xl shadow-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Live Chat</h3>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="text-sm text-gray-700">
            {agentAvailable ? (
              <p>
                Thanks for reaching out! An agent will be with you shortly.
              </p>
            ) : (
              <p>
                Thanks for reaching out through our live chat. Our support team
                is unavailable right now. <br /><br />
                Please email us at{" "}
                <span className="font-medium">support@yourdomain.com</span> and
                we will get back to you.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}