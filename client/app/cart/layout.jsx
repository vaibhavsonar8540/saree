export const metadata = {
  title: "Shopping Cart & Bag",
  description:
    "Review your selected pure silk sarees, apply promotional coupons, and proceed to secure checkout at Anjali Creation.",
  robots: {
    index: false, // E-commerce carts shouldn't be indexed by search engines
    follow: true,
  },
};

export default function CartLayout({ children }) {
  return children;
}
