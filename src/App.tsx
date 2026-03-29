import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Briefcase, 
  Bell, 
  Settings, 
  LogOut, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp, 
  Users, 
  DollarSign,
  Menu,
  X,
  ChevronRight,
  Star,
  MessageSquare,
  Edit,
  Trash2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { 
  auth, 
  db, 
  signInWithPopup, 
  googleProvider, 
  signOut, 
  collection, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  serverTimestamp,
  OperationType,
  handleFirestoreError
} from './firebase';
import { AuthProvider, useAuth } from './AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { 
  Service, 
  Order, 
  Project, 
  Notification, 
  OrderStatus,
  Review,
  Category,
  UserProfile
} from './types';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const StarRating = ({ rating, onRatingChange, interactive = false }: { rating: number, onRatingChange?: (r: number) => void, interactive?: boolean }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRatingChange?.(star)}
          className={cn(
            "transition-colors",
            star <= rating ? "text-amber-400" : "text-gray-200",
            interactive && "hover:scale-110"
          )}
        >
          <Star className={cn("w-5 h-5", star <= rating && "fill-current")} />
        </button>
      ))}
    </div>
  );
};

const Navbar = () => {
  const { user, isAdmin, isProvider } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                ServiFlow
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Services</Link>
            {user && (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">My Orders</Link>
                {isProvider && (
                  <Link to="/provider" className="bg-amber-50 text-amber-700 px-4 py-2 rounded-full font-semibold hover:bg-amber-100 transition-colors flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Provider Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
              </>
            )}
            {user ? (
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
                    <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-gray-200" referrerPolicy="no-referrer" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-sm font-bold text-gray-900 truncate">{user.displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={handleLogin} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">
                Get Started
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-50 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link to="/" className="block px-4 py-2 text-gray-600 font-medium">Services</Link>
              {user && (
                <>
                  <Link to="/dashboard" className="block px-4 py-2 text-gray-600 font-medium">My Orders</Link>
                  {isProvider && <Link to="/provider" className="block px-4 py-2 text-amber-600 font-bold">Provider Dashboard</Link>}
                  {isAdmin && <Link to="/admin" className="block px-4 py-2 text-indigo-600 font-bold">Admin Panel</Link>}
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 font-medium">Sign Out</button>
                </>
              )}
              {!user && <button onClick={handleLogin} className="w-full text-center bg-indigo-600 text-white py-3 rounded-xl font-bold">Sign In</button>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Pages ---

const LandingPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const categories = ['All', 'Development', 'Design', 'Marketing', 'Consulting'];

  useEffect(() => {
    const q = collection(db, 'services');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
      setServices(data);
      
      // Seed initial data if empty
      if (data.length === 0) {
        const initialServices = [
          { name: 'Web Development', price: 1500, category: 'Development', description: 'Full-stack web application development using modern technologies like React and Node.js.', imageUrl: 'https://picsum.photos/seed/webdev/800/600' },
          { name: 'UI/UX Design', price: 800, category: 'Design', description: 'Professional user interface and experience design for mobile and web apps.', imageUrl: 'https://picsum.photos/seed/design/800/600' },
          { name: 'Digital Marketing', price: 500, category: 'Marketing', description: 'Comprehensive digital marketing strategy to grow your online presence.', imageUrl: 'https://picsum.photos/seed/marketing/800/600' },
          { name: 'Logo Branding', price: 300, category: 'Design', description: 'Unique and memorable logo design and brand identity packages.', imageUrl: 'https://picsum.photos/seed/logo/800/600' },
          { name: 'Business Consulting', price: 1200, category: 'Consulting', description: 'Expert advice to help your business grow and scale efficiently.', imageUrl: 'https://picsum.photos/seed/consulting/800/600' }
        ];
        initialServices.forEach(s => addDoc(collection(db, 'services'), s));
      }
    });

    // Seed categories if empty
    const catQ = collection(db, 'categories');
    const unsubscribeCats = onSnapshot(catQ, (snapshot) => {
      if (snapshot.empty) {
        const initialCats = ['Development', 'Design', 'Marketing', 'Consulting'];
        initialCats.forEach(name => addDoc(collection(db, 'categories'), { name }));
      }
    });

    return () => {
      unsubscribe();
      unsubscribeCats();
    };
  }, []);

  const filteredServices = services.filter(s => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOrder = async (service: Service) => {
    if (!user) {
      alert("Please sign in to order services.");
      return;
    }

    try {
      const orderData = {
        userId: user.uid,
        serviceId: service.id,
        status: 'pending',
        totalAmount: service.price,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await addDoc(collection(db, 'orders'), orderData);
      
      await addDoc(collection(db, 'notifications'), {
        userId: 'admin',
        message: `New order for ${service.name} from ${user.displayName}`,
        type: 'new_order',
        read: false,
        createdAt: serverTimestamp()
      });

      alert("Order placed successfully!");
      navigate('/dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-600 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight"
          >
            Professional Services <br />
            <span className="text-indigo-600">Delivered with Precision.</span>
          </motion.h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Find the best experts for your projects. From design to development, we've got you covered.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold">
              <CheckCircle className="w-4 h-4" /> 100% Satisfaction Guaranteed
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">
              <TrendingUp className="w-4 h-4" /> Top Rated Experts
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-bold transition-all",
                  selectedCategory === cat 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                    : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search services..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredServices.map((service, idx) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              <Link to={`/service/${service.id}`}>
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  <img 
                    src={service.imageUrl || `https://picsum.photos/seed/${service.name}/800/600`} 
                    alt={service.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-indigo-600">
                    ${service.price}
                  </div>
                </div>
              </Link>
              <div className="p-6">
                <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">{service.category}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-6">{service.description}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOrder(service)}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" /> Order
                  </button>
                  <Link 
                    to={`/service/${service.id}`}
                    className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredServices.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No services found</h3>
              <p className="text-gray-500">Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const ServiceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const unsubscribeService = onSnapshot(doc(db, 'services', id), (doc) => {
      if (doc.exists()) {
        setService({ id: doc.id, ...doc.data() } as Service);
      }
      setLoading(false);
    });

    const q = query(collection(db, 'reviews'), where('serviceId', '==', id));
    const unsubscribeReviews = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
    });

    return () => {
      unsubscribeService();
      unsubscribeReviews();
    };
  }, [id]);

  const handleOrder = async () => {
    if (!user || !service) return;
    try {
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        serviceId: service.id,
        status: 'pending',
        totalAmount: service.price,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      alert("Order placed successfully!");
      navigate('/dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!service) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Briefcase className="w-10 h-10 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h2>
      <p className="text-gray-500 mb-8">The service you're looking for doesn't exist or has been removed.</p>
      <Link to="/" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">
        Back to Services
      </Link>
    </div>
  );

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 'N/A';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="h-96 md:h-auto bg-gray-200">
              <img 
                src={service.imageUrl || `https://picsum.photos/seed/${service.name}/800/800`} 
                alt={service.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-10 flex flex-col justify-center">
              <div className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4">{service.category}</div>
              <h1 className="text-4xl font-black text-gray-900 mb-4">{service.name}</h1>
              <div className="flex items-center gap-4 mb-6">
                <StarRating rating={Math.round(Number(avgRating) || 0)} />
                <span className="text-sm font-bold text-gray-500">({reviews.length} reviews)</span>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed">{service.description}</p>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase">Price</div>
                  <div className="text-3xl font-black text-gray-900">${service.price}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-400 uppercase">Delivery</div>
                  <div className="text-lg font-bold text-gray-900">3-5 Days</div>
                </div>
              </div>
              <button 
                onClick={handleOrder}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-3"
              >
                <ShoppingBag className="w-6 h-6" /> Order Service
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Star className="w-6 h-6 text-amber-400 fill-current" /> Client Reviews
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map(review => (
              <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                      {review.userName[0]}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{review.userName}</div>
                      <div className="text-xs text-gray-500">{review.createdAt?.toDate ? format(review.createdAt.toDate(), 'MMM dd, yyyy') : 'Just now'}</div>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-gray-600 text-sm italic">"{review.comment}"</p>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-500">No reviews yet. Be the first to order and review!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewForm = ({ serviceId, onComplete }: { serviceId: string, onComplete: () => void }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        serviceId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        rating,
        comment,
        createdAt: serverTimestamp()
      });
      onComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reviews');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
      <h4 className="font-bold text-gray-900">Leave a Review</h4>
      <StarRating rating={rating} onRatingChange={setRating} interactive />
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Share your experience..."
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
      ></textarea>
      <button 
        type="submit" 
        disabled={submitting}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

const UserDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
      setLoading(false);
    });

    const servicesUnsubscribe = onSnapshot(collection(db, 'services'), (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    });

    return () => {
      unsubscribe();
      servicesUnsubscribe();
    };
  }, [user]);

  if (!user) return <div className="p-20 text-center">Please sign in to view your dashboard.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Track your orders and project progress.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <img src={user.photoURL || ''} alt="" className="w-16 h-16 rounded-full border-4 border-indigo-50" referrerPolicy="no-referrer" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{user.displayName}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-xl">
                  <div className="text-indigo-600 font-black text-2xl">{orders.length}</div>
                  <div className="text-xs font-bold text-indigo-400 uppercase">Total Orders</div>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl">
                  <div className="text-emerald-600 font-black text-2xl">
                    {orders.filter(o => o.status === 'completed').length}
                  </div>
                  <div className="text-xs font-bold text-emerald-400 uppercase">Completed</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" /> Recent Notifications
              </h3>
              <div className="space-y-4">
                <p className="text-sm text-gray-500 text-center py-4 italic">No new notifications</p>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-bold text-gray-900">Order History</h3>
                <span className="text-xs font-bold text-gray-400 uppercase">Real-time updates</span>
              </div>
              <div className="divide-y divide-gray-50">
                {orders.length > 0 ? orders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          order.status === 'completed' ? "bg-emerald-100 text-emerald-600" :
                          order.status === 'pending' ? "bg-amber-100 text-amber-600" :
                          order.status === 'rejected' ? "bg-red-100 text-red-600" : "bg-indigo-100 text-indigo-600"
                        )}>
                          {order.status === 'completed' ? <CheckCircle /> : <Clock />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-400 uppercase tracking-tighter">Order #{order.id.slice(0, 8)}</div>
                          <h4 className="font-bold text-gray-900">
                            {services.find(s => s.id === order.serviceId)?.name || 'Service Order'}
                          </h4>
                          <div className="text-xs text-gray-500">
                            {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'MMM dd, yyyy') : 'Just now'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-lg font-black text-gray-900">${order.totalAmount}</div>
                          <div className={cn(
                            "text-xs font-bold uppercase px-2 py-1 rounded-full inline-block",
                            order.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                            order.status === 'pending' ? "bg-amber-100 text-amber-700" :
                            order.status === 'rejected' ? "bg-red-100 text-red-700" : "bg-indigo-100 text-indigo-700"
                          )}>
                            {order.status}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {order.status === 'completed' && (
                            <button 
                              onClick={() => setReviewingOrderId(reviewingOrderId === order.id ? null : order.id)}
                              className="text-indigo-600 hover:text-indigo-800 font-bold text-sm"
                            >
                              {reviewingOrderId === order.id ? 'Cancel' : 'Review'}
                            </button>
                          )}
                          <Link to={`/service/${order.serviceId}`} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                            <ChevronRight className="w-6 h-6" />
                          </Link>
                        </div>
                      </div>
                    </div>
                    {reviewingOrderId === order.id && (
                      <div className="mt-6">
                        <ReviewForm 
                          serviceId={order.serviceId} 
                          onComplete={() => {
                            setReviewingOrderId(null);
                            alert("Review submitted!");
                          }} 
                        />
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="p-20 text-center">
                    <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500">You haven't placed any orders yet.</p>
                    <Link to="/" className="text-indigo-600 font-bold hover:underline mt-2 inline-block">Browse Services</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'services' | 'categories' | 'providers' | 'users'>('overview');
  const [orders, setOrders] = useState<any[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<UserProfile[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    imageUrl: 'https://picsum.photos/seed/service/800/600'
  });

  useEffect(() => {
    if (!isAdmin) return;
    
    const ordersUnsubscribe = onSnapshot(
      collection(db, 'orders'), 
      (snapshot) => {
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLastUpdated(new Date());
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'orders')
    );

    const servicesUnsubscribe = onSnapshot(
      collection(db, 'services'), 
      (snapshot) => {
        setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
        setLastUpdated(new Date());
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'services')
    );

    const categoriesUnsubscribe = onSnapshot(
      collection(db, 'categories'), 
      (snapshot) => {
        const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories(cats);
        setLastUpdated(new Date());
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'categories')
    );

    const providersUnsubscribe = onSnapshot(
      query(collection(db, 'users'), where('role', '==', 'provider')),
      (snapshot) => {
        setProviders(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
        setLastUpdated(new Date());
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'users')
    );

    const usersUnsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        setAllUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
        setLastUpdated(new Date());
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'users')
    );

    return () => {
      ordersUnsubscribe();
      servicesUnsubscribe();
      categoriesUnsubscribe();
      providersUnsubscribe();
      usersUnsubscribe();
    };
  }, [isAdmin]);

  // Set default category for new service if not set
  useEffect(() => {
    if (categories.length > 0 && !newService.category) {
      setNewService(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, newService.category]);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await updateDoc(doc(db, 'services', editingService.id), newService);
        setEditingService(null);
        alert("Service updated!");
      } else {
        await addDoc(collection(db, 'services'), {
          ...newService,
          rating: 5,
          reviewsCount: 0,
          createdAt: serverTimestamp()
        });
        alert("Service added!");
      }
      setNewService({ name: '', description: '', price: 0, category: '', imageUrl: 'https://picsum.photos/seed/service/800/600' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'services');
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setNewService({
      name: service.name,
      description: service.description,
      price: service.price,
      category: service.category,
      imageUrl: service.imageUrl || 'https://picsum.photos/seed/service/800/600'
    });
    setActiveTab('services');
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await deleteDoc(doc(db, 'services', id));
      alert("Service deleted!");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'services');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status, updatedAt: serverTimestamp() });
      alert(`Order status updated to ${status}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'orders');
    }
  };

  const handleAssignProvider = async (orderId: string, providerId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        providerId, 
        updatedAt: serverTimestamp() 
      });
      alert("Provider assigned successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role });
      alert(`User role updated to ${role}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), { name: newCategoryName });
        setEditingCategory(null);
        alert("Category updated!");
      } else {
        await addDoc(collection(db, 'categories'), { name: newCategoryName });
        alert("Category added!");
      }
      setNewCategoryName('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'categories');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure? This will not remove the category from existing services.')) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      alert("Category deleted!");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'categories');
    }
  };

  if (!isAdmin) return <div className="p-20 text-center font-bold text-red-600">Access Denied. Admins only.</div>;

  // Stats Calculations
  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;
  
  // Real chart data from orders
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }).reverse();

  const ordersByDay = last7Days.map(day => {
    const dayOrders = orders.filter(o => {
      if (!o.createdAt) return false;
      const date = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
      return date.toLocaleDateString('en-US', { weekday: 'short' }) === day;
    });
    const revenue = dayOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    return { name: day, orders: dayOrders.length, revenue };
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden lg:block">
        <div className="p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Management</h2>
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
                activeTab === 'overview' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <TrendingUp className="w-5 h-5" /> Overview
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
                activeTab === 'orders' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <ShoppingBag className="w-5 h-5" /> Orders
            </button>
            <button 
              onClick={() => setActiveTab('services')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
                activeTab === 'services' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Briefcase className="w-5 h-5" /> Services
            </button>
            <button 
              onClick={() => setActiveTab('categories')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
                activeTab === 'categories' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Filter className="w-5 h-5" /> Categories
            </button>
            <button 
              onClick={() => setActiveTab('providers')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
                activeTab === 'providers' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Users className="w-5 h-5" /> Providers
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
                activeTab === 'users' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Users className="w-5 h-5" /> All Users
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Admin Control</h1>
            <p className="text-gray-500">Manage your business operations in real-time.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setEditingService(null);
                setNewService({ name: '', description: '', price: 0, category: '', imageUrl: 'https://picsum.photos/seed/service/800/600' });
                setActiveTab('services');
              }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Service
            </button>
            <button 
              onClick={() => {
                setEditingCategory(null);
                setNewCategoryName('');
                setActiveTab('categories');
              }}
              className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Category
            </button>
            <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="font-bold text-gray-900">12 New Alerts</span>
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Real-time Overview</h3>
              {lastUpdated && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 animate-pulse">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Live • Last updated {format(lastUpdated, 'HH:mm:ss')}
                </div>
              )}
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'bg-indigo-50 text-indigo-600' },
                { label: 'Completed', value: completedOrdersCount, icon: CheckCircle, color: 'bg-blue-50 text-blue-600' },
                { label: 'Active Services', value: services.length, icon: Briefcase, color: 'bg-amber-50 text-amber-600' },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <stat.icon className="w-12 h-12" />
                  </div>
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", stat.color)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-black text-gray-900">{stat.value}</div>
                  <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveTab('services')}
                  className="p-6 border-2 border-dashed border-gray-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group text-left"
                >
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                    <Plus className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="font-bold text-gray-900">Add New Service</div>
                  <p className="text-sm text-gray-500">Expand your service catalog with new offerings.</p>
                </button>
                <button 
                  onClick={() => setActiveTab('categories')}
                  className="p-6 border-2 border-dashed border-gray-100 rounded-2xl hover:border-amber-200 hover:bg-amber-50/30 transition-all group text-left"
                >
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                    <Filter className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="font-bold text-gray-900">Manage Categories</div>
                  <p className="text-sm text-gray-500">Organize your services into logical groups.</p>
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="p-6 border-2 border-dashed border-gray-100 rounded-2xl hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group text-left"
                >
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                    <ShoppingBag className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="font-bold text-gray-900">Review Orders</div>
                  <p className="text-sm text-gray-500">Check and update the status of client orders.</p>
                </button>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Performance</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ordersByDay}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="orders" stroke="#4f46e5" strokeWidth={4} dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Revenue Performance</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ordersByDay}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value: number) => [`$${value}`, 'Revenue']}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Order ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Service</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Provider</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => {
                  const service = services.find(s => s.id === order.serviceId);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">#{order.id.slice(0, 8)}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{service?.name || 'Unknown Service'}</div>
                        <div className="text-xs text-gray-400">{service?.category}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">{order.userId.slice(0, 8)}...</td>
                    <td className="px-6 py-4 font-black text-gray-900">${order.totalAmount}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase",
                        order.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                        order.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.providerId || ''}
                        onChange={(e) => handleAssignProvider(order.id, e.target.value)}
                        className="text-xs bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Unassigned</option>
                        {providers.map(p => (
                          <option key={p.uid} value={p.uid}>{p.displayName || p.email}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleUpdateOrderStatus(order.id, 'rejected')}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </h3>
                <form onSubmit={handleAddService} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Service Name</label>
                    <input 
                      type="text" 
                      required
                      value={newService.name}
                      onChange={e => setNewService({...newService, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Price ($)</label>
                      <input 
                        type="number" 
                        required
                        value={newService.price}
                        onChange={e => setNewService({...newService, price: Number(e.target.value)})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category</label>
                      <select 
                        required
                        value={newService.category}
                        onChange={e => setNewService({...newService, category: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="" disabled>Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
                    <textarea 
                      required
                      value={newService.description}
                      onChange={e => setNewService({...newService, description: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Image URL</label>
                    <input 
                      type="url" 
                      required
                      value={newService.imageUrl}
                      onChange={e => setNewService({...newService, imageUrl: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                      {editingService ? 'Update Service' : 'Create Service'}
                    </button>
                    {editingService && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingService(null);
                          setNewService({ name: '', description: '', price: 0, category: '', imageUrl: 'https://picsum.photos/seed/service/800/600' });
                        }}
                        className="px-6 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-900">Current Catalog</div>
                <div className="divide-y divide-gray-50">
                  {services.map(service => (
                    <div key={service.id} className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
                          {service.imageUrl ? (
                            <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : service.name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{service.name}</h4>
                          <p className="text-xs text-gray-500">{service.category} • ${service.price}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditService(service)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteService(service.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category Name</label>
                    <input 
                      type="text" 
                      required
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                      {editingCategory ? 'Update' : 'Create'}
                    </button>
                    {editingCategory && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingCategory(null);
                          setNewCategoryName('');
                        }}
                        className="px-6 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-900">Categories List</div>
                <div className="divide-y divide-gray-50">
                  {categories.map(cat => (
                    <div key={cat.id} className="p-6 flex items-center justify-between">
                      <span className="font-bold text-gray-900">{cat.name}</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingCategory(cat);
                            setNewCategoryName(cat.name);
                          }}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div className="p-10 text-center text-gray-500 italic">No categories defined yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'providers' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-900">Service Providers</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Provider</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Email</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Assigned Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {providers.map(p => {
                    const assignedCount = orders.filter(o => o.providerId === p.uid).length;
                    return (
                      <tr key={p.uid} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img src={p.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-gray-200" referrerPolicy="no-referrer" />
                          <span className="font-bold text-gray-900">{p.displayName || 'Unnamed Provider'}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{p.email}</td>
                        <td className="px-6 py-4">
                          <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                            {assignedCount} Orders
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {providers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-20 text-center text-gray-500 italic">
                        No service providers found. Assign 'provider' role to users to see them here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-900">User Management</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Email</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allUsers.map(u => (
                    <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img src={u.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-gray-200" referrerPolicy="no-referrer" />
                        <span className="font-bold text-gray-900">{u.displayName || 'Unnamed User'}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <select 
                          value={u.role}
                          onChange={(e) => handleUpdateUserRole(u.uid, e.target.value)}
                          className="text-xs bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                        >
                          <option value="user">User</option>
                          <option value="provider">Provider</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- Provider Dashboard ---

const ProviderDashboard = () => {
  const { user, isProvider } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isProvider) return;

    const q = query(collection(db, 'orders'), where('providerId', '==', user.uid));
    const unsubscribeOrders = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(data);
      setLoading(false);
    });

    const unsubscribeServices = onSnapshot(collection(db, 'services'), (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    });

    return () => {
      unsubscribeOrders();
      unsubscribeServices();
    };
  }, [user, isProvider]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  if (!isProvider) return <div className="p-20 text-center">Access Denied. Provider role required.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">Provider Dashboard</h1>
            <p className="text-gray-600">Manage your assigned service orders.</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase">Assigned Orders</div>
              <div className="font-bold text-gray-900">{orders.length}</div>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-900">My Assigned Tasks</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Order ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Service</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => {
                  const service = services.find(s => s.id === order.serviceId);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">#{order.id.slice(0, 8)}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{service?.name || 'Unknown Service'}</div>
                        <div className="text-xs text-gray-400">{service?.category}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold uppercase",
                          order.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                          order.status === 'pending' ? "bg-amber-100 text-amber-700" :
                          order.status === 'in-progress' ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                        )}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'MMM dd, yyyy') : 'Just now'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {order.status === 'pending' && (
                            <button 
                              onClick={() => handleUpdateStatus(order.id, 'in-progress')}
                              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs font-bold transition-all shadow-sm"
                            >
                              Start Project
                            </button>
                          )}
                          {order.status === 'in-progress' && (
                            <button 
                              onClick={() => handleUpdateStatus(order.id, 'completed')}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-xs font-bold transition-all shadow-sm"
                            >
                              Mark Completed
                            </button>
                          )}
                          {order.status !== 'completed' && order.status !== 'rejected' && (
                            <button 
                              onClick={() => handleUpdateStatus(order.id, 'rejected')}
                              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 text-xs font-bold transition-all"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-gray-500 italic">
                      No orders assigned to you yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/provider" element={<ProviderDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/service/:id" element={<ServiceDetails />} />
              </Routes>
            </main>
            <footer className="bg-white border-t border-gray-100 py-12 px-4">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-gray-900">ServiFlow</span>
                </div>
                <div className="flex gap-8 text-sm text-gray-500 font-medium">
                  <Link to="/" className="hover:text-indigo-600 transition-colors">Terms</Link>
                  <Link to="/" className="hover:text-indigo-600 transition-colors">Privacy</Link>
                  <Link to="/" className="hover:text-indigo-600 transition-colors">Contact</Link>
                </div>
                <p className="text-sm text-gray-400">© 2026 ServiFlow. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
