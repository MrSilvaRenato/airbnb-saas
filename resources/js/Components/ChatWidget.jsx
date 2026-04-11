import { useState, useEffect } from "react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [agentAvailable, setAgentAvailable] = useState(false);

  useEffect(() => {
    fetch('/chat-status')
      .then(res => res.json())
      .then(data => setAgentAvailable(data.available));
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 bg-black text-white px-4 py-2 rounded-full shadow-lg"
      >
        Chat
      </button>

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
                <span className="font-medium">support@hostflows.com.au</span>
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}