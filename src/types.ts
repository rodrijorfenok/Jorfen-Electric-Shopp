export interface BundleOption {
  id: string;
  quantity: number;
  label: string;
  pricePerUnit: number;
  totalPrice: number;
  discountBadge?: string;
  isBestSeller?: boolean;
  imagesCount: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SocialProof {
  user: string;
  action: string;
  time: string;
}

export interface Order {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: 'card' | 'transfer' | 'whatsapp';
  bundleId: string;
  bundleLabel: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'shipped' | 'completed';
  createdAt: string;
}
