import { useState, useEffect, useRef, FormEvent } from 'react';
import { BundleOption, FaqItem, SocialProof } from './types';
import TimerBar from './components/TimerBar';
import AnnouncementBar from './components/AnnouncementBar';
import ProductCarousel from './components/ProductCarousel';
import BundleSelector from './components/BundleSelector';
import FaqAccordion from './components/FaqAccordion';
import SocialProofToast from './components/SocialProofToast';
import StickyBuyBar from './components/StickyBuyBar';
import FireFooterBackground from './components/FireFooterBackground';
import ShoppableVideoCarousel from './components/ShoppableVideoCarousel';
import AdminPanel from './components/AdminPanel';
import { Flame, ShieldCheck, ShieldAlert, AlertTriangle, Check, X, Star, Clock, ThumbsUp, Sparkles } from 'lucide-react';

// Import images
import heroImg from './assets/images/extintor_baw_hero_1783034657755.jpg';
import lifestyleImg from './assets/images/extintor_baw_lifestyle_1783034669442.jpg';

const BUNDLE_OPTIONS: BundleOption[] = [
  { id: '1', quantity: 1, label: '1 ud.', pricePerUnit: 89900, totalPrice: 89900, imagesCount: 1 },
  { id: '2', quantity: 2, label: '2 uds.', pricePerUnit: 80910, totalPrice: 161820, discountBadge: '−10%', isBestSeller: true, imagesCount: 2 },
  { id: '3', quantity: 3, label: '3 uds.', pricePerUnit: 76415, totalPrice: 229245, discountBadge: '−15%', imagesCount: 3 }
];

const FAQ_ITEMS: FaqItem[] = [
  { question: '¿Funciona sin electricidad?', answer: 'Sí. Activación 100% térmica por temperatura extrema de incendio. Cero cables, cero baterías.' },
  { question: '¿Necesita mantenimiento?', answer: 'No. Una vez instalado en el riel DIN, permanece activo y listo por años.' },
  { question: '¿Es para mi tablero?', answer: 'Sí, es compatible con tableros residenciales, comerciales e industriales estándar que tengan montaje de riel DIN.' },
  { question: '¿Cómo sé que es original?', answer: 'Cada unidad trae un código QR grabado con trazabilidad directa y manual técnico oficial BAW.' }
];

const SOCIAL_PROOF_DATA: SocialProof[] = [
  { user: "Juan de Córdoba", action: "compró 2 unidades", time: "Hace 8 minutos" },
  { user: "María de Buenos Aires", action: "compró 1 unidad", time: "Hace 2 minutos" },
  { user: "Carlos de Rosario", action: "compró 3 unidades", time: "Hace 15 minutos" },
  { user: "Andrés de Mendoza", action: "compró 2 unidades", time: "Hace 24 minutos" },
  { user: "Sofía de San Isidro", action: "compró 1 unidad", time: "Hace 32 minutos" }
];

