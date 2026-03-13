import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import emailjs from "@emailjs/browser";

const Contact: React.FC = () => {
  const formRef = useRef<HTMLFormElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"" | "success" | "error">("");
  const [errorMessage, setErrorMessage] = useState("");
  const [startedAt] = useState(Date.now());

  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("");
    setErrorMessage("");

    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);

    const userName = String(formData.get("user_name") || "").trim();
    const userEmail = String(formData.get("user_email") || "").trim();
    const inquiryType = String(formData.get("inquiry_type") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const company = String(formData.get("company") || "").trim();
    const elapsed = Date.now() - startedAt;

    if (!userName || !userEmail || !inquiryType || !message) {
      setStatus("error");
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (company) {
      setStatus("error");
      setErrorMessage("Spam detected.");
      return;
    }

    if (elapsed < 3000) {
      setStatus("error");
      setErrorMessage("Please wait a moment before submitting the form.");
      return;
    }

    if (message.length < 10) {
      setStatus("error");
      setErrorMessage("Message must be at least 10 characters.");
      return;
    }

    setLoading(true);

    try {
      await emailjs.sendForm(
        "service_dv3phbh",
        "template_v6u5q6f",
        form,
        "eGjRJmQcp1PR1YgS9"
      );

      setStatus("success");
      form.reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <nav className="h-20 border-b border-slate-100 flex items-center justify-between px-6 max-w-7xl mx-auto">
        <Link
          to="/"
          className="text-xl font-black uppercase tracking-tighter text-blue-600"
        >
          Warenova
        </Link>
        <Link
          to="/login"
          className="text-[10px] font-black uppercase tracking-widest text-slate-400"
        >
          Login
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32">
          <div>
            <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-6 block italic">
              Human Interface
            </span>
            <h1 className="text-7xl font-black uppercase tracking-tighter leading-[0.8] mb-12 italic">
              Connect <br />
              <span className="text-blue-600">Protocol.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl mb-12">
              Need technical support or enterprise sales consulting? Our team of
              operational engineers is standing by to assist your sync deployment.
            </p>

            <div className="space-y-8">
              <div className="p-8 bg-slate-50 border-l-4 border-blue-600">
                <h4 className="text-sm font-black uppercase tracking-widest mb-2">
                  L1 Support (Community)
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Free tier help via our public documentation and community channels.
                </p>
              </div>
              <div className="p-8 bg-slate-50 border-l-4 border-slate-900">
                <h4 className="text-sm font-black uppercase tracking-widest mb-2">
                  L2 Support (Priority)
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dedicated ticket queue for Enterprise and Precision Plus operators.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-12 border border-slate-200 shadow-[20px_20px_0px_#f1f5f9]">
            <form ref={formRef} onSubmit={sendEmail} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Operator Name
                  </label>
                  <input
                    type="text"
                    name="user_name"
                    className="w-full border-2 border-slate-100 p-4 outline-none focus:border-blue-600 bg-white"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Registry Email
                  </label>
                  <input
                    type="email"
                    name="user_email"
                    className="w-full border-2 border-slate-100 p-4 outline-none focus:border-blue-600 bg-white"
                    placeholder="admin@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Inquiry Type
                </label>
                <select
                  name="inquiry_type"
                  className="w-full border-2 border-slate-100 p-4 outline-none focus:border-blue-600 bg-white text-xs font-black uppercase"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select inquiry type
                  </option>
                  <option>Enterprise Sales</option>
                  <option>Technical Sync Issue</option>
                  <option>Infrastructure Audit</option>
                  <option>General Support</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Detailed Narrative
                </label>
                <textarea
                  name="message"
                  rows={5}
                  className="w-full border-2 border-slate-100 p-4 outline-none focus:border-blue-600 bg-white resize-none"
                  placeholder="Describe your operational requirement..."
                  required
                ></textarea>
              </div>

              <input type="hidden" name="to_name" value="Victor" />

              <div className="hidden" aria-hidden="true">
                <label htmlFor="company">Company</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-6 font-black uppercase tracking-[0.3em] text-xs hover:bg-blue-600 transition-all shadow-xl active:translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading && (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                )}
                <span>{loading ? "Sending..." : "Initialize Connection"}</span>
              </button>

              <div className="min-h-[32px]">
                {status === "success" && (
                  <div className="animate-[fadeIn_.4s_ease-out] rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 text-sm font-medium">
                    ✅ Message sent successfully.
                  </div>
                )}

                {status === "error" && (
                  <div className="animate-[fadeIn_.4s_ease-out] rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm font-medium">
                    ❌ {errorMessage}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        <section className="border-t border-slate-100 pt-32">
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-center text-slate-400 mb-20 italic">
            Global Operational Hubs
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <h5 className="font-black uppercase text-sm mb-2">SF_CORE</h5>
              <p className="text-[10px] text-slate-400 leading-relaxed uppercase">
                San Francisco, CA
                <br />
                HQ & Cloud OPS
              </p>
            </div>
            <div>
              <h5 className="font-black uppercase text-sm mb-2">LDN_NODE</h5>
              <p className="text-[10px] text-slate-400 leading-relaxed uppercase">
                London, UK
                <br />
                EMEA Distribution
              </p>
            </div>
            <div>
              <h5 className="font-black uppercase text-sm mb-2">TKY_EDGE</h5>
              <p className="text-[10px] text-slate-400 leading-relaxed uppercase">
                Tokyo, JP
                <br />
                APAC Operations
              </p>
            </div>
            <div>
              <h5 className="font-black uppercase text-sm mb-2">SYD_SYNC</h5>
              <p className="text-[10px] text-slate-400 leading-relaxed uppercase">
                Sydney, AU
                <br />
                Oceania Hub
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;
