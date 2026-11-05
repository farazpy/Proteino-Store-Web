import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Truck, CreditCard, QrCode, Banknote, ArrowLeft, ArrowRight, Printer, Sparkles, Building2 } from 'lucide-react';
import { CartItem, ShippingAddress, OrderDetails } from '../types/store';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  total: number;
  onOrderComplete: (order: OrderDetails) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  subtotal,
  discount,
  couponCode,
  shipping,
  total,
  onOrderComplete,
}) => {
  const [step, setStep] = useState<'address' | 'payment' | 'confirmed'>('address');

  // Form states
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '9876543210',
    addressLine1: 'Flat 402, Green Meadows, MG Road',
    addressLine2: 'Near Central Park',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
  });

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking' | 'COD'>('UPI');
  const [upiId, setUpiId] = useState('rahul@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('821');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDetails | null>(null);

  if (!isOpen) return null;

  const handlePincodeChange = (pin: string) => {
    setAddress((prev) => ({ ...prev, postalCode: pin }));
    if (pin.length === 6) {
      if (pin.startsWith('400')) setAddress((prev) => ({ ...prev, city: 'Mumbai', state: 'Maharashtra' }));
      else if (pin.startsWith('110')) setAddress((prev) => ({ ...prev, city: 'New Delhi', state: 'Delhi' }));
      else if (pin.startsWith('560')) setAddress((prev) => ({ ...prev, city: 'Bengaluru', state: 'Karnataka' }));
      else if (pin.startsWith('380')) setAddress((prev) => ({ ...prev, city: 'Ahmedabad', state: 'Gujarat' }));
      else if (pin.startsWith('500')) setAddress((prev) => ({ ...prev, city: 'Hyderabad', state: 'Telangana' }));
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const orderId = `TP-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date();
      const deliveryDate = new Date();
      deliveryDate.setDate(now.getDate() + 3);

      const newOrder: OrderDetails = {
        orderId,
        date: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        items: [...items],
        subtotal,
        discount,
        couponCode,
        shipping,
        total,
        paymentMethod,
        shippingAddress: { ...address },
        estimatedDelivery: deliveryDate.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
      };

      setConfirmedOrder(newOrder);
      setIsProcessing(false);
      setStep('confirmed');
      onOrderComplete(newOrder);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-[#fbf7f0] rounded-3xl shadow-2xl border border-[#e4d6c0] overflow-hidden my-8">
        {/* Modal Top Bar */}
        <div className="bg-white px-6 py-4 border-b border-[#e5d8c3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00632d] flex items-center justify-center text-white font-bold text-sm">
              🥜
            </div>
            <div>
              <span className="font-display font-bold text-[#00632d] text-lg">
                Theproteino Express Checkout
              </span>
              <span className="text-[11px] text-[#786b58] block">
                100% Encrypted & Safe · Fast Dispatch
              </span>
            </div>
          </div>

          {step !== 'confirmed' && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#6d604e] hover:text-[#1a221b] hover:bg-[#f1e8d8] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Multi-Step Stepper Header */}
        {step !== 'confirmed' && (
          <div className="bg-[#f3ebd9] px-6 py-3 border-b border-[#e4d6c0] flex items-center justify-center gap-8 text-xs font-bold">
            <div
              className={`flex items-center gap-2 ${
                step === 'address' ? 'text-[#00632d]' : 'text-[#7d705c]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 'address'
                    ? 'bg-[#00632d] text-white'
                    : 'bg-[#00632d]/20 text-[#00632d]'
                }`}
              >
                1
              </span>
              <span>Delivery Details</span>
            </div>
            <span className="text-[#c7baa6]">——</span>
            <div
              className={`flex items-center gap-2 ${
                step === 'payment' ? 'text-[#00632d]' : 'text-[#7d705c]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 'payment'
                    ? 'bg-[#00632d] text-white'
                    : 'bg-[#c7baa6] text-white'
                }`}
              >
                2
              </span>
              <span>Payment & Review</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          {step === 'address' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Column */}
              <form onSubmit={handleProceedToPayment} className="lg:col-span-7 space-y-4">
                <h3 className="font-display text-lg font-bold text-[#1a221b] flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#00632d]" />
                  <span>Where Should We Ship Your Peanut Power?</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#453928] mb-1">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#453928] mb-1">
                      Phone Number (For WhatsApp tracking) *
                    </label>
                    <input
                      required
                      type="tel"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#453928] mb-1">
                    Email Address (For invoice & updates) *
                  </label>
                  <input
                    required
                    type="email"
                    value={address.email}
                    onChange={(e) => setAddress({ ...address, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#453928] mb-1">
                    Flat / House No. / Building / Street *
                  </label>
                  <input
                    required
                    type="text"
                    value={address.addressLine1}
                    onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#453928] mb-1">
                      PIN Code *
                    </label>
                    <input
                      required
                      maxLength={6}
                      type="text"
                      value={address.postalCode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#453928] mb-1">
                      City *
                    </label>
                    <input
                      required
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#453928] mb-1">
                      State *
                    </label>
                    <input
                      required
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b]"
                    />
                  </div>
                </div>

                {/* Delivery perk info */}
                <div className="p-3 bg-[#e8f5e9] border border-[#c8e6c9] rounded-xl flex items-center gap-3 text-xs text-[#00632d]">
                  <Truck className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="font-bold">Free Express Delivery:</span> Estimated arrival in 2–3 business days with real-time SMS tracking.
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#00632d] hover:bg-[#004d23] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#e5d8c3] h-fit">
                <h4 className="font-display text-sm font-bold text-[#1a221b] mb-3 pb-2 border-b border-[#f0e7d8]">
                  Order Items ({items.length})
                </h4>
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1 mb-4">
                  {items.map((it) => (
                    <div key={`${it.product.id}-${it.selectedSize}`} className="flex items-center gap-3 text-xs">
                      <img
                        src={it.product.image}
                        alt={it.product.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover border border-[#e6dbc8] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[#1a221b] truncate">{it.product.name}</div>
                        <div className="text-[11px] text-[#716452]">
                          Qty: {it.quantity} · {it.selectedSize}
                        </div>
                      </div>
                      <div className="font-bold text-[#00632d] font-mono tabular-nums">
                        ₹{(it.unitPrice * it.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 text-xs text-[#61523f] border-t border-[#f0e7d8] pt-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums text-[#1a221b]">₹{subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#00632d] font-semibold">
                      <span>Coupon Discount ({couponCode})</span>
                      <span className="font-mono tabular-nums">-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-mono tabular-nums">
                      {shipping === 0 ? <span className="text-[#00632d] font-bold">FREE</span> : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#1a221b] pt-2 border-t border-[#f0e7d8]">
                    <span>Total Amount</span>
                    <span className="text-[#00632d] font-mono tabular-nums">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Payment Method Selector */}
              <div className="lg:col-span-7 space-y-5">
                <button
                  type="button"
                  onClick={() => setStep('address')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00632d] hover:underline mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Address</span>
                </button>

                <h3 className="font-display text-lg font-bold text-[#1a221b]">
                  Choose Payment Method
                </h3>

                {/* Option 1: Instant UPI */}
                <div
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'UPI'
                      ? 'border-[#00632d] bg-[#f0f9f3]'
                      : 'border-[#dfd3c0] bg-white hover:border-[#00632d]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5 font-bold text-sm text-[#1a221b]">
                      <QrCode className="w-5 h-5 text-[#00632d]" />
                      <span>Instant UPI (Google Pay, PhonePe, Paytm, BHIM)</span>
                    </div>
                    <span className="bg-[#8ee000] text-[#004d23] text-[10px] font-black px-2 py-0.5 rounded">
                      FASTEST
                    </span>
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="mt-3 pt-3 border-t border-[#d5eadb] text-xs">
                      <label className="block text-[11px] font-bold text-[#3d3121] mb-1">
                        Enter Virtual Payment Address (UPI ID)
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="w-full px-3 py-2 bg-white border border-[#c1dec9] rounded-xl text-xs font-mono"
                      />
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-[#554737]">
                        <span>Or scan QR code directly on your mobile UPI app</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Option 2: Credit / Debit Card */}
                <div
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'Card'
                      ? 'border-[#00632d] bg-[#f0f9f3]'
                      : 'border-[#dfd3c0] bg-white hover:border-[#00632d]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 font-bold text-sm text-[#1a221b] mb-1">
                    <CreditCard className="w-5 h-5 text-[#00632d]" />
                    <span>Credit / Debit Card (Visa, Mastercard, RuPay)</span>
                  </div>

                  {paymentMethod === 'Card' && (
                    <div className="mt-3 pt-3 border-t border-[#d5eadb] space-y-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-[#3d3121] mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#c1dec9] rounded-xl text-xs font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#3d3121] mb-1">
                            Expiry (MM/YY)
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#c1dec9] rounded-xl text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#3d3121] mb-1">
                            CVV
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#c1dec9] rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Option 3: Net Banking */}
                <div
                  onClick={() => setPaymentMethod('NetBanking')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'NetBanking'
                      ? 'border-[#00632d] bg-[#f0f9f3]'
                      : 'border-[#dfd3c0] bg-white hover:border-[#00632d]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 font-bold text-sm text-[#1a221b] mb-1">
                    <Building2 className="w-5 h-5 text-[#00632d]" />
                    <span>Net Banking (All Indian Banks)</span>
                  </div>

                  {paymentMethod === 'NetBanking' && (
                    <div className="mt-3 pt-3 border-t border-[#d5eadb] text-xs">
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#c1dec9] rounded-xl text-xs font-semibold"
                      >
                        <option>HDFC Bank</option>
                        <option>State Bank of India (SBI)</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Option 4: Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'COD'
                      ? 'border-[#00632d] bg-[#f0f9f3]'
                      : 'border-[#dfd3c0] bg-white hover:border-[#00632d]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 font-bold text-sm text-[#1a221b]">
                    <Banknote className="w-5 h-5 text-[#00632d]" />
                    <span>Cash on Delivery (Pay at your doorstep)</span>
                  </div>
                  {paymentMethod === 'COD' && (
                    <p className="mt-2 text-xs text-[#524434] pl-7">
                      Pay with cash or UPI to the courier delivery agent upon arrival.
                    </p>
                  )}
                </div>

                <div className="pt-3">
                  <button
                    disabled={isProcessing}
                    onClick={handlePlaceOrder}
                    className="w-full py-4 bg-[#00632d] hover:bg-[#004d23] text-white font-display text-base font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-75 cursor-pointer"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Confirming Your Order...
                      </span>
                    ) : (
                      <span>Place Order · ₹{total.toLocaleString()}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Order Recap Column */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#e5d8c3] h-fit">
                <h4 className="font-display text-sm font-bold text-[#1a221b] mb-3 pb-2 border-b border-[#f0e7d8]">
                  Delivery Summary
                </h4>
                <div className="text-xs text-[#554737] space-y-1 mb-4 bg-[#faf5ec] p-3 rounded-xl border border-[#eae0ce]">
                  <div className="font-bold text-[#1a221b]">{address.fullName}</div>
                  <div>{address.phone}</div>
                  <div>{address.addressLine1}</div>
                  <div>{address.city}, {address.state} - {address.postalCode}</div>
                </div>

                <div className="space-y-1.5 text-xs text-[#61523f] border-t border-[#f0e7d8] pt-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums text-[#1a221b]">₹{subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#00632d] font-semibold">
                      <span>Discount</span>
                      <span className="font-mono tabular-nums">-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span className="font-mono tabular-nums text-[#00632d] font-bold">
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#1a221b] pt-2 border-t border-[#f0e7d8]">
                    <span>Total Payable</span>
                    <span className="text-[#00632d] font-mono tabular-nums">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'confirmed' && confirmedOrder && (
            <div className="text-center py-6 sm:py-8 max-w-xl mx-auto animate-in zoom-in-95">
              <div className="w-20 h-20 bg-[#e8f5e9] text-[#00632d] rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#8ee000]/20 text-[#004d23] px-3 py-1 rounded-full mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Order Successfully Confirmed!</span>
              </div>

              <h3 className="font-display text-3xl font-bold text-[#1a221b] mb-1">
                Thank You, {confirmedOrder.shippingAddress.fullName.split(' ')[0]}!
              </h3>
              <p className="text-xs sm:text-sm text-[#6f614f] mb-6">
                Your order <span className="font-mono font-bold text-[#00632d]">{confirmedOrder.orderId}</span> has been received and is being freshly packed at our Gujarat roastery.
              </p>

              {/* Delivery Tracker Simulation Card */}
              <div className="bg-white p-5 rounded-2xl border border-[#e5d8c3] text-left mb-6 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-[#1a221b] pb-3 border-b border-[#f0e7d8] mb-4">
                  <span>Estimated Delivery</span>
                  <span className="text-[#00632d]">{confirmedOrder.estimatedDelivery}</span>
                </div>

                {/* Progress Steps */}
                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-[#00632d] text-white flex items-center justify-center font-bold mb-1">
                      ✓
                    </div>
                    <span className="font-bold text-[#00632d]">Order Placed</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-[#00632d] text-white flex items-center justify-center font-bold mb-1">
                      2
                    </div>
                    <span className="font-bold text-[#1a221b]">Roasting / Pack</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-[#dfd4c3] text-[#716352] flex items-center justify-center font-bold mb-1">
                      3
                    </div>
                    <span className="text-[#716352]">Express Transit</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-[#dfd4c3] text-[#716352] flex items-center justify-center font-bold mb-1">
                      4
                    </div>
                    <span className="text-[#716352]">Delivered</span>
                  </div>
                </div>
              </div>

              {/* Receipt Summary Box */}
              <div className="bg-[#faf4e8] p-4 rounded-xl border border-[#e8dccb] text-left text-xs mb-6 space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#6d5e4b]">Payment Method:</span>
                  <span className="font-bold text-[#1a221b]">{confirmedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6d5e4b]">Delivery To:</span>
                  <span className="font-semibold text-[#1a221b]">{confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.postalCode}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#00632d] pt-2 border-t border-[#ebdcc8]">
                  <span>Total Paid:</span>
                  <span className="font-mono tabular-nums">₹{confirmedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-white border border-[#d6c7b0] hover:bg-[#f1e8d8] text-[#3d3121] text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#00632d] hover:bg-[#004d23] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
