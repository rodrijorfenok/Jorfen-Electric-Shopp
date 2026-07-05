import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { ShieldCheck, Calendar, DollarSign, Package, TrendingUp, X, Check, Truck, Trash2, ArrowDown, FileText, PlusCircle, BarChart3, Mail, RefreshCw, Send, Tag } from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FiredEvent {
  id: string;
  eventName: string;
  platform: string;
  payload: any;
  timestamp: string;
}

interface AbandonedCart {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  bundleLabel: string;
  totalPrice: number;
  createdAt: string;
}

const DEFAULT_PIN = '1234';

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-5839',
    fullName: 'Diego Sánchez',
    phone: '11 5834 9283',
    address: 'Av. Corrientes 1482, Piso 4',
    city: 'CABA',
    postalCode: '1042',
    paymentMethod: 'transfer',
    bundleId: 'bundle-2',
    bundleLabel: 'Combo 2 Unidades',
    quantity: 2,
    totalPrice: 159900,
    status: 'completed',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
  },
  {
    id: 'ORD-1284',
    fullName: 'Natalia Fernandez',
    phone: '341 9382 129',
    address: 'Calle Santa Fe 2384',
    city: 'Rosario, Santa Fe',
    postalCode: '2000',
    paymentMethod: 'card',
    bundleId: 'bundle-1',
    bundleLabel: '1 Unidad Individual',
    quantity: 1,
    totalPrice: 89900,
    status: 'shipped',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 24 hours ago
  },
  {
    id: 'ORD-7294',
    fullName: 'Claudia Palacios',
    phone: '221 4829 555',
    address: 'Calle 12 Nro 834',
    city: 'La Plata, Buenos Aires',
    postalCode: '1900',
    paymentMethod: 'whatsapp',
    bundleId: 'bundle-3',
    bundleLabel: 'Combo 3 Unidades (Máximo Ahorro)',
    quantity: 3,
    totalPrice: 219900,
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 32).toISOString(), // 32 hours ago
  },
];

