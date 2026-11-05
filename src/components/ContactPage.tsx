import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare, ShieldCheck } from 'lucide-react';

interface ContactPageProps {
  onGoHome: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onGoHome }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orderId, setOrderId] = useState('');
  const [subject, setSubject] = useState('Order Status & Tracking');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setSubmitted(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setPhone('');
      setOrderId('');
      setMessage('');
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="bg-[#fbf7f0] min-h-screen pb-20">
      {/* Top Banner */}
      <div className="bg-[#1b261e] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#2d4233]">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8ee000] hover:underline mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store Front</span>
          </button>

          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Contact Theproteino Support
          </h1>
          <p className="text-xs sm:text-sm text-[#a3b8aa]">
            We're here to help with order tracking, bulk enquiries, or nutrition advice.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Direct Support Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d6c0] shadow-sm space-y-6">
              <h2 className="font-display text-xl font-bold text-[#1a221b]">
                Get In Touch Directly
              </h2>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#00632d]/10 text-[#00632d] flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-[#1a221b]">Email Support</div>
                    <a href="mailto:support@theproteino.com" className="text-[#00632d] font-semibold hover:underline">
                      support@theproteino.com
                    </a>
                    <div className="text-[11px] text-[#786b59] mt-0.5">Typical response within 2 hours</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#00632d]/10 text-[#00632d] flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-[#1a221b]">WhatsApp & Phone Helpline</div>
                    <div className="font-semibold text-[#00632d]">+91 98765 43210</div>
                    <div className="text-[11px] text-[#786b59] mt-0.5">Mon to Sat · 9:00 AM to 7:00 PM IST</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#00632d]/10 text-[#00632d] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-[#1a221b]">Gujarat Roastery Address</div>
                    <div className="text-[#524433] leading-relaxed">
                      Plot 42, GIDC Industrial Estate, Rajkot-Ahmedabad Highway, Saurashtra, Gujarat - 360003, India.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 pt-2 border-t border-[#f0e7d8]">
                  <div className="w-10 h-10 rounded-xl bg-[#00632d]/10 text-[#00632d] flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-[#1a221b]">Dispatch & Roasting Hours</div>
                    <div className="text-[#524433]">Monday – Saturday: 9:00 AM – 6:00 PM</div>
                    <div className="text-[11px] text-[#786b59]">Orders before 2 PM dispatched same day</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-[#eaf4ec] rounded-2xl border border-[#c8e6c9] text-xs text-[#00632d] flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 shrink-0" />
              <div>
                <span className="font-bold">Need instant tracking?</span> Click "Bag" or check your WhatsApp for real-time delivery notifications.
              </div>
            </div>
          </div>

          {/* Right Column: Contact & Inquiry Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d6c0] shadow-sm">
            <h2 className="font-display text-xl font-bold text-[#1a221b] mb-1">
              Send Us a Message
            </h2>
            <p className="text-xs text-[#716350] mb-6">
              Fill in your details below and our customer support team will get back to you shortly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3d3121] mb-1">
                    Your Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#fbf7f0] border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3d3121] mb-1">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#fbf7f0] border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3d3121] mb-1">
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#fbf7f0] border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3d3121] mb-1">
                    Order ID (If regarding an existing order)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TP-104291"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#fbf7f0] border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3d3121] mb-1">
                  Enquiry Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#fbf7f0] border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b] font-semibold"
                >
                  <option>Order Status & Tracking</option>
                  <option>Damaged or Defective Item Replacement</option>
                  <option>Bulk & Corporate Distributorship Enquiries</option>
                  <option>Nutrition & Ingredient Clarifications</option>
                  <option>General Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3d3121] mb-1">
                  Your Message *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your query in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#fbf7f0] border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b]"
                />
              </div>

              {submitted ? (
                <div className="p-4 bg-[#e8f5e9] text-[#00632d] text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Thank you! Your message has been received. Ticket ID #SUP-{Math.floor(1000 + Math.random() * 9000)}. We will email you back shortly.</span>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-3 bg-[#00632d] hover:bg-[#004d23] text-white font-bold text-xs rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Message</span>
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