export default function App() {
  const [activeView, setActiveView] = useState<'main' | 'terms' | 'privacy' | 'refund'>('main');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#terminos-y-condiciones') {
        setActiveView('terms');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else if (hash === '#politica-de-privacidad') {
        setActiveView('privacy');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else if (hash === '#arrepentimiento') {
        setActiveView('refund');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        setActiveView('main');
      }
    };

    handleHashChange(); // Run initially
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Refund / Arrepentimiento Form States
  const [refundEmail, setRefundEmail] = useState('');
  const [refundOrderId, setRefundOrderId] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundStatus, setRefundStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [refundMessage, setRefundMessage] = useState('');

  const handleRefundSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!refundEmail || !refundOrderId) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    setRefundStatus('loading');

    setTimeout(() => {
      const existingOrdersStr = localStorage.getItem('baw_orders');
      let existingOrders = [];
      if (existingOrdersStr) {
        try {
          existingOrders = JSON.parse(existingOrdersStr);
        } catch (err) {
          existingOrders = [];
        }
      }

      const orderIndex = existingOrders.findIndex(
        (o: any) => o.id.toLowerCase() === refundOrderId.trim().toLowerCase()
      );

      if (orderIndex !== -1) {
        existingOrders[orderIndex].status = 'cancelled';
        localStorage.setItem('baw_orders', JSON.stringify(existingOrders));
        setRefundMessage(`¡Tu orden ${existingOrders[orderIndex].id} ha sido cancelada con éxito! El reintegro del 100% de tu pago ($${existingOrders[orderIndex].totalPrice.toLocaleString('es-AR')}) se procesará de forma automática a través de Mercado Pago en tu cuenta en un plazo de 24 a 48 horas hábiles.`);
      } else {
        const cancelledRequestsStr = localStorage.getItem('baw_cancelled_requests') || '[]';
        let cancelledRequests = [];
        try {
          cancelledRequests = JSON.parse(cancelledRequestsStr);
        } catch (err) {
          cancelledRequests = [];
        }
        cancelledRequests.push({
          id: refundOrderId.trim().toUpperCase(),
          email: refundEmail.trim(),
          reason: refundReason,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('baw_cancelled_requests', JSON.stringify(cancelledRequests));
        setRefundMessage(`No encontramos la orden ${refundOrderId.trim().toUpperCase()} registrada en este dispositivo localmente, pero hemos recibido tu solicitud de arrepentimiento con éxito. Nuestro soporte técnico revisará la transacción de Mercado Pago para el correo ${refundEmail.trim()} y se pondrá en contacto contigo en un plazo de 24 horas hábiles para coordinar el reembolso del 100% de tu dinero.`);
      }
      setRefundStatus('success');
    }, 1500);
  };

  const handleGoBackToHome = () => {
    window.location.hash = '';
    setActiveView('main');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const [selectedOption, setSelectedOption] = useState<BundleOption>(BUNDLE_OPTIONS[1]);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [showSticky, setShowSticky] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  
  // Checkout form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const buyFormRef = useRef<HTMLDivElement>(null);

  // Transfer Receipt popup state
  const [showTransferReceiptPopup, setShowTransferReceiptPopup] = useState(false);

  // Validation touch states
  const [fullNameTouched, setFullNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [addressTouched, setAddressTouched] = useState(false);
  const [cityTouched, setCityTouched] = useState(false);
  const [postalCodeTouched, setPostalCodeTouched] = useState(false);

  // Validation functions
  const getFullNameError = () => {
    if (!fullName) return 'El nombre y apellido son obligatorios.';
    if (fullName.trim().length < 4) return 'El nombre debe tener al menos 4 caracteres.';
    if (!fullName.trim().includes(' ')) return 'Por favor ingrese nombre y apellido (ej. Juan Pérez).';
    return '';
  };

  const getPhoneError = () => {
    if (!phone) return 'El teléfono es obligatorio.';
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 8) return 'Ingrese un número válido (mínimo 8 dígitos).';
    return '';
  };

  const getAddressError = () => {
    if (!address) return 'La dirección de envío es obligatoria.';
    if (address.trim().length < 5) return 'La dirección debe tener al menos 5 caracteres.';
    return '';
  };

  const getCityError = () => {
    if (!city) return 'La ciudad o provincia es obligatoria.';
    if (city.trim().length < 3) return 'Debe tener al menos 3 caracteres.';
    return '';
  };

  const getPostalCodeError = () => {
    if (!postalCode) return 'El código postal es obligatorio.';
    if (postalCode.trim().length < 4) return 'Debe tener al menos 4 caracteres.';
    return '';
  };

  // Monitor scroll to show sticky buy bar
  useEffect(() => {
    const handleScroll = () => {
      if (!buyFormRef.current) return;
      const rect = buyFormRef.current.getBoundingClientRect();
      // Show when the select bundle section has scrolled completely out of top viewport
      setShowSticky(rect.bottom < 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToForm = () => {
    if (buyFormRef.current) {
      buyFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleOpenCheckout = (e: FormEvent) => {
    e.preventDefault();
    setCheckoutOpen(true);
  };

  const handleConfirmOrder = (e: FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched for instant validation feedback
    setFullNameTouched(true);
    setPhoneTouched(true);
    setAddressTouched(true);
    setCityTouched(true);
    setPostalCodeTouched(true);

    // If there is any validation error, stop execution
    if (getFullNameError() || getPhoneError() || getAddressError() || getCityError() || getPostalCodeError()) {
      return;
    }

    // Double check stock validation limit
    if (selectedOption.quantity * orderQuantity > 9) {
      alert('Sin stock suficiente para esta cantidad (Máximo 9 unidades).');
      return;
    }

    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    setCurrentOrderId(orderId);

    const saveOrderAction = () => {
      const newOrder = {
        id: orderId,
        fullName,
        phone,
        address,
        city,
        postalCode,
        paymentMethod,
        bundleId: selectedOption.id,
        bundleLabel: selectedOption.label === '1 ud.' ? `${orderQuantity}x Unidad Individual` : selectedOption.label === '2 uds.' ? `${orderQuantity}x Combo 2 Unidades` : `${orderQuantity}x Combo 3 Unidades (Máximo Ahorro)`,
        quantity: selectedOption.quantity * orderQuantity,
        totalPrice: selectedOption.totalPrice * orderQuantity,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const existingOrdersStr = localStorage.getItem('baw_orders');
      let existingOrders = [];
      if (existingOrdersStr) {
        try {
          existingOrders = JSON.parse(existingOrdersStr);
        } catch (err) {
          existingOrders = [];
        }
      }
      const updatedOrders = [newOrder, ...existingOrders];
      localStorage.setItem('baw_orders', JSON.stringify(updatedOrders));
      setOrderCompleted(true);
      setIsProcessingPayment(false);
      
      if (paymentMethod === 'transfer') {
        setShowTransferReceiptPopup(true);
      }
    };

    if (paymentMethod === 'card') {
      setIsProcessingPayment(true);
      // Simulate Mercado Pago / Credit Card authorization
      setTimeout(() => {
        saveOrderAction();
      }, 1500);
    } else {
      saveOrderAction();
    }
  };

  const resetCheckout = () => {
    setCheckoutOpen(false);
    setOrderCompleted(false);
    setOrderQuantity(1);
    setFullName('');
    setPhone('');
    setAddress('');
    setCity('');
    setPostalCode('');
    setCurrentOrderId('');
    setIsProcessingPayment(false);
    setShowTransferReceiptPopup(false);
    setFullNameTouched(false);
    setPhoneTouched(false);
    setAddressTouched(false);
    setCityTouched(false);
    setPostalCodeTouched(false);
  };

  return (
    <div className="min-h-screen bg-[#030303] flex justify-center text-neutral-200 font-sans selection:bg-red-900/30 selection:text-red-200">
      {/* Mobile-centric Frame container */}
      <div className="w-full max-w-[480px] bg-[#080808] min-h-screen flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.8)] border-x border-neutral-900/80 relative">
        
        {/* Dynamic RED Timer countdown */}
        <TimerBar />

        {/* Shimmering Announcement Bar (Marquee) */}
        <AnnouncementBar />

        {activeView === 'main' && (
          <>
            {/* Hero Section */}
            <header className="flex flex-col pt-4 pb-6 px-4">
          
          {/* Brand Identity Header */}
          <div 
            className="flex items-center gap-2 mb-3 cursor-pointer select-none"
            onDoubleClick={() => setAdminOpen(true)}
            title="Doble clic para administración"
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md select-none">
              <span className="font-extrabold text-black text-xs tracking-tight">W</span>
            </div>
            <span className="font-bold text-lg tracking-wider text-neutral-100 uppercase font-sans">
              BAW
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-black leading-tight tracking-tight text-white font-sans mb-1.5">
            Extintor automático para tableros eléctricos
          </h1>

          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-4 select-none">
            <span className="text-red-500 text-sm">★★★★★</span>
            <span className="font-semibold text-neutral-200">4.9</span>
            <span>·</span>
            <span className="bg-neutral-900/80 text-neutral-300 border border-neutral-800/80 px-2 py-0.5 rounded-full font-medium">
              +500 instalaciones
            </span>
          </div>

          {/* Square Image Carousel with dynamic shadow */}
          <ProductCarousel />

          {/* Price Banner Card */}
          <div className="bg-[#121212] border border-neutral-850 rounded-2xl p-4 my-5 shadow-inner">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs uppercase font-extrabold text-neutral-500 tracking-widest">
                Precio por unidad
              </span>
              <span className="bg-red-950/40 text-red-500 border border-red-900/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Envío incluido
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-white font-mono">
                $89.900
              </span>
            </div>
          </div>

          {/* Unique selling benefits checklist */}
          <ul className="flex flex-col gap-2.5 mb-6 text-sm text-neutral-300">
            <li className="flex gap-2 items-start">
              <span className="text-red-500 font-bold select-none mt-0.5 text-base">✓</span>
              <span>Se activa solo al detectar calor — sin electricidad ni baterías</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-500 font-bold select-none mt-0.5 text-base">✓</span>
              <span>Se monta en riel DIN, junto a tus disyuntores</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-500 font-bold select-none mt-0.5 text-base">✓</span>
              <span>Protección continua 24/7, incluso cuando no estás</span>
            </li>
          </ul>

          {/* Bundle Selector + Checkout submit */}
          <div ref={buyFormRef} className="bg-neutral-900/30 border border-neutral-850 rounded-2xl p-4 shadow-sm">
            <form onSubmit={handleOpenCheckout}>
              <BundleSelector
                options={BUNDLE_OPTIONS}
                selectedId={selectedOption.id}
                onSelect={setSelectedOption}
              />

              {/* Pack multiplier selector */}
              <div className="mt-4 pt-4 border-t border-neutral-800/40 flex items-center justify-between select-none">
                <span className="text-xs font-bold text-neutral-300">Cantidad de packs:</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderQuantity(prev => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 active:scale-95 border border-neutral-800 flex items-center justify-center font-extrabold text-white transition-all cursor-pointer select-none"
                  >
                    −
                  </button>
                  <span className="font-mono text-sm font-black text-white w-6 text-center select-none">
                    {orderQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOrderQuantity(prev => prev + 1)}
                    className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 active:scale-95 border border-neutral-800 flex items-center justify-center font-extrabold text-white transition-all cursor-pointer select-none"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Units & Simulated Stock Info */}
              <div className="mt-3 pt-3 border-t border-dashed border-neutral-850 flex items-center justify-between select-none">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-neutral-500">
                  Total de unidades:
                </span>
                <span className={`font-black text-xs font-sans ${(selectedOption.quantity * orderQuantity) > 9 ? 'text-red-500' : 'text-neutral-200'}`}>
                  {selectedOption.quantity * orderQuantity} {(selectedOption.quantity * orderQuantity) === 1 ? 'unidad' : 'unidades'}
                </span>
              </div>

              {/* Out of Stock Error message */}
              {(selectedOption.quantity * orderQuantity) > 9 && (
                <div className="mt-3.5 bg-red-950/40 border border-red-600/40 text-red-500 rounded-xl p-3 text-center text-[11px] font-sans font-bold leading-normal animate-pulse select-none">
                  ⚠️ ¡Sin stock disponible para esta cantidad!<br/>
                  <span className="text-[9px] text-neutral-400 font-medium">Por favor, reducí las unidades (Máximo 9 unidades por cliente).</span>
                </div>
              )}

              <button
                type="submit"
                disabled={(selectedOption.quantity * orderQuantity) > 9}
                className={`w-full mt-4 font-black text-base uppercase tracking-wider py-3.5 px-6 rounded-full transition-all flex items-center justify-center gap-2 ${
                  (selectedOption.quantity * orderQuantity) > 9
                    ? 'bg-neutral-900 text-neutral-500 border border-neutral-850 cursor-not-allowed select-none'
                    : 'bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-[0_6px_20px_rgba(255,49,49,0.35)] animate-pulse-slow cursor-pointer'
                }`}
              >
                {(selectedOption.quantity * orderQuantity) > 9 ? 'Sin stock disponible' : 'Comprar ahora'}
              </button>
            </form>
            <p className="text-center text-[10px] md:text-xs text-neutral-500 mt-3 select-none">
              Envío gratis · Transacción segura
            </p>
          </div>

          {/* Shoppable Video Carousel */}
          <ShoppableVideoCarousel />

        </header>

        {/* "Cómo funciona" - Immersive Dark Section */}
        <section className="bg-neutral-950 py-10 px-5 border-t border-b border-neutral-900">
          <span className="text-[10px] font-bold tracking-widest uppercase text-red-500 block mb-1">
            CÓMO FUNCIONA
          </span>
          <h2 className="text-lg md:text-xl font-extrabold tracking-tight mb-5 leading-tight text-white">
            Un tablero eléctrico puede incendiarse cuando nadie está mirando.
          </h2>

          <div className="rounded-xl overflow-hidden shadow-lg border border-neutral-800 bg-neutral-900 p-2 mb-6">
            <img 
              src={lifestyleImg} 
              alt="Instalación en tablero eléctrico" 
              className="w-full rounded-lg aspect-square object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <ol className="flex flex-col gap-6">
            <li className="flex gap-4 items-start">
              <span className="w-7 h-7 bg-red-600 text-white font-bold rounded-full flex items-center justify-center flex-shrink-0 text-xs shadow-md">
                1
              </span>
              <div>
                <h3 className="font-bold text-sm text-white mb-0.5">Instalás en el tablero</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Encajá el módulo directamente en el riel DIN. Los tubos térmicos apuntan al interior crítico.
                </p>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <span className="w-7 h-7 bg-red-600 text-white font-bold rounded-full flex items-center justify-center flex-shrink-0 text-xs shadow-md">
                2
              </span>
              <div>
                <h3 className="font-bold text-sm text-white mb-0.5">Detecta el calor</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Los sensores mecánicos internos reaccionan al calor extremo en segundos de manera autónoma.
                </p>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <span className="w-7 h-7 bg-red-600 text-white font-bold rounded-full flex items-center justify-center flex-shrink-0 text-xs shadow-md">
                3
              </span>
              <div>
                <h3 className="font-bold text-sm text-white mb-0.5">Extingue automáticamente</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Libera el potente agente extintor directo sobre el foco del fuego, previniendo tragedias.
                </p>
              </div>
            </li>
          </ol>

          <div className="flex gap-2 flex-wrap mt-6 pt-4 border-t border-neutral-850 select-none">
            <span className="bg-neutral-900 text-neutral-300 text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase">
              Hogar
            </span>
            <span className="bg-neutral-900 text-neutral-300 text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase">
              Comercio
            </span>
            <span className="bg-neutral-900 text-neutral-300 text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase">
              Industria
            </span>
          </div>
        </section>

        {/* SECTION: EL PROBLEMA */}
        <section id="problema-section" className="bg-neutral-950 py-10 px-5 border-b border-neutral-900 select-none">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 bg-red-950/60 text-red-500 rounded border border-red-900/30">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-red-500">
              EL RIESGO REAL
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-extrabold tracking-tight mb-4 text-white leading-tight">
            Los incendios eléctricos ocurren cuando no hay nadie mirando.
          </h2>
          <p className="text-xs md:text-sm text-neutral-400 mb-6 leading-relaxed">
            Un cortocircuito puede generar fuego dentro de un gabinete cerrado en milisegundos. Sin una respuesta instantánea, las consecuencias son irreparables.
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-[#121212] border border-neutral-850 p-4 rounded-xl flex gap-3.5 items-start">
              <div className="p-2 bg-red-950/40 text-red-500 rounded-lg border border-red-900/20 mt-0.5">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-neutral-100 mb-1 font-sans">
                  80% Ocurre fuera de horario
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Las sobrecargas y fallas suelen ocurrir de noche, fines de semana o feriados. Cuando el lugar está vacío, nadie puede activar un extintor manual.
                </p>
              </div>
            </div>

            <div className="bg-[#121212] border border-neutral-850 p-4 rounded-xl flex gap-3.5 items-start">
              <div className="p-2 bg-red-950/40 text-red-500 rounded-lg border border-red-900/20 mt-0.5">
                <Flame className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-neutral-100 mb-1 font-sans">
                  Menos de 60 segundos
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  El fuego eléctrico se propaga rápidamente por el plástico de los cables y térmicas. El tiempo de reacción promedio de los bomberos es de 12 minutos.
                </p>
              </div>
            </div>

            <div className="bg-[#121212] border border-neutral-850 p-4 rounded-xl flex gap-3.5 items-start">
              <div className="p-2 bg-red-950/40 text-red-500 rounded-lg border border-red-900/20 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-neutral-100 mb-1 font-sans">
                  Extintores tradicionales inútiles
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Están colgados en la pared, lejos del fuego interno. Además, requieren presencia humana, quitar el seguro y arriesgar la vida para usarlos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: ANTES Y DESPUES (BEFORE & AFTER) */}
        <section id="comparativa-visual-section" className="bg-neutral-900/15 py-10 px-5 border-b border-neutral-900 select-none">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 bg-red-950/60 text-red-500 rounded border border-red-900/30">
              <Sparkles className="w-4 h-4 text-red-500" />
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-red-500">
              ANTES Y DESPUÉS
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-extrabold tracking-tight mb-6 text-white leading-tight">
            Dos destinos para un mismo cortocircuito.
          </h2>

          <div className="flex flex-col gap-6">
            {/* SIN PROTECCIÓN (SIN BAW) */}
            <div className="relative border border-red-950 bg-red-950/10 rounded-2xl p-5 overflow-hidden shadow-[inset_0_0_15px_rgba(239,68,68,0.05)]">
              <div className="absolute top-0 right-0 bg-red-950/60 border-b border-l border-red-900/30 text-red-400 text-[8px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-bl-xl">
                SIN EXTINTOR BAW
              </div>
              <div className="flex items-center gap-2 mb-3">
                <X className="w-4 h-4 text-red-500 stroke-[3]" />
                <span className="font-bold text-xs text-red-500 uppercase tracking-wider font-sans">Tablero Vulnerable</span>
              </div>
              <ul className="flex flex-col gap-2.5 text-xs text-neutral-400 leading-relaxed">
                <li className="flex gap-2 items-start font-sans">
                  <span className="text-red-500 font-extrabold select-none">•</span>
                  <span><strong>Destrucción Total:</strong> El fuego consume todo el cableado, llaves térmicas y el propio gabinete.</span>
                </li>
                <li className="flex gap-2 items-start font-sans">
                  <span className="text-red-500 font-extrabold select-none">•</span>
                  <span><strong>Riesgo Estructural:</strong> El fuego se extiende a la propiedad (oficina, hogar, depósito).</span>
                </li>
                <li className="flex gap-2 items-start font-sans">
                  <span className="text-red-500 font-extrabold select-none">•</span>
                  <span><strong>Semanas sin Luz:</strong> Reconstruir la instalación eléctrica toma días y paraliza el negocio.</span>
                </li>
                <li className="flex gap-2 items-start font-sans">
                  <span className="text-red-500 font-extrabold select-none">•</span>
                  <span><strong>Pérdidas millonarias:</strong> Costos elevados de reparación, compra de nuevos materiales y lucro cesante.</span>
                </li>
              </ul>
            </div>

            {/* CON PROTECCIÓN (CON BAW) */}
            <div className="relative border border-green-950 bg-green-950/10 rounded-2xl p-5 overflow-hidden shadow-[inset_0_0_15px_rgba(34,197,94,0.05)]">
              <div className="absolute top-0 right-0 bg-green-950/60 border-b border-l border-green-900/30 text-green-400 text-[8px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-bl-xl animate-pulse">
                CON EXTINTOR BAW
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Check className="w-4 h-4 text-green-500 stroke-[3]" />
                <span className="font-bold text-xs text-green-400 uppercase tracking-wider font-sans">Protección Total</span>
              </div>
              <ul className="flex flex-col gap-2.5 text-xs text-neutral-400 leading-relaxed">
                <li className="flex gap-2 items-start font-sans">
                  <span className="text-green-500 font-extrabold select-none">•</span>
                  <span><strong>Sofocación en 10s:</strong> El agente extintor encapsula el oxígeno y ahoga el fuego al instante.</span>
                </li>
                <li className="flex gap-2 items-start font-sans">
                  <span className="text-green-500 font-extrabold select-none">•</span>
                  <span><strong>Cero Daño Colateral:</strong> Usa un gas limpio dieléctrico que no daña ni sulfata las térmicas sanas.</span>
                </li>
                <li className="flex gap-2 items-start font-sans">
                  <span className="text-green-500 font-extrabold select-none">•</span>
                  <span><strong>Continuidad de Operación:</strong> Solo reemplazás la térmica defectuosa y el servicio vuelve de inmediato.</span>
                </li>
                <li className="flex gap-2 items-start font-sans">
                  <span className="text-green-500 font-extrabold select-none">•</span>
                  <span><strong>Costo Mínimo:</strong> Evitás tragedias mayores con un producto autónomo de bajísimo costo.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION: TABLA COMPARATIVA */}
        <section id="tabla-comparativa-section" className="bg-neutral-950 py-10 px-5 border-b border-neutral-900 select-none">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 bg-red-950/60 text-red-500 rounded border border-red-900/30">
              <ThumbsUp className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-red-500">
              COMPARACIÓN
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-extrabold tracking-tight mb-5 text-white leading-tight">
            ¿Por qué elegir el Extintor Riel DIN de BAW?
          </h2>

          <div className="w-full">
            <div className="w-full border border-neutral-850 rounded-2xl overflow-hidden bg-[#0c0c0c]">
              <table className="w-full text-left border-collapse text-[11px] md:text-xs">
                <thead>
                  <tr className="bg-[#121212] border-b border-neutral-850 text-[9px] font-extrabold text-neutral-400 uppercase tracking-wider">
                    <th className="py-3 px-3 font-bold text-neutral-300 w-[50%]">Característica</th>
                    <th className="py-3 px-1.5 font-bold text-red-500 text-center bg-red-950/15 w-[25%]">Extintor BAW</th>
                    <th className="py-3 px-1.5 font-bold text-neutral-400 text-center w-[25%]">Manual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900/80 font-sans text-[11px] md:text-xs">
                  <tr className="hover:bg-neutral-900/10">
                    <td className="py-2.5 px-3 font-medium text-neutral-200">Activación Autónoma</td>
                    <td className="py-2.5 px-1.5 text-center bg-red-950/10">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-950/40 text-green-500 border border-green-900/30 font-bold text-[10px]">✓</span>
                    </td>
                    <td className="py-2.5 px-1.5 text-center text-neutral-500">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-950/20 text-red-500/60 border border-red-950 font-bold text-[10px]">✗</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-900/10">
                    <td className="py-2.5 px-3 font-medium text-neutral-200">Funciona sin personas</td>
                    <td className="py-2.5 px-1.5 text-center bg-red-950/10">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-950/40 text-green-500 border border-green-900/30 font-bold text-[10px]">✓</span>
                    </td>
                    <td className="py-2.5 px-1.5 text-center text-neutral-500">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-950/20 text-red-500/60 border border-red-950 font-bold text-[10px]">✗</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-900/10">
                    <td className="py-2.5 px-3 font-medium text-neutral-200">Montaje en Riel DIN</td>
                    <td className="py-2.5 px-1.5 text-center bg-red-950/10">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-950/40 text-green-500 border border-green-900/30 font-bold text-[10px]">✓</span>
                    </td>
                    <td className="py-2.5 px-1.5 text-center text-neutral-500">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-950/20 text-red-500/60 border border-red-950 font-bold text-[10px]">✗</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-900/10">
                    <td className="py-2.5 px-3 font-medium text-neutral-200">Gas limpio dieléctrico</td>
                    <td className="py-2.5 px-1.5 text-center bg-red-950/10">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-950/40 text-green-500 border border-green-900/30 font-bold text-[10px]">✓</span>
                    </td>
                    <td className="py-2.5 px-1.5 text-center text-neutral-400">
                      <span className="text-[8px] md:text-[9px] text-red-500 bg-red-950/20 border border-red-950 px-1 py-0.5 rounded font-extrabold uppercase">Polvo</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-900/10">
                    <td className="py-2.5 px-3 font-medium text-neutral-200">Mantenimiento anual</td>
                    <td className="py-2.5 px-1.5 text-center bg-red-950/10">
                      <span className="text-[9px] text-green-400 font-extrabold uppercase">Cero</span>
                    </td>
                    <td className="py-2.5 px-1.5 text-center text-neutral-400">
                      <span className="text-[9px] text-red-500 font-semibold">Oblig.</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION: PRUEBA SOCIAL */}
        <section id="prueba-social-section" className="bg-neutral-900/15 py-10 px-5 border-b border-neutral-900 select-none">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-red-950/60 text-red-500 rounded border border-red-900/30">
                <Star className="w-4 h-4 fill-red-500 text-red-500" />
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-red-500">
                PRUEBA SOCIAL
              </span>
            </div>
            <span className="text-[9px] text-neutral-500 font-mono animate-pulse">
              Deslizar ➔
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-extrabold tracking-tight mb-6 text-white leading-tight">
            Clientes y Profesionales que ya confían en BAW
          </h2>

          {/* Horizontal snap carousel */}
          <div className="flex gap-4 overflow-x-auto pb-5 pt-1 snap-x snap-mandatory no-scrollbar -mx-5 px-5">
            
            {/* Testimonio 1 */}
            <div className="flex-shrink-0 w-[290px] snap-center bg-[#0c0c0c] border border-neutral-850 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="relative h-32 w-full overflow-hidden rounded-xl mb-3.5 border border-neutral-800 bg-neutral-950">
                  <img 
                    src={heroImg} 
                    alt="Instalación de Carlos M." 
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-[8px] font-bold uppercase text-neutral-300 tracking-wider">
                    Foto del Cliente
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-red-950/30 border border-red-900/20 flex items-center justify-center font-bold text-xs text-red-400 font-sans">
                      CM
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-neutral-200 block font-sans">Carlos M.</span>
                      <span className="text-[9px] text-neutral-500 block font-sans">Electricista Matriculado · CABA</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-red-500">
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed italic font-sans">
                  "Excelente invento. Lo instalé en el consorcio de un edificio viejo donde los cables y las conexiones ya están muy fatigadas. Te da una tranquilidad mental que no tiene precio."
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-[8px] text-green-400 font-bold uppercase tracking-wider font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Compra Verificada · Instalación Exitosa
              </div>
            </div>

            {/* Testimonio 2 */}
            <div className="flex-shrink-0 w-[290px] snap-center bg-[#0c0c0c] border border-neutral-850 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="relative h-32 w-full overflow-hidden rounded-xl mb-3.5 border border-neutral-800 bg-neutral-950">
                  <img 
                    src={lifestyleImg} 
                    alt="Gabinete comercial" 
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-[8px] font-bold uppercase text-neutral-300 tracking-wider">
                    Foto del Cliente
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-red-950/30 border border-red-900/20 flex items-center justify-center font-bold text-xs text-red-400 font-sans">
                      EG
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-neutral-200 block font-sans">Estela G.</span>
                      <span className="text-[9px] text-neutral-500 block font-sans">Dueña de Comercio · Rosario</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-red-500">
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed italic font-sans">
                  "Tuvimos un principio de incendio por un aire acondicionado comercial que recalentó la térmica de noche. El extintor BAW se activó automáticamente y lo apagó al instante. Evitó una catástrofe."
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-[8px] text-green-400 font-bold uppercase tracking-wider font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Compra Verificada · Salvó el Local
              </div>
            </div>

            {/* Testimonio 3 */}
            <div className="flex-shrink-0 w-[290px] snap-center bg-[#0c0c0c] border border-neutral-850 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="relative h-32 w-full overflow-hidden rounded-xl mb-3.5 border border-neutral-800 bg-neutral-950">
                  <img 
                    src={heroImg} 
                    alt="Riel DIN de Alejandro V." 
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-[8px] font-bold uppercase text-neutral-300 tracking-wider">
                    Foto del Cliente
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-red-950/30 border border-red-900/20 flex items-center justify-center font-bold text-xs text-red-400 font-sans">
                      AV
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-neutral-200 block font-sans">Alejandro V.</span>
                      <span className="text-[9px] text-neutral-500 block font-sans">Taller Metalúrgico · Córdoba</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-red-500">
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed italic font-sans">
                  "Es sumamente fácil de encajar en el riel DIN al lado de las térmicas principales. Cumple con normas vigentes y es de excelente calidad. Compré el combo de 3 para mi hogar y el taller."
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-[8px] text-green-400 font-bold uppercase tracking-wider font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Compra Verificada · Cliente Frecuente
              </div>
            </div>

            {/* Testimonio 4 */}
            <div className="flex-shrink-0 w-[290px] snap-center bg-[#0c0c0c] border border-neutral-850 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="relative h-32 w-full overflow-hidden rounded-xl mb-3.5 border border-neutral-800 bg-neutral-950">
                  <img 
                    src={lifestyleImg} 
                    alt="Tablero de Consorcio" 
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-[8px] font-bold uppercase text-neutral-300 tracking-wider">
                    Foto del Cliente
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-red-950/30 border border-red-900/20 flex items-center justify-center font-bold text-xs text-red-400 font-sans">
                      SR
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-neutral-200 block font-sans">Sofía R.</span>
                      <span className="text-[9px] text-neutral-500 block font-sans">Adm. de Consorcio · Belgrano</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-red-500">
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed italic font-sans">
                  "Lo colocamos en los tableros generales de los 3 sectores del edificio. El seguro de incendios nos hizo un descuento en la póliza al ver que contábamos con esta tecnología instalada."
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-[8px] text-green-400 font-bold uppercase tracking-wider font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Compra Verificada · Consorcio Seguro
              </div>
            </div>

            {/* Testimonio 5 */}
            <div className="flex-shrink-0 w-[290px] snap-center bg-[#0c0c0c] border border-neutral-850 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="relative h-32 w-full overflow-hidden rounded-xl mb-3.5 border border-neutral-800 bg-neutral-950">
                  <img 
                    src={heroImg} 
                    alt="Tablero de Jorge B." 
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-[8px] font-bold uppercase text-neutral-300 tracking-wider">
                    Foto del Cliente
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-red-950/30 border border-red-900/20 flex items-center justify-center font-bold text-xs text-red-400 font-sans">
                      JB
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-neutral-200 block font-sans">Jorge B.</span>
                      <span className="text-[9px] text-neutral-500 block font-sans">Ingeniero Industrial · Mendoza</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-red-500">
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed italic font-sans">
                  "Soy muy exigente con la seguridad industrial. Este extintor BAW de riel DIN cumple con creces. El gas dieléctrico no deja residuos químicos ni daña los equipos circundantes."
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-[8px] text-green-400 font-bold uppercase tracking-wider font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Compra Verificada · Calidad Industrial
              </div>
            </div>

            {/* Testimonio 6 */}
            <div className="flex-shrink-0 w-[290px] snap-center bg-[#0c0c0c] border border-neutral-850 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="relative h-32 w-full overflow-hidden rounded-xl mb-3.5 border border-neutral-800 bg-neutral-950">
                  <img 
                    src={lifestyleImg} 
                    alt="Hogar Familiar" 
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-[8px] font-bold uppercase text-neutral-300 tracking-wider">
                    Foto del Cliente
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-red-950/30 border border-red-900/20 flex items-center justify-center font-bold text-xs text-red-400 font-sans">
                      NF
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-neutral-200 block font-sans">Natalia F.</span>
                      <span className="text-[9px] text-neutral-500 block font-sans">Hogar Familiar · Nordelta</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-red-500">
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed italic font-sans">
                  "Tengo tres chicos chicos y siempre me dio pánico un problema eléctrico mientras dormimos. Puse uno en el tablero de casa y ahora duermo muchísimo más tranquila."
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-[8px] text-green-400 font-bold uppercase tracking-wider font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Compra Verificada · Tranquilidad Total
              </div>
            </div>

            {/* Testimonio 7 */}
            <div className="flex-shrink-0 w-[290px] snap-center bg-[#0c0c0c] border border-neutral-850 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="relative h-32 w-full overflow-hidden rounded-xl mb-3.5 border border-neutral-800 bg-neutral-950">
                  <img 
                    src={heroImg} 
                    alt="Rack de Servidores" 
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-[8px] font-bold uppercase text-neutral-300 tracking-wider">
                    Foto del Cliente
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-red-950/30 border border-red-900/20 flex items-center justify-center font-bold text-xs text-red-400 font-sans">
                      DS
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-neutral-200 block font-sans">Diego S.</span>
                      <span className="text-[9px] text-neutral-500 block font-sans">Encargado de IT · Data Center</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-red-500">
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed italic font-sans">
                  "Protegemos los racks de servidores críticos. Si hay una falla en la fuente o en el cableado, el extintor de riel DIN actúa localizado sin arruinar el resto del hardware con polvo."
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-[8px] text-green-400 font-bold uppercase tracking-wider font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Compra Verificada · Servidor Protegido
              </div>
            </div>

            {/* Testimonio 8 */}
            <div className="flex-shrink-0 w-[290px] snap-center bg-[#0c0c0c] border border-neutral-850 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="relative h-32 w-full overflow-hidden rounded-xl mb-3.5 border border-neutral-800 bg-neutral-950">
                  <img 
                    src={lifestyleImg} 
                    alt="Instalación en Cocina" 
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-[8px] font-bold uppercase text-neutral-300 tracking-wider">
                    Foto del Cliente
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-red-950/30 border border-red-900/20 flex items-center justify-center font-bold text-xs text-red-400 font-sans">
                      MH
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-neutral-200 block font-sans">Martín H.</span>
                      <span className="text-[9px] text-neutral-500 block font-sans">Dueño de Panadería · San Isidro</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-red-500">
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed italic font-sans">
                  "En gastronomía los hornos y las heladeras consumen muchísimo y las térmicas viven calientes. Este extintor automático nos da la seguridad de que el negocio está protegido 24/7."
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-[8px] text-green-400 font-bold uppercase tracking-wider font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Compra Verificada · Gastronomía Segura
              </div>
            </div>

            {/* Testimonio 9 */}
            <div className="flex-shrink-0 w-[290px] snap-center bg-[#0c0c0c] border border-neutral-850 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="relative h-32 w-full overflow-hidden rounded-xl mb-3.5 border border-neutral-800 bg-neutral-950">
                  <img 
                    src={heroImg} 
                    alt="Gabinete de clínica" 
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-[8px] font-bold uppercase text-neutral-300 tracking-wider">
                    Foto del Cliente
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-red-950/30 border border-red-900/20 flex items-center justify-center font-bold text-xs text-red-400 font-sans">
                      CP
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-neutral-200 block font-sans">Claudia P.</span>
                      <span className="text-[9px] text-neutral-500 block font-sans">Clínica Médica · La Plata</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-red-500">
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed italic font-sans">
                  "Excelente terminación y robustez. Lo instalamos en el tablero principal de los quirófanos y salas de terapia intensiva para asegurar máxima protección contra cualquier imprevisto."
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-[8px] text-green-400 font-bold uppercase tracking-wider font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Compra Verificada · Clínica Protegida
              </div>
            </div>

            {/* Testimonio 10 */}
            <div className="flex-shrink-0 w-[290px] snap-center bg-[#0c0c0c] border border-neutral-850 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="relative h-32 w-full overflow-hidden rounded-xl mb-3.5 border border-neutral-800 bg-neutral-950">
                  <img 
                    src={lifestyleImg} 
                    alt="Depósito de Lucas" 
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-[8px] font-bold uppercase text-neutral-300 tracking-wider">
                    Foto del Cliente
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-red-950/30 border border-red-900/20 flex items-center justify-center font-bold text-xs text-red-400 font-sans">
                      LT
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-neutral-200 block font-sans">Lucas T.</span>
                      <span className="text-[9px] text-neutral-500 block font-sans">Jefe de Logística · Lanús</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-red-500">
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                    <Star className="w-3 h-3 fill-red-500" />
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed italic font-sans">
                  "Compramos para todo el depósito y oficinas administrativas. El montaje fue ultra rápido, lo hizo nuestro electricista en 5 minutos por tablero. Muy conforme con la compra."
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-[8px] text-green-400 font-bold uppercase tracking-wider font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Compra Verificada · Calidad Certificada
              </div>
            </div>

          </div>
        </section>

        {/* "Por qué BAW" Section with FAQ Accordions */}
        <section className="py-10 px-5 bg-[#080808]">
          <span className="text-[10px] font-bold tracking-widest uppercase text-red-500 block mb-1">
            POR QUÉ BAW
          </span>
          <h2 className="text-lg md:text-xl font-extrabold tracking-tight mb-6 leading-tight text-white">
            Diseñado para lo que un extintor común no alcanza.
          </h2>

          <div className="rounded-xl overflow-hidden shadow-md border border-neutral-850 bg-neutral-900/60 p-2 mb-6">
            <img 
              src={heroImg} 
              alt="Detalle del Extintor BAW" 
              className="w-full rounded-lg aspect-square object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <FaqAccordion items={FAQ_ITEMS} />
        </section>

        {/* Closing / Conversational Footer Banner */}
        <section className="bg-neutral-900/20 text-center py-12 px-5 border-t border-neutral-900 flex flex-col items-center">
          <div className="rounded-xl overflow-hidden shadow-md max-w-[320px] mb-6 p-1 bg-neutral-950 border border-neutral-850">
            <img 
              src={lifestyleImg} 
              alt="Seguridad para siempre" 
              className="w-full rounded-lg aspect-video object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-lg md:text-xl font-black tracking-tight mb-2 text-white">
            Protección automática 24/7
          </h2>
          <p className="text-xs md:text-sm text-neutral-400 max-w-[340px] leading-relaxed mb-6">
            Tu tablero eléctrico trabaja todos los días del año sin descanso. Ahora también puede estar protegido en todo momento.
          </p>
          <button
            onClick={handleScrollToForm}
            className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-xs md:text-sm uppercase tracking-wider px-6 py-3 rounded-full shadow-[0_4px_15px_rgba(255,49,49,0.3)] transition-all cursor-pointer"
          >
            Proteger mi tablero
          </button>
        </section>

        {/* Main Footer */}
        <footer className="relative overflow-hidden bg-neutral-950 text-neutral-400 py-10 px-5 border-t border-neutral-900 flex flex-col select-none pb-[140px] font-sans">
          {/* Animated fire background */}
          <FireFooterBackground />

          <div className="relative z-10 w-full space-y-8 text-left">
            {/* Brand identity logo */}
            <div className="flex flex-col items-center text-center gap-1 border-b border-neutral-900 pb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-lg">
                  <span className="font-black text-neutral-950 text-[10px]">W</span>
                </div>
                <span className="font-extrabold text-sm tracking-widest text-white uppercase">
                  BAW Tienda Oficial
                </span>
              </div>
              <p className="text-[9px] tracking-wider uppercase text-neutral-500 font-mono">
                Extintores Térmicos Inteligentes · BAW-EXT1D-S1
              </p>
            </div>

            {/* Legal and Business Columns */}
            <div className="grid grid-cols-1 gap-6 text-xs text-neutral-400">
              {/* Columna de Datos Legales */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-white block">
                  Información Legal
                </span>
                <p className="leading-relaxed">
                  <strong>Titular:</strong> Rodrigo José Jorfen<br />
                  <strong>CUIT:</strong> 24-4574449-1<br />
                  <strong>Domicilio:</strong> La Pinta Nº 3353, San Miguel, Provincia de Buenos Aires, Argentina
                </p>
              </div>

              {/* Columna de Contacto */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-white block">
                  Soporte y Contacto
                </span>
                <p className="leading-relaxed">
                  <strong>Email:</strong> <a href="mailto:Josejorf48@gmail.com" className="text-red-500 hover:underline">Josejorf48@gmail.com</a><br />
                  <strong>WhatsApp:</strong> <a href="https://wa.me/5491136397582" target="_blank" rel="noreferrer" className="text-red-500 hover:underline">11 3639 7582</a>
                </p>
              </div>

              {/* Columna de Navegación */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-white block">
                  Navegación Comercial
                </span>
                <div className="flex flex-col gap-1.5">
                  <a href="#terminos-y-condiciones" className="hover:text-white hover:underline transition-colors block">
                    » Términos y Condiciones de Uso
                  </a>
                  <a href="#politica-de-privacidad" className="hover:text-white hover:underline transition-colors block">
                    » Política de Privacidad de Datos
                  </a>
                </div>
              </div>
            </div>

            {/* Botón de Arrepentimiento - Highlighted Law resolved element */}
            <div className="border-t border-neutral-900 pt-6 flex flex-col items-center text-center gap-2.5">
              <span className="text-[9px] text-neutral-500 font-medium">
                ¿Te arrepentiste de tu compra? De acuerdo a la ley de Defensa del Consumidor tenés 10 días para cancelarla.
              </span>
              <a
                href="#arrepentimiento"
                className="inline-block bg-transparent hover:bg-red-950/20 active:scale-95 text-red-500 border border-red-900/60 font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-lg transition-all cursor-pointer shadow-md"
              >
                Botón de Arrepentimiento
              </a>
            </div>

            {/* Copyright and Admin */}
            <div className="border-t border-neutral-900 pt-5 flex flex-col items-center text-center gap-2 text-[10px] text-neutral-600">
              <p>
                &copy; 2026 BAW. Todos los derechos reservados.<br />
                Prevención de fraude de Mercado Pago y Defensa del Consumidor Argentina.
              </p>
              {/* Out-of-the-way Admin Portal trigger link */}
              <button 
                onClick={() => setAdminOpen(true)}
                className="text-[9px] text-neutral-800 hover:text-neutral-500 mt-2 flex items-center gap-1 cursor-pointer transition-colors"
              >
                🛡️ Panel de Administración
              </button>
            </div>
          </div>
        </footer>
          </>
        )}

        {/* Sub-page view: Términos y Condiciones */}
        {activeView === 'terms' && (
          <div className="flex-1 flex flex-col p-6 bg-[#080808] text-neutral-300">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6 border-b border-neutral-900 pb-4">
              <button 
                onClick={handleGoBackToHome}
                className="flex items-center gap-1.5 text-xs text-red-500 font-extrabold tracking-wider uppercase bg-red-950/40 border border-red-900/40 px-3 py-1.5 rounded-full hover:bg-red-900/30 transition-colors cursor-pointer"
              >
                ← Inicio
              </button>
              <span className="text-xs text-neutral-500 font-mono">Términos y Condiciones</span>
            </div>
            {/* Content */}
            <article className="prose prose-invert prose-xs max-w-none space-y-5">
              <h1 className="text-xl font-black text-white tracking-tight border-b border-neutral-900 pb-2">Términos y Condiciones de Uso</h1>
              <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">
                Última actualización: Julio 2026
              </p>
              
              <section className="space-y-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider text-red-500">1. Identificación y Titularidad</h2>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  El sitio web y la tienda comercial de BAW son operados y de propiedad exclusiva del titular <strong>Rodrigo José Jorfen</strong>, CUIT <strong>24-4574449-1</strong>, con domicilio legal constituido en <strong>La Pinta Nº 3353, San Miguel, Provincia de Buenos Aires, República Argentina</strong>.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider text-red-500">2. Envíos y Entregas</h2>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Realizamos despachos a todo el territorio de la República Argentina utilizando los siguientes servicios logísticos homologados:
                </p>
                <ul className="list-disc list-inside text-xs text-neutral-300 space-y-1.5 pl-2">
                  <li><strong>Envíos locales/cercanos:</strong> Coordinados mediante servicio privado de Motomensajería directa puerta a puerta.</li>
                  <li><strong>Envíos nacionales/lejanos:</strong> Procesados y despachados de manera segura mediante <strong>Correo Argentino o Andreani</strong>.</li>
                </ul>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  El procesamiento interno del embalaje y facturación de la orden toma entre <strong>4 y 9 días hábiles</strong>. Una vez despachado, el tiempo estimado de entrega del correo es de <strong>4 a 6 días hábiles</strong>.
                </p>
                <div className="bg-neutral-950 border border-neutral-900 p-3 rounded-lg text-xs text-neutral-400">
                  <span className="text-white font-bold text-[10px] uppercase tracking-wider block mb-1 text-red-500">Información Importante de Reenvíos:</span>
                  El envío inicial a domicilio es 100% gratuito. No obstante, si el paquete es devuelto al remitente por un error del cliente al escribir su dirección de entrega o por no encontrarse en el domicilio tras las visitas del correo, el costo total del reenvío correrá por cuenta exclusiva del cliente.
                </div>
              </section>

              <section className="space-y-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider text-red-500">3. Derecho de Revocación (Botón de Arrepentimiento)</h2>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  De estricto acuerdo con la Ley de Defensa del Consumidor de la República Argentina, el usuario tiene derecho a revocar la aceptación de la compra dentro de los <strong>10 (diez) días corridos</strong> contados a partir de la fecha de entrega del producto. 
                </p>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Para ejercer este derecho, el cliente deberá hacer uso del <strong>"Botón de Arrepentimiento"</strong> visible en el footer de la tienda, completando el formulario obligatorio con su dirección de correo electrónico y número de orden. Tras la validación, se procederá a la devolución del <strong>100% del dinero abonado</strong> de forma segura a través de la pasarela de pagos principal <strong>Mercado Pago</strong>.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider text-red-500">4. Políticas de Cambios y Garantías</h2>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Transcurridos los 10 días de arrepentimiento legal, se aceptan exclusivamente solicitudes de cambios por fallas o defectos de fabricación dentro de los <strong>30 días corridos</strong> posteriores a la recepción del artículo.
                </p>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Para que el cambio sea procesado, es requisito indispensable que el producto se encuentre <strong>completamente sin uso, en idénticas condiciones en las que fue recibido y en su empaque original de fábrica</strong>.
                </p>
              </section>

              <section className="space-y-2 border-t border-neutral-900 pt-4 text-[10px] text-neutral-500 font-sans">
                Para consultas legales o técnicas avanzadas sobre nuestros productos, por favor escriba a <span className="text-neutral-400 font-mono">Josejorf48@gmail.com</span> o comuníquese a nuestra línea oficial de soporte <span className="text-neutral-400 font-mono">11 3639 7582</span>.
              </section>
            </article>
            <button 
              onClick={handleGoBackToHome}
              className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-full shadow-lg transition-all cursor-pointer text-center"
            >
              Volver a la tienda
            </button>
          </div>
        )}

        {/* Sub-page view: Política de Privacidad */}
        {activeView === 'privacy' && (
          <div className="flex-1 flex flex-col p-6 bg-[#080808] text-neutral-300">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6 border-b border-neutral-900 pb-4">
              <button 
                onClick={handleGoBackToHome}
                className="flex items-center gap-1.5 text-xs text-red-500 font-extrabold tracking-wider uppercase bg-red-950/40 border border-red-900/40 px-3 py-1.5 rounded-full hover:bg-red-900/30 transition-colors cursor-pointer"
              >
                ← Inicio
              </button>
              <span className="text-xs text-neutral-500 font-mono">Privacidad</span>
            </div>
            {/* Content */}
            <article className="prose prose-invert prose-xs max-w-none space-y-5">
              <h1 className="text-xl font-black text-white tracking-tight border-b border-neutral-900 pb-2">Política de Privacidad</h1>
              <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">
                Última actualización: Julio 2026
              </p>
              
              <section className="space-y-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider text-red-500">1. Protección de Datos (Ley 25.326)</h2>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  En cumplimiento de la <strong>Ley de Protección de Datos Personales Nº 25.326</strong> de la República Argentina, le informamos que todos los datos recolectados en esta tienda web (Nombre Completo, DNI, Dirección de envío, Correo Electrónico y Teléfono) son tratados con absoluta confidencialidad y medidas de seguridad técnicas.
                </p>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  La recolección de estos datos se realiza de manera voluntaria por parte del usuario con el único fin de emitir la facturación correspondiente de la compra y coordinar de manera precisa las entregas con nuestros operadores de logística autorizados: <strong>Correo Argentino, Andreani o Motomensajería</strong>.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider text-red-500">2. Derechos de Acceso, Rectificación y Supresión</h2>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Los usuarios tienen garantizado el derecho de acceso, actualización, rectificación o eliminación definitiva de sus datos personales de nuestras bases de datos en cualquier momento. 
                </p>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Para ejercer estos derechos de forma gratuita, simplemente debe enviar una solicitud formal por correo electrónico a la dirección de contacto oficial: <strong>Josejorf48@gmail.com</strong>, detallando su nombre y el requerimiento de modificación o baja de datos.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider text-red-500">3. Procesamiento Seguro de Pagos</h2>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Para resguardar la seguridad financiera de nuestros clientes, los pagos dentro de la tienda son procesados de forma externa y segura a través de la plataforma líder <strong>Mercado Pago</strong>. 
                </p>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Esta pasarela de pagos cuenta con la tecnología de cifrado SSL (Secure Sockets Layer) y cumple de manera estricta con los estándares internacionales de seguridad <strong>PCI-DSS (Payment Card Industry Data Security Standard)</strong>. 
                </p>
                <div className="bg-[#1a0f0f] border border-red-900/30 p-3 rounded-lg text-xs text-neutral-300">
                  <span className="text-red-500 font-extrabold text-[10px] uppercase tracking-wider block mb-1">Garantía de Seguridad Bancaria:</span>
                  Nuestra tienda <strong>jamás almacena, visualiza ni registra</strong> los datos de sus tarjetas de crédito o débito. Toda la transacción financiera se efectúa de manera segura dentro de la infraestructura cifrada de Mercado Pago.
                </div>
              </section>

              <section className="space-y-2 border-t border-neutral-900 pt-4 text-[10px] text-neutral-500 font-sans">
                Titular responsable del tratamiento: Rodrigo José Jorfen (CUIT 24-4574449-1), Domicilio en La Pinta Nº 3353, San Miguel, Provincia de Buenos Aires, Argentina.
              </section>
            </article>
            <button 
              onClick={handleGoBackToHome}
              className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-full shadow-lg transition-all cursor-pointer text-center"
            >
              Volver a la tienda
            </button>
          </div>
        )}

        {/* Sub-page view: Botón de Arrepentimiento Form */}
        {activeView === 'refund' && (
          <div className="flex-1 flex flex-col p-6 bg-[#080808] text-neutral-300 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6 border-b border-neutral-900 pb-4">
              <button 
                onClick={handleGoBackToHome}
                className="flex items-center gap-1.5 text-xs text-red-500 font-extrabold tracking-wider uppercase bg-red-950/40 border border-red-900/40 px-3 py-1.5 rounded-full hover:bg-red-900/30 transition-colors cursor-pointer"
              >
                ← Inicio
              </button>
              <span className="text-xs text-neutral-500 font-mono">Trámite Obligatorio</span>
            </div>

            <div className="mb-5">
              <span className="text-[10px] font-black tracking-widest uppercase text-red-500 block mb-1 font-mono">
                DEFENSA DEL CONSUMIDOR
              </span>
              <h1 className="text-xl font-black text-white tracking-tight">Botón de Arrepentimiento</h1>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                De acuerdo con la legislación argentina (Resolución 424/2020 de la Secretaría de Comercio Interior), podés cancelar tu compra dentro de los <strong>10 días corridos</strong> desde la recepción del producto. Completá los datos a continuación para iniciar el reintegro inmediato del 100% de tu dinero.
              </p>
            </div>

            {refundStatus === 'success' ? (
              <div className="bg-[#0c0c0c] border border-green-900/30 p-5 rounded-2xl flex flex-col items-center text-center gap-4 my-4 shadow-xl">
                <div className="w-12 h-12 rounded-full bg-green-950/50 border border-green-800 flex items-center justify-center text-green-400 text-xl font-bold">
                  ✓
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Solicitud Enviada</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {refundMessage}
                </p>
                <button
                  onClick={() => {
                    setRefundStatus('idle');
                    setRefundEmail('');
                    setRefundOrderId('');
                    setRefundReason('');
                    handleGoBackToHome();
                  }}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-2.5 rounded-full transition-all cursor-pointer"
                >
                  Volver al Inicio
                </button>
              </div>
            ) : (
              <form onSubmit={handleRefundSubmit} className="space-y-4 bg-neutral-950 border border-neutral-900 p-5 rounded-2xl shadow-lg">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Correo Electrónico de Compra <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={refundEmail}
                    onChange={(e) => setRefundEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 text-xs px-4 py-3 rounded-lg text-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Número de Orden <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={refundOrderId}
                    onChange={(e) => setRefundOrderId(e.target.value)}
                    placeholder="ej. ORD-1234"
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 text-xs px-4 py-3 rounded-lg text-white transition-colors uppercase"
                  />
                  <p className="text-[9px] text-neutral-500 font-mono">
                    Lo encontrás en el mail de confirmación que recibiste al comprar.
                  </p>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Motivo de la cancelación (Opcional)
                  </label>
                  <select
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 text-xs px-4 py-3 rounded-lg text-neutral-300 transition-colors"
                  >
                    <option value="">Seleccione una opción</option>
                    <option value="arrepentimiento">Me arrepentí de la compra / Ya no lo necesito</option>
                    <option value="demora">Demora excesiva en la entrega</option>
                    <option value="error">Error al elegir el producto</option>
                    <option value="otro">Otro motivo personal</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={refundStatus === 'loading'}
                  className="w-full bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-lg shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {refundStatus === 'loading' ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Procesando Solicitud...
                    </>
                  ) : (
                    'Confirmar Arrepentimiento de Compra'
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 bg-neutral-950 p-4 border border-neutral-900 rounded-xl text-[10px] text-neutral-500 leading-normal text-left">
              <span className="font-bold text-neutral-400 block mb-1">Información legal de reintegros:</span>
              Una vez recibida la solicitud, suspendemos cualquier despacho en tránsito y enviamos la orden de reintegro a Mercado Pago. Los reembolsos de dinero en cuenta o tarjeta suelen verse reflejados inmediatamente o hasta en 10 días según las políticas de tu entidad bancaria.
            </div>
          </div>
        )}

        {/* Bottom Sticky Action Panel */}
        <StickyBuyBar
          selectedOption={selectedOption}
          orderQuantity={orderQuantity}
          isVisible={showSticky && !checkoutOpen && activeView === 'main'}
          onActionClick={() => setCheckoutOpen(true)}
        />

        {/* Social Proof Dynamic Notifications */}
        <SocialProofToast 
          data={SOCIAL_PROOF_DATA} 
          isStickyVisible={showSticky && !checkoutOpen && activeView === 'main'} 
        />

        {/* Slide-up Checkout Form Overlay */}
        {checkoutOpen && (
          <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/80 backdrop-blur-xs transition-opacity duration-300">
            <div 
              className="absolute inset-0" 
              onClick={() => !orderCompleted && !isProcessingPayment && setCheckoutOpen(false)} 
            />
            
            <div className="w-full max-w-[480px] bg-[#0c0c0c] border-t border-neutral-850 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.9)] relative z-10 overflow-hidden max-h-[90vh] flex flex-col animate-slide-up text-white">
              
              {/* Checkout Header */}
              <div className="px-5 py-4 border-b border-neutral-850 flex items-center justify-between bg-[#121212] select-none">
                <span className="font-black text-base text-white uppercase tracking-tight">
                  {orderCompleted ? '¡Pedido Confirmado!' : 'Finalizar Compra'}
                </span>
                <button
                  onClick={resetCheckout}
                  disabled={isProcessingPayment}
                  className="text-neutral-400 hover:text-white text-lg font-bold p-1 select-none cursor-pointer disabled:opacity-20"
                >
                  ✕
                </button>
              </div>

              {/* Checkout Body */}
              <div className="overflow-y-auto p-5 flex-1 relative">
                
                {/* Simulated Payment Loading Overlay */}
                {isProcessingPayment && (
                  <div className="absolute inset-0 bg-[#0c0c0c]/95 z-20 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
                    <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin mb-4" />
                    <h3 className="font-black text-sm text-neutral-100 uppercase tracking-wider">
                      Procesando Pago Seguro
                    </h3>
                    <p className="text-[10px] text-neutral-400 mt-1 max-w-[220px]">
                      Por favor, no cierres esta ventana. Conectando con Mercado Pago...
                    </p>
                  </div>
                )}

                {!orderCompleted ? (
                  <form onSubmit={handleConfirmOrder} className="flex flex-col gap-4">
                    
                    {/* Summary Card */}
                    <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-3.5 flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <img 
                          src={heroImg} 
                          alt="Resumen" 
                          className="w-12 h-12 object-contain bg-neutral-900 rounded-md p-1 border border-neutral-800"
                        />
                        {(selectedOption.quantity * orderQuantity) > 1 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-extrabold text-[9px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-[#0c0c0c]">
                            x{selectedOption.quantity * orderQuantity}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-neutral-200 block">
                          Extintor automático BAW
                        </span>
                        <span className="text-[10px] text-neutral-400 block">
                          Cantidad: {selectedOption.quantity * orderQuantity} {(selectedOption.quantity * orderQuantity) === 1 ? 'unidad' : 'unidades'}
                        </span>
                        <span className="text-sm font-black text-red-500 font-mono block mt-0.5">
                          Total: ${(selectedOption.totalPrice * orderQuantity).toLocaleString('es-AR')}
                        </span>
                        {(((89900 * selectedOption.quantity) - selectedOption.totalPrice) * orderQuantity) > 0 && (
                          <span className="text-[9px] text-green-400 font-extrabold block mt-0.5 animate-pulse">
                            🎉 ¡Estás ahorrando ${(((89900 * selectedOption.quantity) - selectedOption.totalPrice) * orderQuantity).toLocaleString('es-AR')} con este combo!
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Selector inside Checkout Drawer */}
                    <div className="bg-neutral-900/50 border border-neutral-850 rounded-xl p-3 flex items-center justify-between select-none">
                      <span className="text-[10px] uppercase font-extrabold text-neutral-400 tracking-wider">
                        Ajustar cantidad de packs ({selectedOption.label}):
                      </span>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setOrderQuantity(prev => Math.max(1, prev - 1))}
                          className="w-6 h-6 rounded-md bg-[#121212] hover:bg-neutral-800 active:scale-95 border border-neutral-800 flex items-center justify-center font-extrabold text-xs text-white transition-all cursor-pointer"
                        >
                          −
                        </button>
                        <span className="font-mono text-xs font-black text-white w-4 text-center">
                          {orderQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setOrderQuantity(prev => prev + 1)}
                          className="w-6 h-6 rounded-md bg-[#121212] hover:bg-neutral-800 active:scale-95 border border-neutral-800 flex items-center justify-center font-extrabold text-xs text-white transition-all cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Out of Stock alert inside Checkout */}
                    {(selectedOption.quantity * orderQuantity) > 9 && (
                      <div className="bg-red-950/40 border border-red-600/40 text-red-500 rounded-xl p-3 text-center text-[11px] font-sans font-bold leading-normal animate-pulse select-none">
                        ⚠️ ¡Sin stock disponible para esta cantidad!<br/>
                        <span className="text-[9px] text-neutral-400 font-medium">Por favor, reducí las unidades (Máximo 9 unidades por cliente).</span>
                      </div>
                    )}

                    {/* Shipping Fields */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">
                        Nombre y Apellido *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        onBlur={() => setFullNameTouched(true)}
                        placeholder="Ej. Juan Pérez"
                        className={`w-full bg-neutral-900 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-hidden focus:ring-1 transition-all ${
                          fullNameTouched 
                            ? getFullNameError() 
                              ? 'border-red-600 focus:border-red-600 focus:ring-red-600/30' 
                              : 'border-green-600 focus:border-green-600 focus:ring-green-600/30'
                            : 'border-neutral-800 focus:border-red-600 focus:ring-red-600/30'
                        }`}
                      />
                      {fullNameTouched && getFullNameError() && (
                        <p className="text-[10px] text-red-500 mt-1 font-semibold animate-fade-in">
                          ⚠️ {getFullNameError()}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">
                        Teléfono / Celular *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onBlur={() => setPhoneTouched(true)}
                        placeholder="Ej. 11 1234 5678"
                        className={`w-full bg-neutral-900 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-hidden focus:ring-1 transition-all ${
                          phoneTouched 
                            ? getPhoneError() 
                              ? 'border-red-600 focus:border-red-600 focus:ring-red-600/30' 
                              : 'border-green-600 focus:border-green-600 focus:ring-green-600/30'
                            : 'border-neutral-800 focus:border-red-600 focus:ring-red-600/30'
                        }`}
                      />
                      {phoneTouched && getPhoneError() && (
                        <p className="text-[10px] text-red-500 mt-1 font-semibold animate-fade-in">
                          ⚠️ {getPhoneError()}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">
                        Dirección de Envío *
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        onBlur={() => setAddressTouched(true)}
                        placeholder="Ej. Av. Siempreviva 742"
                        className={`w-full bg-neutral-900 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-hidden focus:ring-1 transition-all ${
                          addressTouched 
                            ? getAddressError() 
                              ? 'border-red-600 focus:border-red-600 focus:ring-red-600/30' 
                              : 'border-green-600 focus:border-green-600 focus:ring-green-600/30'
                            : 'border-neutral-800 focus:border-red-600 focus:ring-red-600/30'
                        }`}
                      />
                      {addressTouched && getAddressError() && (
                        <p className="text-[10px] text-red-500 mt-1 font-semibold animate-fade-in">
                          ⚠️ {getAddressError()}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">
                          Ciudad / Provincia *
                        </label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          onBlur={() => setCityTouched(true)}
                          placeholder="Ej. CABA"
                          className={`w-full bg-neutral-900 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-hidden focus:ring-1 transition-all ${
                            cityTouched 
                              ? getCityError() 
                                ? 'border-red-600 focus:border-red-600 focus:ring-red-600/30' 
                                : 'border-green-600 focus:border-green-600 focus:ring-green-600/30'
                              : 'border-neutral-800 focus:border-red-600 focus:ring-red-600/30'
                          }`}
                        />
                        {cityTouched && getCityError() && (
                          <p className="text-[10px] text-red-500 mt-1 font-semibold animate-fade-in">
                            ⚠️ {getCityError()}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">
                          Cód. Postal *
                        </label>
                        <input
                          type="text"
                          required
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value.toUpperCase().slice(0, 8))}
                          onBlur={() => setPostalCodeTouched(true)}
                          placeholder="Ej. 1425"
                          className={`w-full bg-neutral-900 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-hidden focus:ring-1 transition-all ${
                            postalCodeTouched 
                              ? getPostalCodeError() 
                                ? 'border-red-600 focus:border-red-600 focus:ring-red-600/30' 
                                : 'border-green-600 focus:border-green-600 focus:ring-green-600/30'
                              : 'border-neutral-800 focus:border-red-600 focus:ring-red-600/30'
                          }`}
                        />
                        {postalCodeTouched && getPostalCodeError() && (
                          <p className="text-[10px] text-red-500 mt-1 font-semibold animate-fade-in">
                            ⚠️ {getPostalCodeError()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Payment selector */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">
                        Método de Pago
                      </label>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`border rounded-lg py-2.5 text-center text-[10px] font-extrabold flex flex-col items-center justify-center cursor-pointer transition-all ${
                            paymentMethod === 'card'
                              ? 'border-red-600 bg-red-950/20 text-red-500 font-black'
                              : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 font-bold'
                          }`}
                        >
                          💳 Tarjeta
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('transfer')}
                          className={`border rounded-lg py-2.5 text-center text-[10px] font-extrabold flex flex-col items-center justify-center cursor-pointer transition-all ${
                            paymentMethod === 'transfer'
                              ? 'border-red-600 bg-red-950/20 text-red-500 font-black'
                              : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 font-bold'
                          }`}
                        >
                          🏦 Transf.
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('whatsapp')}
                          className={`border rounded-lg py-2.5 text-center text-[10px] font-extrabold flex flex-col items-center justify-center cursor-pointer transition-all ${
                            paymentMethod === 'whatsapp'
                              ? 'border-green-600 bg-green-950/25 text-green-400 font-black'
                              : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 font-bold'
                          }`}
                        >
                          💬 WhatsApp
                        </button>
                      </div>
                    </div>

                    {/* Dynamic payment info box */}
                    {paymentMethod === 'transfer' && (
                      <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-3.5 text-[11px] flex flex-col gap-2.5 animate-fade-in select-all">
                        <span className="text-[9px] font-extrabold uppercase text-neutral-400 tracking-wider">
                          🏦 Datos de Transferencia Galicia
                        </span>
                        <div className="flex flex-col gap-1 text-neutral-300 font-sans">
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Alias:</span>
                            <strong className="text-white font-mono text-[12px]">BAW.ARGENTINA</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">CBU:</span>
                            <strong className="text-white font-mono text-[11px]">0070012312345678901234</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Banco:</span>
                            <span className="text-white font-medium">Galicia</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Titular:</span>
                            <span className="text-white font-medium">BAW S.A.</span>
                          </div>
                        </div>
                        <div className="border-t border-neutral-800 pt-2.5 mt-1 text-[10px] text-green-400 leading-relaxed font-sans">
                          💡 <strong>Para activar el pedido:</strong> enviá el comprobante a nuestro WhatsApp de inmediato:
                          <a
                            href={`https://wa.me/5491136397582?text=${encodeURIComponent(
                              `Hola! 👋 Quiero confirmar el pago por Transferencia de mi pedido por un total de $${(selectedOption.totalPrice * orderQuantity).toLocaleString('es-AR')}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600/10 hover:bg-green-600/20 border border-green-500/20 text-green-400 rounded-lg py-2 px-3 text-center text-[10px] font-extrabold uppercase tracking-wide flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1.5"
                          >
                            💬 Enviar Comprobante al 11 3639 7582
                          </a>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'whatsapp' && (
                      <div className="bg-green-950/10 border border-green-900/30 rounded-xl p-3.5 text-[11px] flex flex-col gap-2 animate-fade-in text-neutral-300 leading-normal font-sans">
                        <strong className="text-green-400 text-[10px] uppercase font-extrabold block mb-0.5">💬 Pago Coordinado por WhatsApp</strong>
                        Al confirmar, reservaremos tu stock y abriremos un chat para coordinar tu pago (Mercado Pago, transferencia, efectivo) con nuestro asesor al número oficial <strong className="text-white">11 3639 7582</strong>.
                        <a
                          href={`https://wa.me/5491136397582?text=${encodeURIComponent(
                            `Hola! 👋 Elegí coordinar mi pedido de Extintor BAW por WhatsApp.\n\n• Nombre: ${fullName}\n• Producto: ${orderQuantity}x Pack (${selectedOption.label})\n• Unidades Totales: ${selectedOption.quantity * orderQuantity}\n• Total: $${(selectedOption.totalPrice * orderQuantity).toLocaleString('es-AR')}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 px-3 text-center text-[10px] font-extrabold uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1.5 hover:scale-[1.02] active:scale-95"
                        >
                          Chat Directo con Asesor
                        </a>
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-3.5 text-[11px] flex flex-col gap-1.5 animate-fade-in text-neutral-400 leading-normal font-sans">
                        <strong className="text-white text-[10px] uppercase font-extrabold block mb-0.5">🔒 Conexión Encriptada SSL (Mercado Pago)</strong>
                        Pago seguro y protegido con tarjeta de crédito/débito. Procesado de forma segura mediante pasarela simulada para su demostración comercial.
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={(selectedOption.quantity * orderQuantity) > 9}
                      className={`w-full text-white font-extrabold text-xs uppercase py-3.5 rounded-xl shadow-md transition-colors mt-2 ${
                        (selectedOption.quantity * orderQuantity) > 9
                          ? 'bg-neutral-900 text-neutral-500 border border-neutral-850 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700 cursor-pointer'
                      }`}
                    >
                      {(selectedOption.quantity * orderQuantity) > 9 ? 'Sin Stock Disponible' : (paymentMethod === 'card' ? 'Pagar Seguro con Tarjeta' : 'Confirmar y Pedir')}
                    </button>
                  </form>
                ) : (
                  /* Success State with Invoice Receipt and WhatsApp link */
                  <div className="flex flex-col items-center justify-center text-center py-4 select-none animate-fade-in">
                    <div className="w-12 h-12 bg-green-950/40 text-green-500 border border-green-900/30 rounded-full flex items-center justify-center mb-3 text-2xl animate-bounce">
                      ✓
                    </div>
                    
                    <h3 className="font-black text-base text-white mb-0.5 uppercase tracking-tight">
                      ¡Pedido Confirmado!
                    </h3>
                    <p className="text-[11px] text-neutral-400 max-w-[340px] leading-relaxed mb-4">
                      Muchas gracias por tu compra, <strong className="text-neutral-200">{fullName}</strong>. Tu orden ha sido recibida correctamente.
                    </p>

                    {/* Digital Invoice Ticket */}
                    <div className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-4 text-left font-mono relative mb-5 overflow-hidden">
                      <div className="absolute top-0 inset-x-0 h-1 bg-repeat-x bg-[length:10px_10px]" style={{ backgroundImage: 'linear-gradient(135deg, #0c0c0c 25%, transparent 25%), linear-gradient(225deg, #0c0c0c 25%, transparent 25%)' }} />
                      
                      <div className="flex justify-between items-center text-[10px] text-neutral-500 mb-2 mt-1">
                        <span>RECIBO DE PEDIDO</span>
                        <span>{currentOrderId}</span>
                      </div>
                      
                      <div className="border-b border-neutral-850 border-dashed pb-2 mb-2 flex justify-between text-[11px] text-neutral-300">
                        <span>Fecha:</span>
                        <span>{new Date().toLocaleDateString('es-AR')}</span>
                      </div>

                      <div className="space-y-1.5 text-xs text-neutral-300 border-b border-neutral-850 border-dashed pb-2.5 mb-2.5">
                        <div className="flex justify-between">
                          <span>Producto:</span>
                          <span className="text-white text-right max-w-[180px] truncate">
                            {orderQuantity}x {selectedOption.label === '1 ud.' ? 'Extintor Individual' : selectedOption.label === '2 uds.' ? 'Combo Extintor' : 'Combo Extintor Max'} ({selectedOption.quantity * orderQuantity} uds)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Envío:</span>
                          <span className="text-green-500 font-bold">GRATIS</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Método Pago:</span>
                          <span className="text-white uppercase">
                            {paymentMethod === 'card' ? 'Tarjeta' : paymentMethod === 'transfer' ? 'Transferencia' : 'WhatsApp'}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm font-black text-white">
                        <span>TOTAL COMPRA:</span>
                        <span className="text-red-500 font-bold">${(selectedOption.totalPrice * orderQuantity).toLocaleString('es-AR')}</span>
                      </div>

                      {paymentMethod === 'transfer' && (
                        <div className="bg-red-950/20 border border-red-900/20 rounded-lg p-2.5 mt-3 text-[10px] text-red-400 font-sans leading-relaxed">
                          <strong>⚠️ Pendiente de Pago:</strong> Recordá transferir al alias <strong>BAW.ARGENTINA</strong> y envianos tu comprobante por WhatsApp al <strong className="text-white">11 3639 7582</strong> presionando el botón verde de abajo.
                        </div>
                      )}
                    </div>

                    {/* Instant WhatsApp Closing Link */}
                    <a
                      href={`https://wa.me/5491136397582?text=${encodeURIComponent(
                        `¡Hola BAW! 👋 Acabo de realizar una compra desde el sitio oficial.\n\n` +
                        `📌 *Detalles del Pedido:*\n` +
                        `• *ID:* ${currentOrderId}\n` +
                        `• *Cliente:* ${fullName}\n` +
                        `• *Teléfono:* ${phone}\n` +
                        `• *Dirección:* ${address}, ${city} (CP: ${postalCode})\n` +
                        `• *Producto:* ${orderQuantity}x Pack (${selectedOption.label === '1 ud.' ? '1 Unidad Individual' : selectedOption.label === '2 uds.' ? 'Combo 2 Unidades' : 'Combo 3 Unidades (Ahorro)'}) - Total: ${selectedOption.quantity * orderQuantity} Unidades\n` +
                        `• *Método de Pago:* ${paymentMethod === 'card' ? 'Tarjeta (Simulada)' : paymentMethod === 'transfer' ? 'Transferencia Bancaria (Galicia)' : 'Coordinar Pago por WhatsApp'}\n` +
                        `• *Total:* $${(selectedOption.totalPrice * orderQuantity).toLocaleString('es-AR')}\n\n` +
                        `Quedo a la espera de sus comentarios para recibir el extintor. ¡Gracias!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs uppercase py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mb-4 cursor-pointer select-none"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.665.988 3.311 1.485 5.369 1.486 5.539 0 10.051-4.467 10.054-9.957.002-2.661-1.029-5.161-2.905-7.039C17.288 1.767 14.8 1.012 12.01 1.01 6.467 1.01 1.957 5.518 1.954 11.009c-.001 1.942.502 3.829 1.458 5.474L2.45 21.108l4.197-1.954z"/>
                      </svg>
                      Enviar Pedido por WhatsApp
                    </a>

                    <button
                      onClick={resetCheckout}
                      className="text-neutral-400 hover:text-white font-extrabold text-[10px] uppercase px-4 py-2 cursor-pointer transition-colors"
                    >
                      Volver a la Tienda
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Persistent Floating WhatsApp badge so it's always at hand */}
        <a
          href="https://wa.me/5491136397582"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-24 right-4 z-40 bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white w-14 h-14 rounded-full shadow-[0_4px_15px_rgba(37,211,102,0.4)] flex items-center justify-center cursor-pointer transition-all border border-white/10"
          title="Enviar Comprobante o Consultas"
        >
          <svg className="w-8 h-8 fill-current text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.023-5.115-2.887-6.979C16.578 1.9 14.104.875 11.472.875 6.037.875 1.611 5.297 1.607 10.733c-.001 1.685.443 3.326 1.288 4.777L1.875 21.8l6.33-1.66c-1.48.81-2.9 1.2-4.14 1.2a9.7 9.7 0 01-1.12-.065zm11.332-6.52c-.3-.15-1.776-.875-2.05-.975-.276-.1-.476-.15-.676.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-1.2-.6-1.95-.975-2.725-1.65-.675-.6-1.15-1.325-1.275-1.525-.125-.2-.013-.308.112-.433.112-.113.25-.3.375-.45.125-.15.167-.25.25-.417.083-.167.042-.317-.02-.467-.063-.15-.563-1.358-.771-1.858-.202-.487-.41-.41-.563-.418-.146-.008-.313-.008-.48-.008-.166 0-.437.063-.666.313-.229.25-.875.855-.875 2.078 0 1.22.888 2.397 1.013 2.563.125.167 1.747 2.668 4.232 3.738.591.254 1.053.405 1.412.519.593.189 1.134.162 1.561.098.476-.071 1.476-.603 1.682-1.18.204-.577.204-1.074.142-1.18-.063-.104-.229-.155-.53-.306z"/>
          </svg>
        </a>

        {/* Emergent Transfer Receipt Modal */}
        {showTransferReceiptPopup && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-[360px] bg-[#0c0c0c] border-2 border-green-500/80 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(34,197,94,0.35)] relative select-none">
              <div className="w-12 h-12 bg-green-950/60 text-green-400 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-3.5 text-2xl animate-bounce">
                🏦
              </div>
              <h3 className="font-black text-sm text-white uppercase tracking-tight mb-1">
                ¡ENVIAR COMPROBANTE!
              </h3>
              <p className="text-[11px] text-neutral-300 leading-relaxed mb-4">
                Tu pedido ha sido registrado con éxito. <strong className="text-white">Debés enviar el comprobante de transferencia</strong> a nuestro WhatsApp para iniciar el despacho inmediato.
              </p>
              
              <div className="bg-neutral-950 rounded-xl p-3 text-left font-mono text-[10px] text-neutral-400 mb-4 border border-neutral-850">
                <div className="flex justify-between mb-1">
                  <span>Alias Galicia:</span>
                  <strong className="text-white">BAW.ARGENTINA</strong>
                </div>
                <div className="flex justify-between">
                  <span>WhatsApp de Envío:</span>
                  <strong className="text-green-400">11 3639 7582</strong>
                </div>
              </div>

              <a
                href={`https://wa.me/5491136397582?text=${encodeURIComponent(
                  `¡Hola! 👋 Envío el comprobante de la transferencia para mi Pedido ID: ${currentOrderId}.\n` +
                  `• Cliente: ${fullName}\n` +
                  `• Total: $${(selectedOption.totalPrice * orderQuantity).toLocaleString('es-AR')}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowTransferReceiptPopup(false)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-[11px] uppercase py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 mb-3 cursor-pointer"
              >
                💬 Enviar Comprobante Ahora
              </a>
              
              <button
                onClick={() => setShowTransferReceiptPopup(false)}
                className="text-neutral-500 hover:text-white font-extrabold text-[9px] uppercase cursor-pointer"
              >
                Entendido, ya copié los datos
              </button>
            </div>
          </div>
        )}

        {/* Admin Dashboard Overlay Module */}
        <AdminPanel isOpen={adminOpen} onClose={() => setAdminOpen(false)} />

      </div>
    </div>
  );
}