const MOCK_ABANDONED_CARTS: AbandonedCart[] = [
  {
    id: 'REC-3982',
    fullName: 'Mariano Casal',
    phone: '11 3244 8921',
    address: 'Calle Corrientes 450',
    city: 'CABA',
    postalCode: '1002',
    bundleLabel: 'Combo 2 Unidades',
    totalPrice: 161820,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
  }
];

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [firedEvents, setFiredEvents] = useState<FiredEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'recovery' | 'analytics'>('orders');
  const [filter, setFilter] = useState<'all' | 'pending' | 'shipped' | 'completed'>('all');

  // Load orders, abandoned checkouts, and events from localStorage
  const loadData = () => {
    const stored = localStorage.getItem('baw_orders');
    if (stored) {
      try {
        setOrders(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('baw_orders', JSON.stringify(MOCK_ORDERS));
      setOrders(MOCK_ORDERS);
    }

    const storedAbandoned = localStorage.getItem('baw_abandoned_checkouts');
    if (storedAbandoned) {
      try {
        setAbandonedCarts(JSON.parse(storedAbandoned));
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('baw_abandoned_checkouts', JSON.stringify(MOCK_ABANDONED_CARTS));
      setAbandonedCarts(MOCK_ABANDONED_CARTS);
    }

    const storedEvents = localStorage.getItem('baw_fired_events');
    if (storedEvents) {
      try {
        setFiredEvents(JSON.parse(storedEvents));
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Listen to custom logged events
  useEffect(() => {
    const handleEventLogged = () => {
      const storedEvents = localStorage.getItem('baw_fired_events');
      if (storedEvents) {
        try {
          setFiredEvents(JSON.parse(storedEvents));
        } catch (e) {}
      }
    };
    window.addEventListener('baw_event_logged', handleEventLogged);
    return () => window.removeEventListener('baw_event_logged', handleEventLogged);
  }, []);

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === DEFAULT_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleUpdateStatus = (orderId: string, newStatus: 'pending' | 'shipped' | 'completed') => {
    const updated = orders.map((ord) => {
      if (ord.id === orderId) {
        return { ...ord, status: newStatus };
      }
      return ord;
    });
    setOrders(updated);
    localStorage.setItem('baw_orders', JSON.stringify(updated));
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('¿Está seguro de eliminar este pedido?')) {
      const updated = orders.filter((ord) => ord.id !== orderId);
      setOrders(updated);
      localStorage.setItem('baw_orders', JSON.stringify(updated));
    }
  };

  const handleDeleteCart = (cartId: string) => {
    if (window.confirm('¿Desea eliminar este carrito de la lista?')) {
      const updated = abandonedCarts.filter((cart) => cart.id !== cartId);
      setAbandonedCarts(updated);
      localStorage.setItem('baw_abandoned_checkouts', JSON.stringify(updated));
    }
  };

  const handleGenerateMocks = () => {
    const combined = [...orders, ...MOCK_ORDERS.map(o => ({
      ...o,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    }))];
    setOrders(combined);
    localStorage.setItem('baw_orders', JSON.stringify(combined));
  };

  const handleClearAll = () => {
    if (window.confirm('¿Desea borrar TODOS los pedidos? Esta acción no se puede deshacer.')) {
      setOrders([]);
      localStorage.setItem('baw_orders', JSON.stringify([]));
    }
  };

  const handleClearEvents = () => {
    if (window.confirm('¿Desea borrar el historial de eventos analíticos?')) {
      setFiredEvents([]);
      localStorage.setItem('baw_fired_events', JSON.stringify([]));
    }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = ['ID Pedido', 'Cliente', 'Teléfono', 'Dirección', 'Ciudad', 'CP', 'Producto', 'Cant', 'Total', 'Método Pago', 'Estado', 'Fecha'];
    const rows = orders.map(ord => [
      ord.id,
      ord.fullName,
      ord.phone,
      ord.address,
      ord.city,
      ord.postalCode,
      ord.bundleLabel,
      ord.quantity,
      ord.totalPrice,
      ord.paymentMethod,
      ord.status,
      new Date(ord.createdAt).toLocaleDateString('es-AR')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pedidos_baw_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // KPIs
  const filteredOrders = orders.filter((o) => filter === 'all' || o.status === filter);
  const totalSales = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const shippedCount = orders.filter(o => o.status === 'shipped').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  return (
    <div className="fixed inset-0 z-[12000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] bg-[#0c0c0c] border border-neutral-850 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-white">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-850 bg-neutral-900 flex items-center justify-between select-none">
          <div className="flex items-center gap-2 text-red-500">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-black text-sm uppercase tracking-wider">
              BAW Panel de Control
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Authentication Screen */}
        {!isAuthenticated ? (
          <div className="p-8 flex flex-col items-center justify-center flex-1">
            <div className="w-14 h-14 bg-red-950/30 text-red-500 border border-red-900/40 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>
            
            <h3 className="text-base font-extrabold text-white mb-1.5 uppercase tracking-wider text-center">
              Acceso de Administrador
            </h3>
            <p className="text-xs text-neutral-400 text-center mb-6 max-w-[280px]">
              Ingresá el PIN de seguridad para gestionar los pedidos de la landing page.
            </p>

            <form onSubmit={handlePinSubmit} className="w-full max-w-[240px] flex flex-col gap-3">
              <input
                type="password"
                maxLength={4}
                required
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value.replace(/\D/g, ''));
                  setPinError(false);
                }}
                placeholder="PIN (Defecto: 1234)"
                className="w-full text-center tracking-[12px] bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-lg text-white font-mono focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600/30"
              />
              
              {pinError && (
                <span className="text-[10px] text-red-500 font-bold text-center mt-0.5 animate-bounce block">
                  ⚠️ PIN incorrecto. Intenta de nuevo.
                </span>
              )}

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase py-3 rounded-xl shadow-md transition-colors mt-2 cursor-pointer"
              >
                Ingresar
              </button>
            </form>

            <span className="text-[9px] text-neutral-600 mt-8">
              Sugerencia: El pin de fábrica es <strong className="text-neutral-400">1234</strong>
            </span>
          </div>
        ) : (
          /* Dashboard Content */
          <div className="flex flex-col flex-1 overflow-hidden">
            
            {/* Main Tabs Selection */}
            <div className="grid grid-cols-3 border-b border-neutral-850 bg-neutral-950 text-center text-xs select-none">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-3 font-extrabold uppercase border-b-2 tracking-wide transition-all ${
                  activeTab === 'orders' 
                    ? 'border-red-600 text-white bg-neutral-900/40' 
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                📦 Pedidos ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('recovery')}
                className={`py-3 font-extrabold uppercase border-b-2 tracking-wide transition-all ${
                  activeTab === 'recovery' 
                    ? 'border-red-600 text-white bg-neutral-900/40' 
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                🛒 Carritos ({abandonedCarts.length})
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-3 font-extrabold uppercase border-b-2 tracking-wide transition-all ${
                  activeTab === 'analytics' 
                    ? 'border-red-600 text-white bg-neutral-900/40' 
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                📊 Fuego CRO ({firedEvents.length})
              </button>
            </div>

            {activeTab === 'orders' && (
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Stats Dashboard */}
                <div className="p-4 bg-neutral-900/50 border-b border-neutral-850 grid grid-cols-2 gap-3 select-none">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-col">
                    <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Facturado</span>
                    </div>
                    <span className="text-base font-black text-white font-mono">
                      ${totalRevenue.toLocaleString('es-AR')}
                    </span>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-col">
                    <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                      <Package className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Total Pedidos</span>
                    </div>
                    <span className="text-base font-black text-white font-mono">
                      {totalSales} <span className="text-[10px] font-bold text-neutral-500">ventas</span>
                    </span>
                  </div>
                </div>

                {/* Quick Filter tabs & Utility actions */}
                <div className="px-4 py-3 bg-[#111] border-b border-neutral-850 flex items-center justify-between gap-3 select-none">
                  <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[260px]">
                    {(['all', 'pending', 'shipped', 'completed'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex-shrink-0 ${
                          filter === t
                            ? 'bg-red-600 text-white'
                            : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                        }`}
                      >
                        {t === 'all' ? 'Todos' : t === 'pending' ? `Pend. (${pendingCount})` : t === 'shipped' ? `Env. (${shippedCount})` : `Comp. (${completedCount})`}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Generate test orders */}
                    <button
                      onClick={handleGenerateMocks}
                      className="bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white p-2 rounded-lg border border-neutral-800 cursor-pointer"
                      title="Generar 3 Pedidos de Prueba"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                    </button>
                    
                    {/* Export CSV */}
                    <button
                      onClick={handleExportCSV}
                      disabled={orders.length === 0}
                      className="bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white p-2 rounded-lg border border-neutral-800 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                      title="Exportar a CSV"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete all */}
                    <button
                      onClick={handleClearAll}
                      disabled={orders.length === 0}
                      className="bg-red-950/40 hover:bg-red-900/40 text-red-500 p-2 rounded-lg border border-red-900/20 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                      title="Borrar Todo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Orders list container */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                      <Package className="w-10 h-10 mb-2 stroke-1 opacity-40 text-neutral-600" />
                      <span className="text-xs font-bold uppercase tracking-wider">No hay pedidos</span>
                      <p className="text-[10px] text-neutral-600 mt-1 max-w-[200px] text-center">
                        Los pedidos nuevos ingresados en la tienda aparecerán aquí automáticamente.
                      </p>
                    </div>
                  ) : (
                    filteredOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-neutral-950 border border-neutral-850 p-3.5 rounded-xl flex flex-col gap-2.5 shadow-md relative animate-fade-in"
                      >
                        {/* Header info */}
                        <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-white font-mono uppercase">
                              {ord.id}
                            </span>
                            <span className="text-[9px] text-neutral-500 font-mono mt-0.5">
                              {new Date(ord.createdAt).toLocaleDateString('es-AR')} {new Date(ord.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Status indicator pill */}
                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            ord.status === 'completed'
                              ? 'bg-green-950/40 text-green-400 border border-green-900/30'
                              : ord.status === 'shipped'
                                ? 'bg-blue-950/40 text-blue-400 border border-blue-900/30'
                                : 'bg-amber-950/40 text-amber-400 border border-amber-900/30'
                          }`}>
                            {ord.status === 'completed' ? 'Completado' : ord.status === 'shipped' ? 'Enviado' : 'Pendiente'}
                          </span>
                        </div>

                        {/* Customer info */}
                        <div className="text-xs">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <strong className="text-neutral-200">{ord.fullName}</strong>
                            <span className="text-neutral-400 font-mono text-[11px] font-bold">{ord.phone}</span>
                          </div>
                          <p className="text-neutral-400 text-[11px] leading-tight mb-1.5">
                            📦 {ord.address}, {ord.city} (CP: {ord.postalCode})
                          </p>
                          
                          <div className="bg-[#121212] rounded-lg p-2 flex items-center justify-between border border-neutral-900">
                            <span className="text-[10px] text-neutral-300 font-bold block truncate max-w-[190px]">
                              {ord.bundleLabel} ({ord.quantity} ud.)
                            </span>
                            <span className="text-[11px] font-black text-red-500 font-mono">
                              ${ord.totalPrice.toLocaleString('es-AR')}
                            </span>
                          </div>
                        </div>

                        {/* Actions bar */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-900 mt-1">
                          <span className="text-[9px] font-black uppercase text-neutral-500 font-mono">
                            Pago: {ord.paymentMethod === 'card' ? '💳 Tarjeta' : ord.paymentMethod === 'transfer' ? '🏦 Transf.' : '💬 WhatsApp'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {/* Status changing buttons */}
                            {ord.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateStatus(ord.id, 'shipped')}
                                className="bg-blue-950 hover:bg-blue-900 text-blue-400 border border-blue-900/20 text-[9px] font-extrabold uppercase px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer"
                              >
                                <Truck className="w-3 h-3" />
                                Enviar
                              </button>
                            )}
                            {ord.status === 'shipped' && (
                              <button
                                onClick={() => handleUpdateStatus(ord.id, 'completed')}
                                className="bg-green-950 hover:bg-green-900 text-green-400 border border-green-900/20 text-[9px] font-extrabold uppercase px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                Completar
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDeleteOrder(ord.id)}
                              className="bg-neutral-900 hover:bg-red-950 hover:text-red-500 text-neutral-400 p-1.5 rounded-md border border-neutral-800 hover:border-red-900/20 cursor-pointer transition-all"
                              title="Eliminar Pedido"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ABANDONED CARTS RECOVERY TAB */}
            {activeTab === 'recovery' && (
              <div className="flex-1 flex flex-col overflow-hidden p-4">
                <div className="mb-3">
                  <span className="text-[10px] font-black text-red-500 tracking-wider block uppercase font-mono">
                    CRO & RECONQUISTA DE LEADS
                  </span>
                  <h4 className="text-xs text-neutral-400 leading-normal">
                    Filtro de contactos que iniciaron checkout pero no finalizaron el pago. Enviá un WhatsApp de recuperación con un solo click:
                  </h4>
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col gap-3">
                  {abandonedCarts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
                      <Mail className="w-10 h-10 mb-2 stroke-1 opacity-40 text-neutral-600" />
                      <span className="text-xs font-bold uppercase tracking-wider">Sin carritos abandonados</span>
                      <p className="text-[9px] text-neutral-600 mt-1 max-w-[220px] text-center">
                        Cuando un usuario complete los datos de contacto pero cierre el cajón de pago, aparecerá aquí inmediatamente.
                      </p>
                    </div>
                  ) : (
                    abandonedCarts.map((cart) => {
                      const msg = `Hola ${cart.fullName}! 👋 Notamos que dejaste incompleto tu pedido del Extintor Automático BAW por $${cart.totalPrice.toLocaleString('es-AR')}.\n\nQueríamos consultarte si tuviste algún problema con el método de pago o si tenías alguna duda técnica sobre el tablero eléctrico en la que podamos asesorarte de inmediato.\n\nContamos con las últimas unidades disponibles en stock para despacho gratuito en San Miguel y toda la República Argentina. ¿Te ayudamos a completarlo?`;
                      return (
                        <div
                          key={cart.id}
                          className="bg-neutral-950 border border-neutral-850 p-3.5 rounded-xl flex flex-col gap-2 relative animate-fade-in"
                        >
                          <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                            <span className="text-xs font-mono font-bold text-red-400">{cart.id} (Carrito Abandonado)</span>
                            <span className="text-[9px] text-neutral-500 font-mono">
                              {new Date(cart.createdAt).toLocaleDateString('es-AR')} {new Date(cart.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="text-xs space-y-1 mt-1 text-neutral-300">
                            <div><strong>Cliente:</strong> {cart.fullName} ({cart.phone})</div>
                            <div><strong>Dirección:</strong> {cart.address}, {cart.city} (CP: {cart.postalCode})</div>
                            <div><strong>Contenido:</strong> <span className="text-red-500 font-bold">{cart.bundleLabel}</span></div>
                            <div className="font-mono text-[11px] font-black text-white">Importe: ${cart.totalPrice.toLocaleString('es-AR')}</div>
                          </div>

                          <div className="flex justify-between items-center gap-2 pt-2.5 border-t border-neutral-900 mt-1">
                            <button
                              onClick={() => handleDeleteCart(cart.id)}
                              className="text-neutral-500 hover:text-red-500 text-[10px] font-black uppercase cursor-pointer"
                            >
                              Eliminar
                            </button>

                            <a
                              href={`https://wa.me/${cart.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(msg)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all hover:scale-[1.02]"
                            >
                              <Send className="w-3 h-3" />
                              Recuperar WhatsApp
                            </a>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* REAL-TIME PIXEL AND CONVERSION EVENT DEBUGGER */}
            {activeTab === 'analytics' && (
              <div className="flex-1 flex flex-col overflow-hidden p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-[10px] font-black text-red-500 tracking-wider block uppercase font-mono">
                      CÓDIGOS DE CONVERSIÓN LIVE
                    </span>
                    <h4 className="text-xs text-neutral-400 leading-normal">
                      Monitorea los eventos de Meta Pixel, GA4, GTM y Conversion API disparados en la landing:
                    </h4>
                  </div>
                  <button
                    onClick={handleClearEvents}
                    className="p-1.5 bg-neutral-900 border border-neutral-800 rounded-lg hover:text-red-500 cursor-pointer"
                    title="Limpiar logs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col gap-2.5">
                  {firedEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
                      <BarChart3 className="w-10 h-10 mb-2 stroke-1 opacity-40 text-neutral-600" />
                      <span className="text-xs font-bold uppercase tracking-wider">Sin eventos aún</span>
                      <p className="text-[9px] text-neutral-600 mt-1 max-w-[220px] text-center">
                        Navegá por la tienda, selecciona packs, abrí el checkout o realizá compras para ver cómo se disparan las conversiones en tiempo real.
                      </p>
                    </div>
                  ) : (
                    firedEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="bg-neutral-950 border border-neutral-850 p-3 rounded-xl flex flex-col gap-2 relative text-xs animate-fade-in"
                      >
                        <div className="flex justify-between items-center border-b border-neutral-900 pb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full animate-ping ${
                              ev.platform === 'MetaPixel' ? 'bg-green-500' : ev.platform === 'GA4' ? 'bg-blue-500' : 'bg-amber-500'
                            }`} />
                            <strong className="text-white font-mono uppercase text-[11px]">{ev.eventName}</strong>
                          </div>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase font-mono ${
                            ev.platform === 'MetaPixel' 
                              ? 'bg-purple-950/40 text-purple-400 border border-purple-900/30'
                              : ev.platform === 'GA4'
                                ? 'bg-blue-950/40 text-blue-400 border border-blue-900/30'
                                : ev.platform === 'ConversionAPI'
                                  ? 'bg-pink-950/40 text-pink-400 border border-pink-900/30'
                                  : 'bg-green-950/40 text-green-400 border border-green-900/30'
                          }`}>
                            {ev.platform}
                          </span>
                        </div>

                        {/* Event data block */}
                        <div className="bg-[#050505] rounded-lg p-2 border border-neutral-900 text-[10px] font-mono overflow-x-auto max-h-[120px] text-neutral-400 text-left select-all">
                          <pre>{JSON.stringify(ev.payload, null, 2)}</pre>
                        </div>

                        <div className="flex justify-between items-center text-[9px] text-neutral-600 font-mono">
                          <span>ID: {ev.id}</span>
                          <span>Fired: {new Date(ev.timestamp).toLocaleTimeString('es-AR')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-4 border-t border-neutral-850 bg-neutral-900/50 flex justify-between items-center select-none text-[10px] text-neutral-500">
              <span>Desarrollado para Tienda BAW</span>
              <button 
                onClick={() => {
                  setIsAuthenticated(false);
                  setPinInput('');
                }}
                className="text-red-500 hover:underline cursor-pointer font-bold uppercase tracking-wider"
              >
                Cerrar Sesión
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
