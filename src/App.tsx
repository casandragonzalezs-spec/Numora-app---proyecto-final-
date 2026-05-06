import React, {
  Component,
  ErrorInfo,
  ReactNode,
  useState,
  useEffect,
  useRef,
} from "react";
import { useAuth, AuthProvider } from "./lib/AuthContext";
import { signInWithGoogle, logout } from "./lib/firebase";
import {
  analyzeFinancialReport,
  saveReport,
  getReports,
  Report,
  chatWithReport,
  chatWithAdvisor,
  ChatMessage,
  researchCompany,
  battleStocks,
} from "./lib/financialService";
import {
  getBotStatus,
  BotStatus,
  changeSymbol,
  executeOrder,
} from "./lib/botService";
import { generateStockNews, NewsArticle } from "./lib/geminiService";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Upload,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  LogOut,
  BarChart3,
  Activity,
  Plus,
  LayoutGrid,
  ChevronRight,
  FileSpreadsheet,
  History,
  Info,
  MessageSquare,
  Briefcase,
  LineChart as LineChartIcon,
  Newspaper,
  Tag,
  Search,
  X,
  Bell,
  Zap,
  ShieldCheck,
  BellOff,
  Sparkles,
  BrainCircuit,
  CheckCircle2,
  XCircle,
  Check,
  Globe,
  Settings2,
  Percent,
  PieChart,
  Shield,
  Coins,
  Dna,
  Atom,
  Swords,
  Trophy,
  Target,
  Send,
  User,
  Mic,
  MicOff,
} from "lucide-react";
import Markdown from "react-markdown";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { cn } from "./lib/utils";
import * as XLSX from "xlsx";

const SECTORS_DATA = [
  {
    id: "tech",
    name: "Tecnología",
    icon: Zap,
    companies: [
      { ticker: "AAPL", name: "Apple Inc." },
      { ticker: "MSFT", name: "Microsoft Corp." },
      { ticker: "NVDA", name: "NVIDIA Corp." },
      { ticker: "GOOGL", name: "Alphabet Inc." },
      { ticker: "AMZN", name: "Amazon.com Inc." },
      { ticker: "META", name: "Meta Platforms Inc." },
      { ticker: "TSLA", name: "Tesla Inc." },
      { ticker: "AVGO", name: "Broadcom Inc." },
      { ticker: "ORCL", name: "Oracle Corp." },
      { ticker: "ADBE", name: "Adobe Inc." },
    ],
  },
  {
    id: "health",
    name: "Salud",
    icon: Activity,
    companies: [
      { ticker: "UNH", name: "UnitedHealth Group" },
      { ticker: "LLY", name: "Eli Lilly" },
      { ticker: "JNJ", name: "Johnson & Johnson" },
      { ticker: "ABBV", name: "AbbVie Inc." },
      { ticker: "MRK", name: "Merck & Co." },
      { ticker: "TMO", name: "Thermo Fisher" },
      { ticker: "DHR", name: "Danaher Corp." },
      { ticker: "PFE", name: "Pfizer Inc." },
      { ticker: "ABT", name: "Abbott Labs" },
      { ticker: "AMGN", name: "Amgen Inc." },
    ],
  },
  {
    id: "finance",
    name: "Finanzas",
    icon: Briefcase,
    companies: [
      { ticker: "JPM", name: "JPMorgan Chase" },
      { ticker: "BAC", name: "Bank of America" },
      { ticker: "WFC", name: "Wells Fargo" },
      { ticker: "MS", name: "Morgan Stanley" },
      { ticker: "GS", name: "Goldman Sachs" },
      { ticker: "C", name: "Citigroup Inc." },
      { ticker: "BLK", name: "BlackRock Inc." },
      { ticker: "SCHW", name: "Charles Schwab" },
      { ticker: "V", name: "Visa Inc." },
      { ticker: "MA", name: "Mastercard Inc." },
    ],
  },
  {
    id: "energy",
    name: "Energía",
    icon: Zap,
    companies: [
      { ticker: "XOM", name: "Exxon Mobil" },
      { ticker: "CVX", name: "Chevron Corp." },
      { ticker: "SHEL", name: "Shell plc" },
      { ticker: "TTE", name: "TotalEnergies" },
      { ticker: "COP", name: "ConocoPhillips" },
      { ticker: "BP", name: "BP plc" },
      { ticker: "SLB", name: "Schlumberger" },
      { ticker: "EOG", name: "EOG Resources" },
      { ticker: "MPC", name: "Marathon Petroleum" },
      { ticker: "PSX", name: "Phillips 66" },
    ],
  },
  {
    id: "consumer",
    name: "Consumo",
    icon: Tag,
    companies: [
      { ticker: "AMZN", name: "Amazon.com" },
      { ticker: "WMT", name: "Walmart Inc." },
      { ticker: "HD", name: "Home Depot" },
      { ticker: "PG", name: "Procter & Gamble" },
      { ticker: "KO", name: "Coca-Cola Co." },
      { ticker: "PEP", name: "PepsiCo Inc." },
      { ticker: "COST", name: "Costco Wholesale" },
      { ticker: "NKE", name: "Nike Inc." },
      { ticker: "MCD", name: "McDonald's Corp." },
      { ticker: "TM", name: "Toyota Motor" },
    ],
  },
  {
    id: "comm",
    name: "Comunicación",
    icon: MessageSquare,
    companies: [
      { ticker: "GOOGL", name: "Alphabet Inc." },
      { ticker: "META", name: "Meta Platforms" },
      { ticker: "NFLX", name: "Netflix Inc." },
      { ticker: "DIS", name: "Walt Disney" },
      { ticker: "VZ", name: "Verizon" },
      { ticker: "T", name: "AT&T Inc." },
      { ticker: "CMCSA", name: "Comcast Corp." },
      { ticker: "TMUS", name: "T-Mobile US" },
      { ticker: "PARA", name: "Paramount Global" },
      { ticker: "WBD", name: "Warner Bros. Discovery" },
    ],
  },
  {
    id: "industrial",
    name: "Industrial",
    icon: LayoutGrid,
    companies: [
      { ticker: "GE", name: "General Electric" },
      { ticker: "CAT", name: "Caterpillar Inc." },
      { ticker: "UPS", name: "UPS Inc." },
      { ticker: "BA", name: "Boeing Co." },
      { ticker: "HON", name: "Honeywell Int." },
      { ticker: "DE", name: "Deere & Co." },
    ],
  },
];

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: string;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorInfo: "" };
    this.props = props;
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message || String(error) };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-red-100">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Algo salió mal
            </h1>
            <p className="text-gray-600 mb-6">
              Ha ocurrido un error inesperado en la aplicación.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-40 mb-6">
              <code className="text-xs text-red-600">
                {this.state.errorInfo}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              Reiniciar Aplicación
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Constants ---
interface PortfolioItem {
  symbol: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
}

const OLD_SECTORS_DATA = [
  {
    id: "tech",
    name: "Tecnología",
    companies: [
      { ticker: "AAPL", name: "Apple Inc." },
      { ticker: "MSFT", name: "Microsoft Corp." },
      { ticker: "NVDA", name: "NVIDIA Corp." },
      { ticker: "GOOGL", name: "Alphabet Inc." },
      { ticker: "AMZN", name: "Amazon.com Inc." },
      { ticker: "META", name: "Meta Platforms Inc." },
      { ticker: "TSLA", name: "Tesla Inc." },
      { ticker: "AVGO", name: "Broadcom Inc." },
      { ticker: "ORCL", name: "Oracle Corp." },
      { ticker: "ADBE", name: "Adobe Inc." },
    ],
  },
  {
    id: "health",
    name: "Salud",
    companies: [
      { ticker: "UNH", name: "UnitedHealth Group" },
      { ticker: "LLY", name: "Eli Lilly" },
      { ticker: "JNJ", name: "Johnson & Johnson" },
      { ticker: "ABBV", name: "AbbVie Inc." },
      { ticker: "MRK", name: "Merck & Co." },
      { ticker: "TMO", name: "Thermo Fisher" },
      { ticker: "DHR", name: "Danaher Corp." },
      { ticker: "PFE", name: "Pfizer Inc." },
      { ticker: "ABT", name: "Abbott Labs" },
      { ticker: "AMGN", name: "Amgen Inc." },
    ],
  },
  {
    id: "finance",
    name: "Finanzas",
    companies: [
      { ticker: "JPM", name: "JPMorgan Chase" },
      { ticker: "BAC", name: "Bank of America" },
      { ticker: "WFC", name: "Wells Fargo" },
      { ticker: "MS", name: "Morgan Stanley" },
      { ticker: "GS", name: "Goldman Sachs" },
      { ticker: "C", name: "Citigroup Inc." },
      { ticker: "BLK", name: "BlackRock Inc." },
      { ticker: "SCHW", name: "Charles Schwab" },
      { ticker: "V", name: "Visa Inc." },
      { ticker: "MA", name: "Mastercard Inc." },
    ],
  },
  {
    id: "energy",
    name: "Energía",
    companies: [
      { ticker: "XOM", name: "Exxon Mobil" },
      { ticker: "CVX", name: "Chevron Corp." },
      { ticker: "SHEL", name: "Shell plc" },
      { ticker: "TTE", name: "TotalEnergies" },
      { ticker: "COP", name: "ConocoPhillips" },
      { ticker: "BP", name: "BP plc" },
      { ticker: "SLB", name: "Schlumberger" },
      { ticker: "EOG", name: "EOG Resources" },
      { ticker: "MPC", name: "Marathon Petroleum" },
      { ticker: "PSX", name: "Phillips 66" },
    ],
  },
  {
    id: "consumer",
    name: "Consumo",
    companies: [
      { ticker: "AMZN", name: "Amazon.com" },
      { ticker: "WMT", name: "Walmart Inc." },
      { ticker: "HD", name: "Home Depot" },
      { ticker: "PG", name: "Procter & Gamble" },
      { ticker: "KO", name: "Coca-Cola Co." },
      { ticker: "PEP", name: "PepsiCo Inc." },
      { ticker: "COST", name: "Costco Wholesale" },
      { ticker: "NKE", name: "Nike Inc." },
      { ticker: "MCD", name: "McDonald's Corp." },
      { ticker: "TM", name: "Toyota Motor" },
    ],
  },
  {
    id: "comm",
    name: "Comunicación",
    companies: [
      { ticker: "GOOGL", name: "Alphabet Inc." },
      { ticker: "META", name: "Meta Platforms" },
      { ticker: "NFLX", name: "Netflix Inc." },
      { ticker: "DIS", name: "Walt Disney" },
      { ticker: "VZ", name: "Verizon" },
      { ticker: "T", name: "AT&T Inc." },
      { ticker: "CMCSA", name: "Comcast Corp." },
      { ticker: "TMUS", name: "T-Mobile US" },
      { ticker: "CHTR", name: "Charter Comm." },
      { ticker: "WBD", name: "Warner Bros." },
    ],
  },
  {
    id: "industrial",
    name: "Industrial",
    companies: [
      { ticker: "GE", name: "General Electric" },
      { ticker: "CAT", name: "Caterpillar Inc." },
      { ticker: "UPS", name: "UPS Inc." },
      { ticker: "BA", name: "Boeing Co." },
      { ticker: "HON", name: "Honeywell Int." },
      { ticker: "DE", name: "Deere & Co." },
      { ticker: "MMM", name: "3M Company" },
      { ticker: "LMT", name: "Lockheed Martin" },
      { ticker: "RTX", name: "Raytheon Tech" },
      { ticker: "UNP", name: "Union Pacific" },
    ],
  },
  {
    id: "realestate",
    name: "Inmobiliario",
    companies: [
      { ticker: "AMT", name: "American Tower" },
      { ticker: "PLD", name: "Prologis Inc." },
      { ticker: "EQIX", name: "Equinix Inc." },
      { ticker: "CCI", name: "Crown Castle" },
      { ticker: "PSA", name: "Public Storage" },
      { ticker: "DLR", name: "Digital Realty" },
      { ticker: "O", name: "Realty Income" },
      { ticker: "WELL", name: "Welltower Inc." },
      { ticker: "SPG", name: "Simon Property" },
      { ticker: "VICI", name: "VICI Properties" },
    ],
  },
];

// --- Components ---

const Login = () => {
  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Atmosphere */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#10B981]/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center relative z-10"
      >
        <div className="w-16 h-16 bg-[#10B981] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20">
          <ChevronRight className="w-8 h-8 text-black rotate-[-45deg]" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter mb-4">
          NUMORA
        </h1>
        <p className="text-sm text-slate-400 font-medium mb-12">
          Advanced AI platform for corporate financial analysis.
        </p>

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-xl font-bold text-sm hover:bg-white/90 transition-all active:scale-[0.98] shadow-lg"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg"
            className="w-5 h-5"
            alt=""
          />
          Continue with Google
        </button>

        <p className="mt-12 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600">
          Enterprise Access Only
        </p>
      </motion.div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [view, setView] = useState<
    | "analysis"
    | "history"
    | "bot"
    | "sectors"
    | "portfolio"
    | "news"
    | "alerts"
    | "battle"
    | "alpha"
    | "chat"
  >("analysis");
  const [selectedNews, setSelectedNews] = useState<any | null>(null);
  const [activeAlertCategory, setActiveAlertCategory] =
    useState<string>("Todas");
  const [alerts, setAlerts] = useState<
    {
      id: number | string;
      title: string;
      desc: string;
      time: string;
      type: string;
      priority: string;
    }[]
  >([
    {
      id: 1,
      title: "Ruptura de Triángulo Ascendente en AAPL",
      desc: "El precio ha cruzado la resistencia de los $192.50 con volumen superior al promedio (1.5x). Posible carrera alcista confirmada.",
      time: "Hace 4 min",
      type: "Técnicas",
      priority: "High",
    },
    {
      id: 2,
      title: "Anuncio de Dividendos: KO",
      desc: "Coca-Cola ha confirmado un incremento del 4% en el pago de dividendos trimestrales. Fecha ex-dividend: Mayo 15.",
      time: "Hace 1 hora",
      type: "Fundamentales",
      priority: "Medium",
    },
    {
      id: 3,
      title: "Volatilidad Inusual en NVDA",
      desc: "Detección de órdenes 'whale' (ballenas) en el mercado de opciones CALL con vencimiento a corto plazo.",
      time: "Hace 3 horas",
      type: "Seguridad", // Changed to match category
      priority: "High",
    },
    {
      id: 4,
      title: "Apertura de Gap Bajista: TSLA",
      desc: "Tesla abre con un gap negativo después de reportes de retraso en la producción del Cybertruck en Texas.",
      time: "Hace 5 horas",
      type: "Anuncios", // Changed to match category
      priority: "Low",
    },
  ]);
  const [viewingAlert, setViewingAlert] = useState<any | null>(null);
  const [showSmartMatch, setShowSmartMatch] = useState(false);
  const [matchStep, setMatchStep] = useState(0);

  // Battle State
  const [battleCompetitors, setBattleCompetitors] = useState<any[]>([]);
  const [isBattling, setIsBattling] = useState(false);
  const [battleResult, setBattleResult] = useState<any | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [battleInputs, setBattleInputs] = useState<string[]>(["", ""]);
  const [battleChartsData, setBattleChartsData] = useState<{[key: string]: {time: string, price: number}[]}>({});

  // Portfolio Scanner State
  const [isScanningPortfolio, setIsScanningPortfolio] = useState(false);
  const [portfolioScanResult, setPortfolioScanResult] = useState<string | null>(
    null,
  );

  const [activeSector, setActiveSector] = useState(SECTORS_DATA[0].id);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [performanceHistory, setPerformanceHistory] = useState<
    { time: string; price: number; rsi: number }[]
  >([]);
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [botStats, setBotStats] = useState({
    tradesCount: 12,
    totalProfit: 2450.75,
    strategy: "Trend Following EMA",
    accuracy: 68.5,
    winRate: 0.65,
  });
  const [botLogs, setBotLogs] = useState<
    { timestamp: string; message: string; type?: "signal" | "info" }[]
  >([]);
  const [symbolInput, setSymbolInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isChangingSymbol, setIsChangingSymbol] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [marketNews, setMarketNews] = useState<NewsArticle[]>([]);
  const [isFetchingNews, setIsFetchingNews] = useState(false);
  const [newsLimit, setNewsLimit] = useState(6);
  const [newsSearchInput, setNewsSearchInput] = useState("");
  const [activeNewsSymbol, setActiveNewsSymbol] = useState("");
  const [showThresholdConfig, setShowThresholdConfig] = useState(false);

  // IA Chat State
  const [advisorChatMessages, setAdvisorChatMessages] = useState<ChatMessage[]>(
    [
      {
        role: "assistant",
        content:
          "Hola. Soy tu consultor financiero IA. Puedo ayudarte con estrategias de inversión, análisis de mercado o dudas sobre cómo gestionar tu capital. ¿En qué puedo apoyarte hoy?",
      },
    ],
  );
  const [advisorChatInput, setAdvisorChatInput] = useState("");
  const [isTypingAdvisor, setIsTypingAdvisor] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const advisorChatEndRef = useRef<HTMLDivElement>(null);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setAdvisorChatInput((prev) => prev + (prev ? " " : "") + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const scrollToAdvisorBottom = () => {
    advisorChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToAdvisorBottom();
  }, [advisorChatMessages]);

  const handleAdvisorSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorChatInput.trim() || isTypingAdvisor) return;

    const userMsg = advisorChatInput.trim();
    const currentHistory = [...advisorChatMessages];

    setAdvisorChatInput("");
    setAdvisorChatMessages((prev) => [
      ...prev,
      { role: "user", content: userMsg },
    ]);
    setIsTypingAdvisor(true);

    try {
      const aiResponse = await chatWithAdvisor(
        userMsg,
        currentHistory,
        botStatus,
        (action, data) => {
          // Visual feedback for actions taken by the IA
          if (action === "order_executed") {
            setAlerts((prev) => [
              {
                id: Date.now(),
                title: `Orden IA Ejecutada: ${data.action} ${data.shares}`,
                desc: `El Consultor IA ha ejecutado una orden de ${data.action === "BUY" ? "compra" : "venta"} por ${data.shares} acciones.`,
                time: "Ahora",
                priority: "High",
                type: "Operaciones",
              },
              ...prev,
            ]);

            setBotLogs((prev) =>
              [
                {
                  timestamp: new Date().toLocaleTimeString(),
                  message: `IA ACTION: Orden de ${data.action} ejecutada (${data.shares} acciones)`,
                  type: "signal" as const,
                },
                ...prev,
              ].slice(0, 50),
            );
          } else if (action === "symbol_change") {
            setAlerts((prev) => [
              {
                id: Date.now(),
                title: `Cambio de Símbolo: ${data.symbol}`,
                desc: `El Consultor IA ha redirigido el monitoreo del bot hacia ${data.symbol}.`,
                time: "Ahora",
                priority: "Medium",
                type: "Sistema",
              },
              ...prev,
            ]);
          }
        },
      );

      setAdvisorChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ]);
    } catch (err) {
      console.error("Chat Error:", err);
      setAdvisorChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Hubo un error de conexión con mi terminal neuronal. Por favor, intenta de nuevo.",
        },
      ]);
    } finally {
      setIsTypingAdvisor(false);
    }
  };

  // Trading Thresholds State
  const [thresholds, setThresholds] = useState({
    rsiOverbought: 70,
    rsiOversold: 30,
    priceChangeAlert: 2.5, // alert if price changes more than 2.5%
  });
  const [lastAlertPrice, setLastAlertPrice] = useState<number | null>(null);

  // Trade Panel State
  const [sharesToTrade, setSharesToTrade] = useState(1);
  const [isTrading, setIsTrading] = useState(false);
  const [tradeStatus, setTradeStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [tradeMessage, setTradeMessage] = useState("");

  // Chat State
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "ai"; content: string }[]
  >([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedReport || isTyping) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsTyping(true);

    try {
      const response = await chatWithReport(selectedReport, userMsg);
      setChatMessages((prev) => [...prev, { role: "ai", content: response }]);
    } catch (error) {
      console.error(error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "Lo siento, hubo un error al procesar tu pregunta. Por favor intenta de nuevo.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (user) {
      const unsubscribe = getReports(user.uid, (newReports) => {
        setReports(newReports);
      });

      // Status del Bot
      const fetchBotStatus = async () => {
        try {
          const status = await getBotStatus();

          if (status) {
            setPerformanceHistory((prev) => {
              const now = new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });
              const newData = [
                ...prev,
                { time: now, price: status.last_price, rsi: status.rsi || 0 },
              ];
              if (newData.length > 50) return newData.slice(1);
              return newData;
            });

            // Price Change Alert
            if (lastAlertPrice) {
              const priceChange =
                Math.abs(
                  (status.last_price - lastAlertPrice) / lastAlertPrice,
                ) * 100;
              if (priceChange >= thresholds.priceChangeAlert) {
                setBotLogs((prev) =>
                  [
                    {
                      timestamp: new Date().toLocaleTimeString(),
                      message: `ALERTA DE PRECIO: Movimiento de ${priceChange.toFixed(2)}% detectado en ${status.symbol}`,
                      type: "signal" as const,
                    },
                    ...prev,
                  ].slice(0, 50),
                );

                setAlerts((prev) => [
                  {
                    id: Date.now().toString(),
                    title: `Volatilidad detectada: ${status.symbol}`,
                    desc: `El precio ha cambiado un ${priceChange.toFixed(2)}% desde la última alerta. Precio actual: $${status.last_price.toFixed(3)}`,
                    time: "Ahora",
                    priority: "High",
                    type: "Técnicas",
                  },
                  ...prev,
                ]);

                setLastAlertPrice(status.last_price);
              }
            } else {
              setLastAlertPrice(status.last_price);
            }

            // RSI Alerts
            if (status.rsi >= thresholds.rsiOverbought) {
              const exists = alerts.some(
                (a) =>
                  a.title.includes("Sobrecompra") &&
                  a.desc.includes(status.symbol),
              );
              if (!exists) {
                setAlerts((prev) => [
                  {
                    id: `rsi-high-${Date.now()}`,
                    title: `RSI Sobrecompra: ${status.symbol}`,
                    desc: `El RSI de ${status.symbol} ha alcanzado ${status.rsi.toFixed(2)}, indicando una posible condición de sobrecompra.`,
                    time: "Ahora",
                    priority: "Medium",
                    type: "Técnicas",
                  },
                  ...prev,
                ]);
              }
            } else if (status.rsi <= thresholds.rsiOversold) {
              const exists = alerts.some(
                (a) =>
                  a.title.includes("Sobreventa") &&
                  a.desc.includes(status.symbol),
              );
              if (!exists) {
                setAlerts((prev) => [
                  {
                    id: `rsi-low-${Date.now()}`,
                    title: `RSI Sobreventa: ${status.symbol}`,
                    desc: `El RSI de ${status.symbol} ha caído a ${status.rsi.toFixed(2)}, indicando una posible condición de sobreventa.`,
                    time: "Ahora",
                    priority: "Medium",
                    type: "Técnicas",
                  },
                  ...prev,
                ]);
              }
            }
          }

          setBotStatus(status);

          // Agregar log si hay cambio significativo o cada cierto tiempo
          setBotLogs((prev) => {
            if (!status) return prev;

            const newLog = {
              timestamp: new Date().toLocaleTimeString(),
              message: `Actualización ${status.symbol}: $${(status.last_price || 0).toFixed(3)} | RSI: ${(status.rsi || 0).toFixed(2)}`,
              type: "info" as const,
            };

            let logs = [newLog, ...prev];

            // Si hay señal extremas, agregar log especial
            if (status.rsi && status.rsi < 35) {
              logs = [
                {
                  timestamp: new Date().toLocaleTimeString(),
                  message: `>>> SEÑAL DE COMPRA: RSI EN ${status.rsi.toFixed(2)}`,
                  type: "signal" as const,
                },
                ...logs,
              ];
            } else if (status.rsi && status.rsi > 65) {
              logs = [
                {
                  timestamp: new Date().toLocaleTimeString(),
                  message: `>>> SEÑAL DE VENTA: RSI EN ${status.rsi.toFixed(2)}`,
                  type: "signal" as const,
                },
                ...logs,
              ];
            }

            return logs.slice(0, 50); // Mantener últimos 50
          });
        } catch (err) {
          console.error("Bot not reachable yet");
        }
      };

      fetchBotStatus();
      const botInterval = setInterval(fetchBotStatus, 2000);

      return () => {
        unsubscribe();
        clearInterval(botInterval);
      };
    }
  }, [user]);

  // Fetch news when symbol changes or news view is active
  useEffect(() => {
    const fetchNews = async (symbolToFetch: string) => {
      setIsFetchingNews(true);
      setNewsLimit(6); // Reset limit on new search or context change
      try {
        const news = await generateStockNews(symbolToFetch);
        setMarketNews(news);
        setActiveNewsSymbol(symbolToFetch);
      } catch (err) {
        console.error("Error fetching market news:", err);
      } finally {
        setIsFetchingNews(false);
      }
    };

    if (view === "news" && botStatus?.symbol && activeNewsSymbol !== botStatus.symbol) {
      fetchNews(botStatus.symbol);
    }
  }, [view, botStatus?.symbol, activeNewsSymbol]);

  const handleNewsSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsSearchInput.trim()) return;

    setIsFetchingNews(true);
    try {
      const news = await generateStockNews(newsSearchInput.toUpperCase());
      setMarketNews(news);
      setActiveNewsSymbol(newsSearchInput.toUpperCase());
    } catch (err) {
      console.error("Error searching news:", err);
    } finally {
      setIsFetchingNews(false);
      setNewsSearchInput("");
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (!user || acceptedFiles.length === 0) return;

    setAnalyzing(true);
    const file = acceptedFiles[0];

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const analysis = await analyzeFinancialReport(
        base64,
        file.type,
        file.name,
      );
      const reportId = await saveReport(user.uid, analysis);

      // After analysis, we want to show the results
      if (reportId) {
        // We need the full report object to select it
        // Since getReports is real-time, it will be in the reports state soon
        // But for immediate feedback, we can wait a bit or just let the user pick it
        // Better: the reports state will update, we can find it there
        setView("analysis");
      }
      setAnalyzing(false);

      // Auto-change bot symbol if identified
      if (analysis.ticker) {
        try {
          const sanitizedTicker = analysis.ticker
            .trim()
            .toUpperCase()
            .split(" ")[0]
            .replace(/[^A-Z0-9_]/g, "");
          if (sanitizedTicker) {
            await changeSymbol(sanitizedTicker);
            const newStatus = await getBotStatus();
            setBotStatus(newStatus);
          }
        } catch (botErr) {
          console.error("No se pudo sincronizar el bot:", botErr);
        }
      }
    } catch (error) {
      console.error("Error analyzing file:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      alert(
        `Error al analizar el archivo: ${errorMessage}\n\nPor favor, asegúrate de estar conectado a Internet e intenta de nuevo.`,
      );
      setAnalyzing(false);
    }
  };

  const handleBattle = async (e: React.FormEvent) => {
    e.preventDefault();
    const tickers = battleInputs
      .map((t) => t.trim().toUpperCase())
      .filter((t) => t !== "");

    if (tickers.length < 2) return;

    setIsBattling(true);
    setBattleResult(null);
    setBattleChartsData({});

    try {
      const result = await battleStocks(tickers);

      if (result && result.competitors && Array.isArray(result.competitors)) {
        // Generate mock chart data for each competitor
        const newChartsData: { [key: string]: { time: string; price: number }[] } =
          {};
        tickers.forEach((ticker) => {
          const basePrice = 100 + Math.random() * 900;
          const data = Array.from({ length: 20 }, (_, i) => ({
            time: i.toString(),
            price: basePrice * (1 + (Math.random() - 0.5) * 0.1),
          }));
          newChartsData[ticker] = data;
        });
        setBattleChartsData(newChartsData);
        setBattleResult(result);
      } else {
        throw new Error("La IA devolvió un formato de batalla inválido.");
      }
    } catch (error) {
      console.error("Error al iniciar batalla:", error);
      alert("No se pudo completar el duelo de acciones. Por favor, verifica los tickers e intenta de nuevo.");
    } finally {
      setIsBattling(false);
    }
  };

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !searchQuery.trim() || isResearching) return;

    setIsResearching(true);
    try {
      const research = await researchCompany(searchQuery);
      const reportId = await saveReport(user.uid, research);
      if (reportId) {
        setSearchQuery("");
        setView("analysis");

        // Auto-sync bot symbol
        if (research.ticker) {
          try {
            const sanitizedTicker = research.ticker
              .trim()
              .toUpperCase()
              .split(" ")[0]
              .replace(/[^A-Z0-9_]/g, "");
            if (sanitizedTicker) {
              await changeSymbol(sanitizedTicker);
              const newStatus = await getBotStatus();
              setBotStatus(newStatus);
            }
          } catch (botErr) {
            console.error("No se pudo sincronizar el bot:", botErr);
          }
        }
      }
    } catch (error) {
      console.error("Error researching company:", error);
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      alert(
        `Error: ${errorMessage}\nIntente con otro nombre de empresa.`,
      );
    } finally {
      setIsResearching(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    multiple: false,
  } as any);

  // Auto-select the newest report after analysis completes
  useEffect(() => {
    if (
      reports.length > 0 &&
      analyzing === false &&
      !selectedReport &&
      view === "analysis"
    ) {
      // If we just finished analyzing, the newest report (first in list) should be selected
      // We check if the newest report was created within the last 30 seconds to be sure
      const newest = reports[0];
      const now = Date.now();
      const created = new Date(newest.createdAt).getTime();
      if (now - created < 30000) {
        setSelectedReport(newest);
      }
    }
  }, [reports, analyzing, selectedReport, view]);

  const toggleComparison = (id: string) => {
    setComparisonIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id].slice(-2),
    );
  };

  const handleUpdateSymbol = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSymbol = symbolInput.trim().toUpperCase();
    if (!newSymbol || isChangingSymbol) return;

    setIsChangingSymbol(true);
    try {
      await changeSymbol(newSymbol);

      // Actualizamos localmente el símbolo para feedback visual inmediato
      setBotStatus((prev) => (prev ? { ...prev, symbol: newSymbol } : null));

      // Esperamos un segundo para que el servidor procese el cambio
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const status = await getBotStatus();
      setBotStatus(status);
      setSymbolInput("");
    } catch (err) {
      console.error("Error al actualizar símbolo:", err);
    } finally {
      setIsChangingSymbol(false);
    }
  };

  const handleOrder = async (action: "BUY" | "SELL") => {
    if (isTrading || !botStatus) return;

    setIsTrading(true);
    setTradeStatus("idle");
    try {
      const result = await executeOrder(action, sharesToTrade);
      setTradeStatus("success");

      // Agregar log de la orden a la terminal
      const executionPrice = botStatus?.last_price || 0;
      setBotLogs((prev) =>
        [
          {
            timestamp: new Date().toLocaleTimeString(),
            message: `>>> EXECUTED ${action}: ${sharesToTrade} SHARES AT $${executionPrice.toFixed(3)}`,
            type: "signal" as const,
          },
          ...prev,
        ].slice(0, 50),
      );

      setBotStats((prev) => ({
        ...prev,
        tradesCount: prev.tradesCount + 1,
        totalProfit:
          prev.totalProfit +
          (action === "SELL" ? executionPrice * 0.02 * sharesToTrade : 0), // Simulated profit for demo
      }));

      // Update local portfolio
      setPortfolio((prev) => {
        const existing = prev.find((i) => i.symbol === botStatus.symbol);
        if (action === "BUY") {
          if (existing) {
            const newTotal = existing.shares + sharesToTrade;
            const newAvg =
              (existing.avgPrice * existing.shares +
                botStatus.last_price * sharesToTrade) /
              newTotal;
            return prev.map((i) =>
              i.symbol === botStatus.symbol
                ? {
                    ...i,
                    shares: newTotal,
                    avgPrice: newAvg,
                    currentPrice: botStatus.last_price,
                  }
                : i,
            );
          } else {
            return [
              ...prev,
              {
                symbol: botStatus.symbol,
                shares: sharesToTrade,
                avgPrice: botStatus.last_price,
                currentPrice: botStatus.last_price,
              },
            ];
          }
        } else {
          if (existing) {
            const newTotal = Math.max(0, existing.shares - sharesToTrade);
            if (newTotal === 0)
              return prev.filter((i) => i.symbol !== botStatus.symbol);
            return prev.map((i) =>
              i.symbol === botStatus.symbol
                ? { ...i, shares: newTotal, currentPrice: botStatus.last_price }
                : i,
            );
          }
        }
        return prev;
      });

      setTradeMessage(
        `Orden de ${action} por ${sharesToTrade} unidades ejecutada con éxito.`,
      );
      setTimeout(() => setTradeStatus("idle"), 5000);
    } catch (err) {
      setTradeStatus("error");
      setTradeMessage("Error al ejecutar la orden en el servidor.");
    } finally {
      setIsTrading(false);
    }
  };

  const handleStartTrading = async (ticker: string) => {
    // Limpiamos el estado de selección para evitar que el bot se oculte por el análisis
    setSelectedReport(null);
    setSymbolInput(ticker);
    setView("bot");
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Si el bot no está ya en este símbolo, lo actualizamos automáticamente
    if (botStatus?.symbol !== ticker) {
      setIsChangingSymbol(true);
      try {
        await changeSymbol(ticker);
        // Esperamos un poco para que el bot se reinicie
        await new Promise((r) => setTimeout(r, 1500));
        const status = await getBotStatus();
        setBotStatus(status);
      } catch (err) {
        console.error("Error auto-updating symbol:", err);
      } finally {
        setIsChangingSymbol(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex text-slate-200 font-sans relative overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0F1219] border-r border-white/5 flex flex-col relative z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#10B981] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ChevronRight className="w-6 h-6 text-black rotate-[-45deg]" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">
              NUMORA
            </span>
          </div>

          <nav className="space-y-1 py-6 px-2">
            <button
              onClick={() => {
                setSelectedReport(null);
                setView("analysis");
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                view === "analysis" && !selectedReport
                  ? "bg-white/5 text-white"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]",
              )}
            >
              <Plus className="w-5 h-5" />
              Nuevo Análisis
            </button>
            <button
              onClick={() => {
                setView("history");
                setSelectedReport(null);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                view === "history"
                  ? "bg-white/5 text-white"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]",
              )}
            >
              <History className="w-5 h-5" />
              Historial
            </button>
            <button
              onClick={() => {
                setView("bot");
                setSelectedReport(null);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                view === "bot"
                  ? "bg-white/5 text-white"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]",
              )}
            >
              <Activity className="w-5 h-5" />
              Trading Bot
            </button>
            <button
              onClick={() => {
                setView("sectors");
                setSelectedReport(null);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                view === "sectors"
                  ? "bg-white/5 text-white"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]",
              )}
            >
              <LayoutGrid className="w-5 h-5" />
              Sectores
            </button>
            <button
              onClick={() => {
                setView("portfolio");
                setSelectedReport(null);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                view === "portfolio"
                  ? "bg-white/5 text-white"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]",
              )}
            >
              <Briefcase className="w-5 h-5" />
              Portafolio
            </button>
            <button
              onClick={() => {
                setView("chat");
                setSelectedReport(null);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                view === "chat"
                  ? "bg-white/5 text-emerald-500"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]",
              )}
            >
              <MessageSquare className="w-5 h-5" />
              Consultor IA
            </button>
            <button
              onClick={() => {
                setView("news");
                setSelectedReport(null);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                view === "news"
                  ? "bg-white/5 text-white"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]",
              )}
            >
              <Newspaper className="w-5 h-5" />
              Noticias
            </button>
            <button
              onClick={() => {
                setView("alerts");
                setSelectedReport(null);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                view === "alerts"
                  ? "bg-white/5 text-emerald-500"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]",
              )}
            >
              <div className="relative">
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#0A0D12]" />
              </div>
              Alertas
            </button>

            <button
              onClick={() => {
                setView("battle");
                setSelectedReport(null);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                view === "battle"
                  ? "bg-white/5 text-purple-400"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]",
              )}
            >
              <Swords className="w-5 h-5" />
              AI Stock Battle
            </button>
            <button
              onClick={() => {
                setView("alpha");
                setSelectedReport(null);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                view === "alpha"
                  ? "bg-white/5 text-emerald-500"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]",
              )}
            >
              <Zap className="w-5 h-5" />
              Smart Match
            </button>
          </nav>
        </div>

        <div className="flex-1 px-8 py-4 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Recientes
            </h3>
          </div>
          <div className="space-y-1">
            {reports.slice(0, 5).map((report) => (
              <button
                key={report.id}
                onClick={() => {
                  setSelectedReport(report);
                  setView("analysis");
                }}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all truncate",
                  selectedReport?.id === report.id
                    ? "bg-white/[0.04] text-white"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.01]",
                )}
              >
                {report.companyName}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={user?.photoURL || ""}
                alt=""
                className="w-8 h-8 rounded-lg bg-white/10"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white truncate w-24">
                  {user?.displayName}
                </span>
                <span className="text-[10px] text-slate-600 font-bold">
                  Premium
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-slate-600 hover:text-red-400"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-12 z-10">
          <div className="relative w-96 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Activity className="w-4 h-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Busca una empresa (ej. AAPL, TSLA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleResearch(e)}
              className="w-full bg-[#151921] border border-white/5 rounded-xl py-2.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-emerald-500/30 transition-all"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">
                Analista Chief
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <span className="text-[10px] font-black text-emerald-500">
                  AN
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <AnimatePresence mode="wait">
            {selectedReport ? (
              <motion.div
                key={selectedReport.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                {/* Header Analysis */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Análisis Finalizado
                      </span>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tight">
                      {selectedReport.companyName}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">
                      {selectedReport.sector} • {selectedReport.period}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (!selectedReport) return;

                        const workbook = XLSX.utils.book_new();

                        // 1. Summary Sheet
                        const summaryData = [
                          ["REPORTE ESTRATÉGICO - NUMORA AI"],
                          [""],
                          ["Compañía", selectedReport.companyName],
                          ["Símbolo (Ticker)", selectedReport.ticker || "N/A"],
                          ["Sector", selectedReport.sector],
                          ["Periodo", selectedReport.period],
                          [
                            "Fecha de Creación",
                            new Date(selectedReport.createdAt).toLocaleString(),
                          ],
                          [""],
                          ["DETERMINACIÓN DE INVERSIÓN"],
                          [
                            "Veredicto",
                            selectedReport.investmentRecommendation?.verdict,
                          ],
                          [
                            "Score de Atractivo",
                            `${selectedReport.investmentRecommendation?.score}/100`,
                          ],
                          [
                            "Justificación",
                            selectedReport.investmentRecommendation
                              ?.justification,
                          ],
                          [""],
                          ["RESUMEN EJECUTIVO"],
                          [
                            "Análisis",
                            selectedReport.analysis
                              .replace(/#/g, "")
                              .replace(/\*/g, ""),
                          ],
                        ];
                        const summarySheet =
                          XLSX.utils.aoa_to_sheet(summaryData);
                        XLSX.utils.book_append_sheet(
                          workbook,
                          summarySheet,
                          "Resumen",
                        );

                        // 2. Metrics vs Benchmark
                        const metricsHeaders = [
                          "Métrica",
                          "Valor Empresa",
                          "Promedio Sector (Benchmark)",
                          "Estado",
                        ];
                        const getStatus = (
                          val: number,
                          bench: number,
                          higherIsBetter = true,
                        ) => {
                          if (higherIsBetter)
                            return val >= bench ? "Superior" : "Inferior";
                          return val <= bench
                            ? "Superior (Menor Riesgo)"
                            : "Inferior (Mayor Riesgo)";
                        };

                        const metricsData = [
                          metricsHeaders,
                          [
                            "Liquidez Corriente",
                            selectedReport.data.liquidez,
                            selectedReport.benchmark.avgLiquidez,
                            getStatus(
                              selectedReport.data.liquidez,
                              selectedReport.benchmark.avgLiquidez,
                            ),
                          ],
                          [
                            "Apalancamiento (Deuda/Patrimonio)",
                            selectedReport.data.apalancamiento,
                            selectedReport.benchmark.avgApalancamiento,
                            getStatus(
                              selectedReport.data.apalancamiento,
                              selectedReport.benchmark.avgApalancamiento,
                              false,
                            ),
                          ],
                          [
                            "Margen EBITDA",
                            (
                              Number(selectedReport.data?.margenEbitda || 0) *
                              100
                            ).toFixed(2) + "%",
                            (
                              Number(
                                selectedReport.benchmark?.avgMargenEbitda || 0,
                              ) * 100
                            ).toFixed(2) + "%",
                            getStatus(
                              Number(selectedReport.data?.margenEbitda || 0),
                              Number(
                                selectedReport.benchmark?.avgMargenEbitda || 0,
                              ),
                            ),
                          ],
                          [
                            "Rentabilidad (Margen Neto)",
                            (
                              Number(selectedReport.data?.rentabilidad || 0) *
                              100
                            ).toFixed(2) + "%",
                            "N/A",
                            "N/A",
                          ],
                          [
                            "Riesgo Sintético (1-10)",
                            Number(selectedReport.data?.riesgoSintetico || 0),
                            "N/A",
                            Number(selectedReport.data?.riesgoSintetico || 0) <=
                            4
                              ? "Bajo"
                              : Number(
                                    selectedReport.data?.riesgoSintetico || 0,
                                  ) <= 7
                                ? "Medio"
                                : "Alto",
                          ],
                        ];
                        const metricsSheet =
                          XLSX.utils.aoa_to_sheet(metricsData);
                        XLSX.utils.book_append_sheet(
                          workbook,
                          metricsSheet,
                          "Métricas y Benchmark",
                        );

                        // 3. Historical Data
                        if (
                          selectedReport.historicalData &&
                          selectedReport.historicalData.length > 0
                        ) {
                          const histHeaders = [
                            "Año/Periodo",
                            "Ventas (Revenue)",
                            "EBITDA",
                            "Utilidad Neta (Net Income)",
                          ];
                          const histRows = selectedReport.historicalData.map(
                            (h) => [h.date, h.revenue, h.ebitda, h.netIncome],
                          );
                          const histSheet = XLSX.utils.aoa_to_sheet([
                            histHeaders,
                            ...histRows,
                          ]);
                          XLSX.utils.book_append_sheet(
                            workbook,
                            histSheet,
                            "Histórico Financiero",
                          );
                        }

                        // 4. AI Predictions
                        if (
                          selectedReport.mlPredictions &&
                          selectedReport.mlPredictions.length > 0
                        ) {
                          const predHeaders = [
                            "Métrica",
                            "Valor Actual",
                            "Valor Predicho (12m)",
                            "Confianza",
                            "Tendencia",
                          ];
                          const predRows = selectedReport.mlPredictions.map(
                            (p) => [
                              p.metric,
                              p.currentValue,
                              p.predictedValue,
                              (Number(p.confidence || 0) * 100).toFixed(0) +
                                "%",
                              p.trend === "UP"
                                ? "ALCISTA ↑"
                                : p.trend === "DOWN"
                                  ? "BAJISTA ↓"
                                  : "ESTABLE →",
                            ],
                          );
                          const predSheet = XLSX.utils.aoa_to_sheet([
                            predHeaders,
                            ...predRows,
                          ]);
                          XLSX.utils.book_append_sheet(
                            workbook,
                            predSheet,
                            "Predicciones AI",
                          );
                        }

                        // Download the file
                        XLSX.writeFile(
                          workbook,
                          `Numora_Report_${selectedReport.companyName.replace(/\s+/g, "_")}.xlsx`,
                        );
                      }}
                      className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-3 h-3" />
                      Exportar Excel
                    </button>
                    <button className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all">
                      Informe Completo
                    </button>
                  </div>
                </div>

                {/* Real-time Market Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <LineChartIcon className="w-4 h-4 text-slate-600" />
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Market Momentum (Real-time)
                    </h3>
                    <button
                      onClick={() =>
                        handleStartTrading(selectedReport.ticker || searchQuery)
                      }
                      className="ml-auto px-6 py-2.5 bg-[#10B981] text-black rounded-xl text-[11px] font-black uppercase tracking-[0.1em] hover:bg-[#34D399] transition-all flex items-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Zap className="w-4 h-4 fill-black" />
                      Ejecutar Operación en Bot
                    </button>
                  </div>
                  <TradingViewChart
                    symbol={selectedReport.ticker || searchQuery}
                  />
                </div>

                {/* Layout Content */}
                <div className="grid grid-cols-1 gap-12">
                  <div className="space-y-12">
                    {/* Perfil Corporativo Section */}
                    <section>
                      <div className="flex items-center gap-2 mb-6">
                        <FileSpreadsheet className="w-4 h-4 text-slate-600" />
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Perfil Corporativo
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          {
                            label: "Margen EBITDA",
                            val:
                              (
                                Number(selectedReport.data?.margenEbitda || 0) *
                                100
                              ).toFixed(1) + "%",
                            sub: "Rentabilidad",
                          },
                          {
                            label: "Ratio de Liquidez",
                            val: Number(
                              selectedReport.data?.liquidez || 0,
                            ).toFixed(2),
                            sub: "Solvencia",
                          },
                          {
                            label: "Apalancamiento",
                            val: Number(
                              selectedReport.data?.apalancamiento || 0,
                            ).toFixed(2),
                            sub: "D/E Ratio",
                          },
                        ].map((stat, i) => (
                          <div
                            key={i}
                            className="bg-[#151921] border border-white/5 p-6 rounded-2xl"
                          >
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-4">
                              {stat.label}
                            </p>
                            <p className="text-3xl font-black text-white mb-2">
                              {stat.val}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>

                {/* Chat Interactivo */}
                <div className="elegant-card p-12 bg-white/[0.02] mt-12">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tighter">
                        Consultor IA
                      </h3>
                      <p className="text-xs font-bold text-text-secondary uppercase tracking-widest opacity-50">
                        Chat en tiempo real sobre el reporte
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-12 opacity-30">
                        <p className="text-sm font-bold">
                          Haz una pregunta sobre este análisis para comenzar...
                        </p>
                      </div>
                    ) : (
                      chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex flex-col gap-2",
                            msg.role === "user" ? "items-end" : "items-start",
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] p-6 rounded-[2rem] text-sm leading-relaxed",
                              msg.role === "user"
                                ? "bg-white text-black font-bold"
                                : "bg-white/5 text-text-primary border border-white/10",
                            )}
                          >
                            {msg.role === "ai" ? (
                              <div className="markdown-body prose prose-invert prose-sm max-w-none">
                                <Markdown>{msg.content}</Markdown>
                              </div>
                            ) : (
                              msg.content
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    {isTyping && (
                      <div className="flex gap-2 p-4 bg-white/5 rounded-full w-fit animate-pulse">
                        <div className="w-2 h-2 bg-text-secondary rounded-full" />
                        <div className="w-2 h-2 bg-text-secondary rounded-full" />
                        <div className="w-2 h-2 bg-text-secondary rounded-full" />
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="relative">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Pregunta algo sobre la liquidez, riesgos o recomendaciones..."
                      className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-sm font-medium focus:outline-none focus:border-white/20 transition-all pr-20"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isTyping}
                      className="absolute right-3 top-3 bottom-3 px-6 bg-white text-black rounded-full font-black text-xs hover:bg-white/90 transition-all disabled:opacity-50"
                    >
                      ENVIAR
                    </button>
                  </form>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                  {/* Radar Chart Card */}
                  <div className="elegant-card p-12 xl:col-span-2">
                    <h3 className="text-3xl font-extrabold text-text-primary tracking-tight mb-12">
                      Perfil de Riesgo
                    </h3>
                    <div className="h-[400px] w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart
                          cx="50%"
                          cy="50%"
                          outerRadius="80%"
                          data={[
                            {
                              subject: "Liquidez",
                              A: Math.min(
                                Number(selectedReport.data?.liquidez || 0) * 10,
                                100,
                              ),
                              fullMark: 100,
                            },
                            {
                              subject: "Rentab.",
                              A: Math.min(
                                Number(selectedReport.data?.rentabilidad || 0) *
                                  10,
                                100,
                              ),
                              fullMark: 100,
                            },
                            {
                              subject: "Apalanc.",
                              A: Math.min(
                                Number(
                                  selectedReport.data?.apalancamiento || 0,
                                ) * 10,
                                100,
                              ),
                              fullMark: 100,
                            },
                            {
                              subject: "EBITDA",
                              A: Math.min(
                                Number(selectedReport.data?.margenEbitda || 0) *
                                  100,
                                100,
                              ),
                              fullMark: 100,
                            },
                            {
                              subject: "Riesgo",
                              A:
                                (10 -
                                  Number(
                                    selectedReport.data?.riesgoSintetico || 0,
                                  )) *
                                10,
                              fullMark: 100,
                            },
                          ]}
                        >
                          <PolarGrid stroke="#333" />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{
                              fill: "#a1a1aa",
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          />
                          <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                          />
                          <Radar
                            name="Perfil"
                            dataKey="A"
                            stroke="#fff"
                            fill="#fff"
                            fillOpacity={0.1}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Risk Summary Card (Black) */}
                  <div className="bg-black p-12 rounded-[3rem] text-white shadow-2xl shadow-black/20 flex flex-col justify-center">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-[0.3em] mb-6">
                      Riesgo Sintético
                    </p>
                    <div className="flex items-baseline gap-4 mb-8">
                      <span className="text-8xl font-black tracking-tighter">
                        {Number(
                          selectedReport.data?.riesgoSintetico || 0,
                        ).toFixed(1)}
                      </span>
                      <span className="text-2xl font-bold text-white/30">
                        / 10.0
                      </span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(Number(selectedReport.data?.riesgoSintetico || 0) / 10) * 100}%`,
                        }}
                        className={cn(
                          "h-full transition-all duration-1000",
                          Number(selectedReport.data?.riesgoSintetico || 0) < 4
                            ? "bg-emerald-400"
                            : Number(
                                  selectedReport.data?.riesgoSintetico || 0,
                                ) < 7
                              ? "bg-yellow-400"
                              : "bg-red-400",
                        )}
                      />
                    </div>
                    <p className="mt-8 text-sm text-white/50 font-medium leading-relaxed">
                      {Number(selectedReport.data?.riesgoSintetico || 0) < 4
                        ? "La salud financiera es excelente. Los indicadores muestran una sólida capacidad operativa."
                        : Number(selectedReport.data?.riesgoSintetico || 0) < 7
                          ? "Se observan riesgos moderados. Se recomienda vigilar la liquidez y el apalancamiento."
                          : "Riesgo crítico detectado. Se requiere intervención inmediata en la estructura de capital."}
                    </p>
                  </div>
                </div>

                {/* MACHINE LEARNING MODELS SECTION */}
                <div className="mt-12 mb-12">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <BrainCircuit className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tighter uppercase tracking-widest">
                        Neural Forecast Engine
                      </h3>
                      <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em]">
                        Integración Modelos: KNN • Random Forest • LSTM
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* KNN Card */}
                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:bg-white/[0.04] transition-all">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Target className="w-12 h-12 text-white" />
                      </div>
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-6">
                        K-Nearest Neighbors
                      </p>
                      <div className="flex items-center justify-between mb-6">
                        <span
                          className={cn(
                            "text-3xl font-black tracking-tighter",
                            selectedReport.mlModels?.knn?.signal === "BUY"
                              ? "text-emerald-400"
                              : selectedReport.mlModels?.knn?.signal === "SELL"
                                ? "text-red-400"
                                : "text-white",
                          )}
                        >
                          {selectedReport.mlModels?.knn?.signal || "HOLD"}
                        </span>
                        <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-white">
                          {selectedReport.mlModels?.knn?.confidence || 0}%
                          CONFIDENCIA
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                        "
                        {selectedReport.mlModels?.knn?.sentiment ||
                          "Estabilización de sentimiento en curso."}
                        "
                      </p>
                    </div>

                    {/* Random Forest Card */}
                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:bg-white/[0.04] transition-all">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap className="w-12 h-12 text-white" />
                      </div>
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-6">
                        Random Forest Regressor
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl font-black text-white tracking-tighter">
                          $
                          {Number(
                            selectedReport.mlModels?.randomForest?.prediction ||
                              0,
                          ).toFixed(2)}
                        </span>
                        <div
                          className={cn(
                            "flex items-center gap-1 text-[9px] font-black",
                            (selectedReport.mlModels?.randomForest?.trend || "")
                              .toLowerCase()
                              .includes("bull") ||
                              (
                                selectedReport.mlModels?.randomForest?.trend ||
                                ""
                              )
                                .toLowerCase()
                                .includes("alc")
                              ? "text-emerald-400"
                              : "text-red-400",
                          )}
                        >
                          <TrendingUp className="w-3 h-3" />
                          {selectedReport.mlModels?.randomForest?.trend ||
                            "LATERAL"}
                        </div>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-6">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${selectedReport.mlModels?.randomForest?.precision || 0}%`,
                          }}
                          className="h-full bg-indigo-500"
                        />
                      </div>
                      <p className="mt-3 text-[8px] font-black text-white/30 uppercase tracking-widest">
                        Precision Score:{" "}
                        {selectedReport.mlModels?.randomForest?.precision || 0}%
                      </p>
                    </div>

                    {/* LSTM Card */}
                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:bg-white/[0.04] transition-all">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity className="w-12 h-12 text-white" />
                      </div>
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-6">
                        LSTM Time Series
                      </p>
                      <div className="h-12 flex items-end gap-1 mb-6">
                        {(Array.isArray(
                          selectedReport.mlModels?.lstm?.dataPoints,
                        )
                          ? selectedReport.mlModels?.lstm?.dataPoints
                          : [10, 20, 15, 25, 30, 28, 35, 40, 38, 45]
                        ).map((val, i) => {
                          const dataPoints = Array.isArray(
                            selectedReport.mlModels?.lstm?.dataPoints,
                          )
                            ? selectedReport.mlModels?.lstm?.dataPoints
                            : [100];
                          const maxVal = Math.max(...dataPoints, 1);
                          return (
                            <motion.div
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${(val / maxVal) * 100}%` }}
                              className="flex-1 bg-indigo-500/40 rounded-t-sm"
                            />
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white tracking-tight uppercase">
                          {selectedReport.mlModels?.lstm?.trendForecast ||
                            "GENERANDO..."}
                        </span>
                        <span className="text-[9px] text-red-500/80 font-black">
                          ±{selectedReport.mlModels?.lstm?.errorMargin || 0}%
                          ERROR
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Markdown Card */}
                <div className="elegant-card p-0 overflow-hidden bg-white/[0.01]">
                  <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-80 bg-white/[0.03] p-12 border-r border-white/5 shrink-0">
                      <div className="w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center mb-10">
                        <FileText className="w-8 h-8" />
                      </div>
                      <h4 className="text-2xl font-black tracking-tighter mb-4">
                        Análisis Exhaustivo del Auditor
                      </h4>
                      <p className="text-xs font-medium text-text-secondary leading-relaxed opacity-60">
                        Evaluación detallada de riesgos, mitigantes y viabilidad
                        estratégica generada por la inteligencia avanzada de
                        Numora.
                      </p>
                    </div>
                    <div className="flex-1 p-12 lg:p-20">
                      <div className="max-w-4xl">
                        <div className="prose prose-invert prose-lg max-w-none text-text-secondary leading-relaxed markdown-analysis">
                          <Markdown>{selectedReport.analysis}</Markdown>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : view === "battle" ? (
              <motion.div
                key="battle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                {/* Final Vertical Reference Layout - Optimized for Grid Symmetry */}
                <div className="grid grid-cols-1 md:grid-cols-2 items-stretch gap-8 bg-gradient-to-br from-emerald-900/10 to-emerald-900/5 p-6 md:p-10 rounded-[3rem] border border-emerald-500/10 overflow-hidden relative max-w-5xl mx-auto">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none" />

                  {/* Left Column: Config */}
                  <div className="relative z-10 space-y-6 flex flex-col justify-center">
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                        <Sparkles className="w-3 h-3 fill-emerald-500" />
                        SMART MATCH ALGORITHM
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                        AI STOCK
                        <br />
                        BATTLE
                      </h2>
                      <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-sm uppercase tracking-wider opacity-60">
                        Análisis neural avanzado para comparar activos.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Flex Ticker Inputs */}
                      <div className="flex flex-col gap-3">
                        {battleInputs.map((input, idx) => (
                          <div key={idx} className="relative group">
                            <input
                              type="text"
                              value={input}
                              placeholder={`TICKER ${idx + 1}`}
                              onChange={(e) => {
                                const newInputs = [...battleInputs];
                                newInputs[idx] = e.target.value.toUpperCase();
                                setBattleInputs(newInputs);
                              }}
                              className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 rounded-2xl text-white font-black text-xl focus:outline-none focus:border-emerald-500/50 transition-all placeholder:opacity-10 text-center uppercase"
                            />
                            {battleInputs.length > 2 && (
                              <button 
                                onClick={() => {
                                  const newInputs = battleInputs.filter((_, i) => i !== idx);
                                  setBattleInputs(newInputs);
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        
                        {battleInputs.length < 3 && (
                          <button 
                            onClick={() => setBattleInputs([...battleInputs, ""])}
                            className="w-full py-3 border border-dashed border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-500 hover:border-emerald-500/30 transition-all flex items-center justify-center gap-2"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Añadir Comparativa
                          </button>
                        )}
                      </div>

                      <button
                        onClick={handleBattle}
                        disabled={
                          isBattling || battleInputs.filter(t => t.trim()).length < 2
                        }
                        className="w-full relative py-5 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl overflow-hidden shadow-[0_15px_40px_rgba(16,185,129,0.2)] hover:shadow-[0_15px_60px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-40"
                      >
                        <span className="relative">
                          {isBattling
                            ? "ANALIZANDO MERCADO..."
                            : "INICIAR BATALLA IA"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Result Card */}
                  <div className="relative z-10 flex items-center justify-center min-h-[380px]">
                    <AnimatePresence mode="wait">
                      {battleResult ? (
                        <motion.div
                          key="result"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-full h-full"
                        >
                          <div className="w-full h-full elegant-card p-8 bg-emerald-500/[0.03] border-emerald-500/20 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xl group shadow-2xl rounded-[2rem]">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(16,185,129,0.1),transparent_50%)] pointer-events-none" />

                            <div className="w-16 h-16 bg-emerald-500 rounded-[1.8rem] flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)] relative">
                              <div className="absolute inset-0 bg-emerald-500/40 blur-xl animate-pulse" />
                              <BrainCircuit className="w-8 h-8 text-white relative z-10" />
                            </div>

                            <div className="text-center space-y-1 mb-6">
                              <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                                {battleResult.winner}
                              </h3>
                              <div className="space-y-1">
                                <p className="text-xl font-black text-emerald-400">
                                  98% Match Rate
                                </p>
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.3em]">
                                  HI-FI NEURAL ANALYSIS
                                </p>
                              </div>
                            </div>

                            {/* Animated bars */}
                            <div className="flex gap-1.5 items-end h-6">
                              {[0.4, 0.7, 0.9, 0.6, 0.8].map((val, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ height: 0 }}
                                  animate={{ height: `${val * 100}%` }}
                                  transition={{
                                    delay: i * 0.1,
                                    duration: 1,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                  }}
                                  className="w-1 bg-emerald-500/50 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                                />
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ) : isBattling ? (
                        <div className="text-center space-y-3">
                          <Activity className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                          <p className="text-[8px] font-black text-emerald-500/60 uppercase tracking-[0.3em] animate-pulse">
                            Sincronizando Datapoints...
                          </p>
                        </div>
                      ) : (
                        <div className="w-full h-full border-2 border-dashed border-white/5 rounded-[2rem] flex items-center justify-center opacity-20">
                          <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[9px]">
                            Sistema en Espera
                          </p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Battle Details & Comparison Reasons (Green) */}
                <AnimatePresence>
                  {battleResult && battleResult.competitors && Array.isArray(battleResult.competitors) && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "grid grid-cols-1 gap-5 max-w-7xl mx-auto",
                        battleResult.competitors.length <= 2 ? "md:grid-cols-2" : "md:grid-cols-3"
                      )}
                    >
                      {battleResult.competitors.map((comp: any) => (
                        <div
                          key={comp.ticker}
                          className={cn(
                            "p-6 rounded-[2rem] border transition-all duration-700 relative overflow-hidden flex flex-col h-full",
                            comp.ticker === battleResult.winner
                              ? "bg-emerald-500/[0.05] border-emerald-500/30 shadow-xl"
                              : "bg-white/[0.02] border-white/5 opacity-70",
                          )}
                        >
                          {comp.ticker === battleResult.winner && (
                            <div className="absolute top-5 right-5 z-20">
                              <Trophy className="w-5 h-5 text-emerald-500" />
                            </div>
                          )}

                          <div className="space-y-5 flex-1 relative z-10">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-9 h-9 rounded-xl flex items-center justify-center font-black text-base italic",
                                  comp.ticker === battleResult.winner
                                    ? "bg-emerald-500 text-black"
                                    : "bg-white/10 text-slate-400",
                                )}
                              >
                                {comp.ticker[0]}
                              </div>
                              <div>
                                <h4 className="text-xl font-black text-white italic">
                                  {comp.ticker}
                                </h4>
                                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">
                                  {comp.score}% Score de Viabilidad
                                </p>
                              </div>
                            </div>

                            {/* Mini Chart for Ticker */}
                            <div className="h-24 w-full bg-black/20 rounded-xl overflow-hidden border border-white/5">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={battleChartsData[comp.ticker] || []}>
                                  <Line 
                                    type="monotone" 
                                    dataKey="price" 
                                    stroke={comp.ticker === battleResult.winner ? "#10B981" : "#64748b"} 
                                    strokeWidth={2} 
                                    dot={false} 
                                    isAnimationActive={false}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <p className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">
                                  Fortalezas Clave
                                </p>
                                <div className="grid grid-cols-1 gap-2">
                                  {comp.pros && Array.isArray(comp.pros) && comp.pros.map((p: string, i: number) => (
                                    <div
                                      key={i}
                                      className="flex gap-2.5 text-xs text-slate-300 font-medium leading-relaxed"
                                    >
                                      <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                      {p}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-4 pt-2 border-t border-white/5">
                                <p className="text-[8px] font-black text-emerald-500/80 uppercase tracking-widest">
                                  Ventaja Competitiva / Razonamiento
                                </p>
                                <div className="grid grid-cols-1 gap-2">
                                  <div className="flex gap-2.5 text-xs text-emerald-300 font-medium leading-relaxed bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                                    {comp.ticker === battleResult.winner ? (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                        <span>
                                          Dominio superior en {comp.pros?.[0] || 'indicadores clave'} y
                                          mayor resiliencia estructural frente a
                                          riesgos de mercado.
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <XCircle className="w-3.5 h-3.5 text-red-500/40 shrink-0 mt-0.5" />
                                        <span>
                                          Penalizado por {comp.cons[0] || 'factores de riesgo'} y menor
                                          eficiencia en métricas de crecimiento
                                          comparativo.
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Trade Button Integration */}
                          <button
                            onClick={() => handleStartTrading(comp.ticker)}
                            className={cn(
                              "w-full mt-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 relative z-10",
                              comp.ticker === battleResult.winner
                                ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_5px_15px_rgba(16,185,129,0.2)]"
                                : "bg-white/5 text-white/40 hover:bg-white/10",
                            )}
                          >
                            Operar {comp.ticker}{" "}
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {battleResult && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 bg-black/60 rounded-[2rem] border border-white/5 relative overflow-hidden max-w-5xl mx-auto"
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                    <div className="max-w-2xl mx-auto text-center space-y-3">
                      <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-[0.4em] italic">
                        Dictamen Estratégico Neural
                      </p>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed italic">
                        "{battleResult.technicalVerdict}"
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : view === "alpha" ? (
              <motion.div
                key="alpha-lab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-gradient-to-br from-purple-900/20 to-purple-900/5 p-12 rounded-[40px] border border-purple-500/10 overflow-hidden relative mb-12">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[120px] pointer-events-none" />
                  <div className="relative z-10 space-y-4 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                      <Sparkles className="w-3 h-3" />
                      Smart Match Algorithm
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter leading-tight">
                      Smart Match IA
                    </h2>
                    <p className="text-slate-400 font-medium leading-relaxed">
                      Encuentra activos que se ajusten perfectamente a tu perfil
                      de riesgo y objetivos de inversión. Nuestro algoritmo
                      analiza miles de datapoints para conectarte con tu próximo
                      gran movimiento.
                    </p>
                    <button
                      onClick={() => setShowSmartMatch(true)}
                      className="mt-6 px-8 py-4 bg-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-600 transition-all shadow-xl shadow-purple-500/20 active:scale-[0.98]"
                    >
                      Iniciar Descubrimiento IA
                    </button>
                  </div>

                  <div className="relative z-10 w-full lg:w-auto">
                    <div className="elegant-card p-10 bg-purple-500/10 border-purple-500/20 flex flex-col items-center text-center gap-6 min-w-[380px] backdrop-blur-md">
                      <div className="w-20 h-20 bg-purple-500 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-purple-500/40 mb-2">
                        <BrainCircuit className="w-10 h-10" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-2xl font-black text-white">
                          98% Match Rate
                        </h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          Hi-Fi Neural Analysis
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="w-1.5 h-6 bg-purple-500/30 rounded-full overflow-hidden"
                          >
                            <motion.div
                              animate={{ height: ["20%", "90%", "40%", "80%"] }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                              className="w-full bg-purple-400"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-8">
                    <div className="elegant-card p-10 bg-[#151921] border-white/5 overflow-hidden relative min-h-[500px]">
                      <div className="flex items-center justify-between mb-10">
                        <div>
                          <h3 className="text-2xl font-black text-white tracking-tight uppercase tracking-widest text-white">
                            IA Discovery Radar
                          </h3>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            Detectando activos con alta correlación a tu
                            estrategia pre-establecida.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <div className="px-4 py-1.5 bg-purple-500/10 text-purple-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-purple-500/20">
                            AI Match Engine Active
                          </div>
                        </div>
                      </div>

                      <div className="relative h-[350px] flex items-center justify-center">
                        {[1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ scale: [1, 1.3], opacity: [0.2, 0] }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              delay: i * 1.3,
                            }}
                            className="absolute border border-purple-500/20 rounded-full"
                            style={{ width: i * 180, height: i * 180 }}
                          />
                        ))}

                        <div className="relative z-10 w-24 h-24 bg-purple-500/20 rounded-full border border-purple-500/30 flex items-center justify-center backdrop-blur-xl">
                          <Sparkles className="w-10 h-10 text-purple-400 animate-pulse" />
                        </div>

                        {[
                          { t: "MSFT", x: -140, y: -80, m: "98% Match" },
                          { t: "GOOGL", x: 160, y: 60, m: "94% Match" },
                          { t: "AVGO", x: -60, y: 120, m: "91% Match" },
                          { t: "AMD", x: 130, y: -110, m: "89% Match" },
                        ].map((asset, i) => (
                          <motion.div
                            key={i}
                            initial={{ x: asset.x, y: asset.y }}
                            animate={{
                              y: [asset.y - 12, asset.y + 12, asset.y - 12],
                              x: [asset.x - 8, asset.x + 8, asset.x - 8],
                            }}
                            transition={{
                              duration: 5 + i,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="absolute p-5 bg-black/40 backdrop-blur-md rounded-3xl border border-white/5 flex flex-col items-center gap-1 cursor-pointer group hover:border-purple-500/50 transition-all shadow-2xl"
                            onClick={() => {
                              setSearchQuery(asset.t);
                              setView("analysis");
                            }}
                          >
                            <span className="text-xl font-black text-white">
                              {asset.t}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">
                              {asset.m}
                            </span>
                          </motion.div>
                        ))}
                      </div>

                      <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          {
                            label: "Neural Precision",
                            val: "99.2%",
                            status: "Stable",
                          },
                          {
                            label: "Data Points",
                            val: "4.8M",
                            status: "Realtime",
                          },
                          {
                            label: "Discovery Latency",
                            val: "12ms",
                            status: "Ultra Low",
                          },
                          {
                            label: "Model Version",
                            val: "v4.2",
                            status: "Numora Pro",
                          },
                        ].map((stat, i) => (
                          <div
                            key={i}
                            className="bg-white/5 p-4 rounded-xl border border-white/5"
                          >
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                              {stat.label}
                            </p>
                            <p className="text-lg font-black text-white">
                              {stat.val}
                            </p>
                            <p className="text-[8px] font-bold text-slate-600 uppercase mt-1">
                              {stat.status}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : view === "history" ? (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">
                      Historial de Inteligencia
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">
                      Auditorías previas y rastreo de activos institucionales.
                    </p>
                  </div>
                </div>

                <div className="bg-[#151921] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/5">
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center w-20">
                          Riesgo
                        </th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Empresa / Sector
                        </th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Dictamen
                        </th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                          Fecha
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {reports.map((report) => (
                        <tr
                          key={report.id}
                          onClick={() => {
                            setSelectedReport(report);
                            setView("analysis");
                          }}
                          className="hover:bg-white/[0.01] transition-all cursor-pointer group"
                        >
                          <td className="px-8 py-6 text-center">
                            <div
                              className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm mx-auto border",
                                (report.data?.riesgoSintetico || 0) < 4
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10"
                                  : (report.data?.riesgoSintetico || 0) < 7
                                    ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/10"
                                    : "bg-red-500/10 text-red-500 border-red-500/10",
                              )}
                            >
                              {(report.data?.riesgoSintetico || 0).toFixed(0)}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div>
                              <p className="text-sm font-bold text-white mb-1 group-hover:text-emerald-500 transition-colors uppercase tracking-tight">
                                {report.companyName}
                              </p>
                              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                                {report.sector} • {report.period}
                              </p>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span
                              className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                report.investmentRecommendation?.verdict ===
                                  "COMPRA"
                                  ? "text-emerald-500"
                                  : report.investmentRecommendation?.verdict ===
                                      "VENTA"
                                    ? "text-red-400"
                                    : "text-yellow-500",
                              )}
                            >
                              {report.investmentRecommendation?.verdict ||
                                "REVISAR"}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right text-[10px] font-bold text-slate-600 uppercase font-mono">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {reports.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-20 text-center text-slate-600 font-bold text-sm"
                          >
                            No existen registros disponibles.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : view === "bot" ? (
              <motion.div
                key="bot"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">
                      Trading Terminal en Vivo
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">
                      Ejecución institucional de alta frecuencia.
                    </p>
                  </div>
                  <form onSubmit={handleUpdateSymbol} className="flex gap-2">
                    <input
                      type="text"
                      value={symbolInput}
                      onChange={(e) => setSymbolInput(e.target.value)}
                      placeholder="Ticker (ej: AAPL)"
                      className="bg-[#151921] border border-white/5 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-emerald-500/30 transition-all uppercase w-48"
                    />
                    <button
                      type="submit"
                      disabled={isChangingSymbol}
                      className="bg-white text-black px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-white/90 disabled:opacity-50"
                    >
                      {isChangingSymbol ? "..." : "Actualizar"}
                    </button>
                  </form>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                  <div className="xl:col-span-3 space-y-8">
                    {/* Main Stats Row */}
                    <div className="grid grid-cols-3 gap-8">
                      <div className="bg-[#151921] border border-white/5 p-8 rounded-2xl flex flex-col items-center text-center overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                          Precio Actual
                        </p>
                        <h4 className="text-3xl lg:text-4xl font-black text-white tracking-tighter mb-2 break-all">
                          $
                          {botStatus?.last_price?.toLocaleString(undefined, {
                            minimumFractionDigits: 3,
                            maximumFractionDigits: 3,
                          }) || "0.000"}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-xs font-bold whitespace-nowrap",
                              botStatus &&
                                botStatus.last_price > botStatus.ema_fast
                                ? "text-emerald-500"
                                : "text-red-500",
                            )}
                          >
                            {botStatus
                              ? botStatus.last_price > botStatus.ema_fast
                                ? "Bullish Trend"
                                : "Bearish Trend"
                              : "Waiting..."}
                          </span>
                        </div>
                      </div>
                      <div className="bg-[#151921] border border-white/5 p-8 rounded-2xl flex flex-col items-center text-center overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                          Oscilador RSI
                        </p>
                        <h4
                          className={cn(
                            "text-3xl lg:text-4xl font-black tracking-tighter mb-2",
                            botStatus && botStatus.rsi < 30
                              ? "text-emerald-500"
                              : botStatus && botStatus.rsi > 70
                                ? "text-red-500"
                                : "text-white",
                          )}
                        >
                          {botStatus?.rsi?.toFixed(2) || "0.00"}
                        </h4>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                          Normal (14 Periods)
                        </p>
                      </div>
                      <div className="bg-[#151921] border border-white/5 p-8 rounded-2xl flex flex-col items-center text-center overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                          Estado Bot
                        </p>
                        <div className="flex items-center gap-2 mb-4 justify-center">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                            Activo
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider truncate max-w-full">
                          Sync: {botStatus?.last_update || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Performance Chart */}
                    <div className="bg-[#151921] border border-white/5 p-8 rounded-2xl h-[300px]">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                            Rastreo de Rendimiento
                          </p>
                          <h5 className="text-sm font-black text-white uppercase tracking-tight">
                            Precio de {botStatus?.symbol} en Tiempo Real
                          </h5>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                            Live Feed
                          </span>
                        </div>
                      </div>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={
                              performanceHistory.length > 0
                                ? performanceHistory
                                : [{ time: "0", price: 0, rsi: 50 }]
                            }
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#ffffff05"
                              vertical={false}
                            />
                            <XAxis dataKey="time" hide />
                            <YAxis
                              yAxisId="left"
                              domain={["auto", "auto"]}
                              hide
                            />
                            <YAxis
                              yAxisId="right"
                              orientation="right"
                              domain={[0, 100]}
                              hide
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#151921",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "12px",
                                fontSize: "10px",
                              }}
                              itemStyle={{ fontWeight: "bold" }}
                              labelStyle={{
                                color: "#64748b",
                                marginBottom: "4px",
                              }}
                            />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="price"
                              name="Precio"
                              stroke="#10B981"
                              strokeWidth={3}
                              dot={false}
                              isAnimationActive={false}
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="rsi"
                              name="RSI"
                              stroke="#ec4899"
                              strokeWidth={2}
                              strokeDasharray="5 5"
                              dot={false}
                              isAnimationActive={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Terminal Log */}
                    <div className="bg-[#0b0e14] border border-white/5 p-8 rounded-2xl font-mono text-xs overflow-hidden h-[500px] flex flex-col">
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                          Live Terminal Output
                        </p>
                        <div className="flex gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                          <div className="w-2 h-2 rounded-full bg-slate-800" />
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                        {botLogs.length === 0 && (
                          <p className="text-slate-600 italic">
                            Esperando datos del mercado...
                          </p>
                        )}
                        {botLogs.map((log, i) => (
                          <div
                            key={i}
                            className={`flex gap-3 ${log.type === "signal" ? "py-1 border-y border-white/5 my-1" : ""}`}
                          >
                            <span className="text-slate-600 shrink-0">
                              [{log.timestamp}]
                            </span>
                            <span
                              className={`${
                                log.type === "signal"
                                  ? log.message.includes("COMPRA")
                                    ? "text-emerald-400 font-bold"
                                    : "text-red-400 font-bold"
                                  : "text-emerald-500/80"
                              }`}
                            >
                              {log.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Execution Sidebar */}
                  <div className="space-y-8">
                    <div className="bg-[#151921] border border-white/5 p-8 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-10">
                        Ejecución Directa
                      </p>
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-4">
                            Unidades
                          </p>
                          <div className="flex items-center bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                            <button
                              onClick={() =>
                                setSharesToTrade(Math.max(1, sharesToTrade - 1))
                              }
                              className="w-12 h-12 flex items-center justify-center text-xl font-bold hover:bg-white/5 transition-colors border-r border-white/5"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={sharesToTrade}
                              onChange={(e) =>
                                setSharesToTrade(parseInt(e.target.value) || 1)
                              }
                              className="flex-1 min-w-0 bg-transparent text-center text-xl font-black focus:outline-none py-2"
                            />
                            <button
                              onClick={() =>
                                setSharesToTrade(sharesToTrade + 1)
                              }
                              className="w-12 h-12 flex items-center justify-center text-xl font-bold hover:bg-white/5 transition-colors border-l border-white/5"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <button
                            onClick={() => handleOrder("BUY")}
                            disabled={isTrading || !botStatus}
                            className="bg-emerald-500 text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            {isTrading ? "..." : "BUY / LONG"}
                          </button>
                          <button
                            onClick={() => handleOrder("SELL")}
                            disabled={isTrading || !botStatus}
                            className="bg-red-500 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-400 active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            {isTrading ? "..." : "SELL / SHORT"}
                          </button>
                        </div>
                        <div className="pt-6 border-t border-white/5">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-600">
                              Total Estimado
                            </span>
                            <span className="text-white">
                              $
                              {(
                                (botStatus?.last_price || 0) * sharesToTrade
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#151921] border border-white/5 p-8 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">
                        Última Operación
                      </p>
                      {tradeStatus !== "idle" ? (
                        <div
                          className={cn(
                            "p-4 rounded-xl border flex flex-col gap-2",
                            tradeStatus === "success"
                              ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500"
                              : "bg-red-500/5 border-red-500/10 text-red-500",
                          )}
                        >
                          <p className="text-[9px] font-black uppercase tracking-widest">
                            {tradeStatus === "success" ? "Éxito" : "Error"}
                          </p>
                          <p className="text-[10px] font-bold leading-relaxed">
                            {tradeMessage}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-slate-600 italic">
                          Esperando ejecución...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : view === "alerts" ? (
              <motion.div
                key="alerts"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <AnimatePresence>
                  {showThresholdConfig && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                      <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-[#151921] border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl"
                      >
                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                          <div>
                            <h3 className="text-xl font-black text-white tracking-tight uppercase">
                              Umbrales de Trading
                            </h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                              Configuración de alertas personalizadas
                            </p>
                          </div>
                          <button
                            onClick={() => setShowThresholdConfig(false)}
                            className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="p-8 space-y-8">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                                  <TrendingUp className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-black text-white uppercase tracking-tight">
                                  RSI Sobrecompra
                                </span>
                              </div>
                              <span className="text-lg font-black text-emerald-500">
                                {thresholds.rsiOverbought}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="50"
                              max="95"
                              value={thresholds.rsiOverbought}
                              onChange={(e) =>
                                setThresholds((prev) => ({
                                  ...prev,
                                  rsiOverbought: parseInt(e.target.value),
                                }))
                              }
                              className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                            <p className="text-[9px] text-slate-600 font-bold uppercase leading-relaxed">
                              Alertar cuando el activo tenga demasiada presión
                              de compra. Valor sugerido: 70-80.
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                                  <TrendingDown className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-black text-white uppercase tracking-tight">
                                  RSI Sobreventa
                                </span>
                              </div>
                              <span className="text-lg font-black text-red-500">
                                {thresholds.rsiOversold}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="5"
                              max="50"
                              value={thresholds.rsiOversold}
                              onChange={(e) =>
                                setThresholds((prev) => ({
                                  ...prev,
                                  rsiOversold: parseInt(e.target.value),
                                }))
                              }
                              className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-red-500"
                            />
                            <p className="text-[9px] text-slate-600 font-bold uppercase leading-relaxed">
                              Alertar cuando el activo tenga demasiada presión
                              de venta. Valor sugerido: 20-30.
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                                  <Percent className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-black text-white uppercase tracking-tight">
                                  Cambio de Precio
                                </span>
                              </div>
                              <span className="text-lg font-black text-amber-500">
                                {thresholds.priceChangeAlert}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0.5"
                              max="10"
                              step="0.5"
                              value={thresholds.priceChangeAlert}
                              onChange={(e) =>
                                setThresholds((prev) => ({
                                  ...prev,
                                  priceChangeAlert: parseFloat(e.target.value),
                                }))
                              }
                              className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                            <p className="text-[9px] text-slate-600 font-bold uppercase leading-relaxed">
                              Alertar si el precio cambia drásticamente en poco
                              tiempo. Valor sugerido: 1.5% - 3%.
                            </p>
                          </div>

                          <button
                            onClick={() => setShowThresholdConfig(false)}
                            className="w-full bg-emerald-500 text-black py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                          >
                            Guardar Configuración
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">
                      Centro de Alertas
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">
                      Monitoreo 24/7 mediante algoritmos predictivos y detección
                      de anomalías.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowThresholdConfig(true)}
                      className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Configurar Umbrales
                    </button>
                    <button className="bg-emerald-500 text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all">
                      Nueva Alerta
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-1 space-y-4">
                    <button
                      onClick={() => setActiveAlertCategory("Todas")}
                      className={cn(
                        "w-full border p-4 rounded-2xl flex items-center justify-between group transition-all",
                        activeAlertCategory === "Todas"
                          ? "bg-white/10 border-white/20"
                          : "bg-[#151921] border-white/5 hover:border-white/20",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white/5 text-slate-400">
                          <LayoutGrid className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-white uppercase tracking-tight">
                          Todas
                        </span>
                      </div>
                      <span className="bg-white/10 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                        {alerts.length}
                      </span>
                    </button>
                    {[
                      { name: "Técnicas", icon: Zap, color: "text-amber-500" },
                      {
                        name: "Fundamentales",
                        icon: Activity,
                        color: "text-blue-500",
                      },
                      {
                        name: "Seguridad",
                        icon: ShieldCheck,
                        color: "text-emerald-500",
                      },
                      {
                        name: "Anuncios",
                        icon: Newspaper,
                        color: "text-purple-500",
                      },
                    ].map((cat, i) => {
                      const count = alerts.filter(
                        (a) => a.type === cat.name,
                      ).length;
                      return (
                        <button
                          key={i}
                          onClick={() => setActiveAlertCategory(cat.name)}
                          className={cn(
                            "w-full border p-4 rounded-2xl flex items-center justify-between group transition-all",
                            activeAlertCategory === cat.name
                              ? "bg-white/10 border-white/20"
                              : "bg-[#151921] border-white/5 hover:border-white/20",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "p-2 rounded-xl bg-white/5",
                                cat.color,
                              )}
                            >
                              <cat.icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-white uppercase tracking-tight">
                              {cat.name}
                            </span>
                          </div>
                          {count > 0 && (
                            <span className="bg-white/10 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="lg:col-span-3 space-y-4">
                    {alerts
                      .filter(
                        (a) =>
                          activeAlertCategory === "Todas" ||
                          a.type === activeAlertCategory,
                      )
                      .map((alert, i) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          layout
                          className="bg-[#151921] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-emerald-500/30 transition-all"
                        >
                          <div
                            className={cn(
                              "absolute top-0 left-0 w-1 h-full",
                              alert.priority === "High"
                                ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                                : alert.priority === "Medium"
                                  ? "bg-amber-500"
                                  : "bg-slate-700",
                            )}
                          />

                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                  {alert.type}
                                </span>
                                <span className="text-[9px] font-bold text-slate-700">
                                  •
                                </span>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                  {alert.time}
                                </span>
                              </div>
                              <h4 className="text-lg font-black text-white group-hover:text-emerald-500 transition-colors uppercase tracking-tight">
                                {alert.title}
                              </h4>
                            </div>
                            <div
                              className={cn(
                                "px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest",
                                alert.priority === "High"
                                  ? "bg-red-500/10 text-red-500"
                                  : alert.priority === "Medium"
                                    ? "bg-amber-500/10 text-amber-500"
                                    : "bg-white/5 text-slate-500",
                              )}
                            >
                              PRIORITY: {alert.priority}
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-2xl mb-6">
                            {alert.desc}
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={() =>
                                setAlerts((prev) =>
                                  prev.filter((a) => a.id !== alert.id),
                                )
                              }
                              className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                              Ignorar
                            </button>
                            <button
                              onClick={() => setViewingAlert(alert)}
                              className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                              Ver Análisis Completo
                            </button>
                          </div>
                        </motion.div>
                      ))}

                    {alerts.filter(
                      (a) =>
                        activeAlertCategory === "Todas" ||
                        a.type === activeAlertCategory,
                    ).length === 0 && (
                      <div className="bg-[#0A0D12] border border-dashed border-white/5 p-8 rounded-3xl text-center">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BellOff className="w-6 h-6 text-slate-700" />
                        </div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                          No hay alertas en esta categoría
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : view === "chat" ? (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-[calc(100vh-12rem)] flex flex-col bg-[#151921] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl"
              >
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-emerald-500/5 to-transparent">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                      <MessageSquare className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white tracking-tight uppercase">
                        Consultor IA Privado
                      </h2>
                      <p className="text-[10px] text-emerald-500/60 font-black uppercase tracking-widest flex items-center gap-2">
                        <span className="block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Neural Terminals Connected
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                    <Shield className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      End-to-End Encrypted
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                  {advisorChatMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex max-w-[85%]",
                        msg.role === "user"
                          ? "ml-auto flex-row-reverse"
                          : "mr-auto",
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1",
                          msg.role === "user"
                            ? "ml-3 bg-white/10"
                            : "mr-3 bg-emerald-500/10",
                        )}
                      >
                        {msg.role === "user" ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Zap className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "p-5 rounded-3xl text-sm leading-relaxed",
                          msg.role === "user"
                            ? "bg-white/5 text-white rounded-tr-none border border-white/5"
                            : "bg-[#1A1F29] text-white/90 rounded-tl-none border border-emerald-500/10 shadow-xl",
                        )}
                      >
                        <div className="markdown-body">
                          <Markdown>{msg.content}</Markdown>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isTypingAdvisor && (
                    <div className="flex gap-4 max-w-[80%] mr-auto">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-1">
                        <Zap className="w-4 h-4 text-emerald-500 animate-pulse" />
                      </div>
                      <div className="flex items-center gap-1.5 p-4 bg-[#1A1F29] rounded-3xl rounded-tl-none border border-emerald-500/10">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                      </div>
                    </div>
                  )}
                  <div ref={advisorChatEndRef} />
                </div>

                <div className="p-8 border-t border-white/5 bg-[#1A1F29]/50">
                  <form
                    onSubmit={handleAdvisorSendMessage}
                    className="flex gap-3"
                  >
                    <div className="relative flex-1 group">
                      <input
                        type="text"
                        value={advisorChatInput}
                        onChange={(e) => setAdvisorChatInput(e.target.value)}
                        placeholder="Escribe tu consulta financiera o de inversión..."
                        className="w-full bg-[#1A1F29] border border-white/10 rounded-2xl px-6 py-4 text-xs font-medium text-white placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all outline-none"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={toggleListening}
                          className={cn(
                            "p-2 rounded-xl transition-all",
                            isListening
                              ? "bg-red-500/20 text-red-500 animate-pulse"
                              : "hover:bg-white/5 text-slate-500",
                          )}
                        >
                          {isListening ? (
                            <MicOff className="w-4 h-4" />
                          ) : (
                            <Mic className="w-4 h-4" />
                          )}
                        </button>
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest hidden md:block">
                          Press Enter
                        </span>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={!advisorChatInput.trim() || isTypingAdvisor}
                      className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black p-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                  <div className="mt-4 flex justify-center gap-6">
                    <button
                      onClick={() =>
                        setAdvisorChatInput(
                          "¿En qué sectores recomiendas invertir hoy?",
                        )
                      }
                      className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-emerald-500 transition-colors"
                    >
                      RECOMENDACIÓN DE SECTORES
                    </button>
                    <button
                      onClick={() =>
                        setAdvisorChatInput(
                          "¿Cómo reducir el riesgo de mi bot actual?",
                        )
                      }
                      className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-emerald-500 transition-colors"
                    >
                      GESTIÓN DE RIESGO
                    </button>
                    <button
                      onClick={() =>
                        setAdvisorChatInput(
                          "Estrategias para un capital de $50,000",
                        )
                      }
                      className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-emerald-500 transition-colors"
                    >
                      ESTRATEGIA CAPITAL
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : view === "news" ? (
              <motion.div
                key="news"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">
                      Market Intelligence
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">
                      Análisis de noticias en tiempo real para{" "}
                      <span className="text-emerald-500">
                        {activeNewsSymbol || botStatus?.symbol}
                      </span>
                      .
                    </p>
                  </div>

                  <form
                    onSubmit={handleNewsSearch}
                    className="flex items-center gap-3 bg-[#151921] p-2 rounded-2xl border border-white/5 shadow-2xl"
                  >
                    <div className="flex items-center gap-3 px-4">
                      <Search className="w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={newsSearchInput}
                        onChange={(e) => setNewsSearchInput(e.target.value)}
                        placeholder="Buscar otra empresa..."
                        className="bg-transparent border-none text-xs font-bold text-white focus:ring-0 placeholder:text-slate-600 w-32 md:w-48"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isFetchingNews}
                      className="bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/90 disabled:opacity-50 transition-all shadow-lg"
                    >
                      {isFetchingNews ? "Analizando..." : "Analizar Mercado"}
                    </button>
                  </form>

                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                      IA Live Analysis
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    {isFetchingNews ? (
                      <div className="flex flex-col items-center justify-center py-20 bg-[#151921] rounded-3xl border border-white/5 shadow-2xl">
                        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                        <p className="text-slate-500 font-medium animate-pulse tracking-widest uppercase text-[10px]">
                          Analizando{" "}
                          {activeNewsSymbol ||
                            newsSearchInput ||
                            botStatus?.symbol}{" "}
                          en tiempo real...
                        </p>
                      </div>
                    ) : marketNews.length > 0 ? (
                      <>
                        {marketNews.slice(0, newsLimit).map((news, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (i % 6) * 0.1 }}
                            onClick={() => setSelectedNews(news)}
                            className="bg-[#151921] border border-white/5 p-6 rounded-3xl hover:border-emerald-500/30 transition-all cursor-pointer group"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                                  {news.source}
                                </span>
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                  {news.time}
                                </span>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span
                                  className={cn(
                                    "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg",
                                    news.sentiment === "Positive"
                                      ? "bg-emerald-500/10 text-emerald-500"
                                      : news.sentiment === "Negative"
                                        ? "bg-red-500/10 text-red-500"
                                        : "bg-white/5 text-slate-500",
                                  )}
                                >
                                  {news.sentiment}
                                </span>
                                {news.sentimentScore !== undefined && (
                                  <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden mt-1">
                                    <div
                                      className={cn(
                                        "h-full rounded-full transition-all duration-1000",
                                        news.sentiment === "Positive"
                                          ? "bg-emerald-500"
                                          : news.sentiment === "Negative"
                                            ? "bg-red-500"
                                            : "bg-slate-500",
                                      )}
                                      style={{
                                        width: `${news.sentimentScore}%`,
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            <h3 className="text-xl font-bold text-white group-hover:text-emerald-500 transition-colors leading-tight mb-4">
                              {news.title}
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                              <Tag className="w-3.5 h-3.5" />
                              {news.category}
                            </div>
                          </motion.div>
                        ))}

                        {marketNews.length > newsLimit && (
                          <div className="col-span-full flex justify-center pt-4">
                            <button
                              onClick={() => setNewsLimit((prev) => prev + 6)}
                              className="group flex items-center gap-3 px-8 py-4 bg-[#151921] border border-white/5 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-emerald-500 hover:border-emerald-500/20 transition-all"
                            >
                              <div className="w-5 h-5 flex items-center justify-center rounded-full bg-white/5 group-hover:bg-emerald-500/10 transition-colors">
                                <Plus className="w-3 h-3" />
                              </div>
                              Cargar más noticias
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center bg-[#151921] rounded-3xl border border-white/5 px-8">
                        <Newspaper className="w-12 h-12 text-slate-700 mb-4" />
                        <p className="text-slate-500 text-sm max-w-xs uppercase tracking-widest font-black text-[10px]">
                          No hay noticias para{" "}
                          {activeNewsSymbol ||
                            newsSearchInput ||
                            botStatus?.symbol}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-[#151921] border border-white/5 p-8 rounded-3xl">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        Market Sentiment
                      </h4>
                      <div className="space-y-8">
                        <div>
                          <div className="flex justify-between items-end mb-3">
                            <span className="text-sm font-black text-white">
                              Sentiment Index
                            </span>
                            <span
                              className={cn(
                                "text-2xl font-black",
                                marketNews.reduce(
                                  (acc, n) => acc + (n.sentimentScore || 50),
                                  0,
                                ) /
                                  (marketNews.length || 1) >=
                                  50
                                  ? "text-emerald-500"
                                  : "text-red-500",
                              )}
                            >
                              {Math.round(
                                marketNews.reduce(
                                  (acc, n) => acc + (n.sentimentScore || 50),
                                  0,
                                ) / (marketNews.length || 1),
                              )}
                              %
                            </span>
                          </div>
                          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${marketNews.reduce((acc, n) => acc + (n.sentimentScore || 50), 0) / (marketNews.length || 1)}%`,
                              }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={cn(
                                "h-full transition-all duration-1000",
                                marketNews.reduce(
                                  (acc, n) => acc + (n.sentimentScore || 50),
                                  0,
                                ) /
                                  (marketNews.length || 1) >=
                                  50
                                  ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                                  : "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]",
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : view === "portfolio" ? (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">
                      Mi Portafolio
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">
                      Visualización en tiempo real de sus activos adquiridos vía
                      Numora Bot.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setIsScanningPortfolio(true);
                        setTimeout(() => {
                          setIsScanningPortfolio(false);
                          setPortfolioScanResult(
                            "Numora AI detecta una eficiencia del 92% en su gestión de riesgo. Se observa infravaloración en el sector semiconductor; considere rotación táctica.",
                          );
                        }, 2500);
                      }}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 group"
                    >
                      <BrainCircuit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Portfolio AI Scan
                    </button>
                    <div className="bg-[#151921] border border-white/5 p-4 rounded-xl flex items-center gap-4">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Valor Total
                      </p>
                      <p className="text-xl font-black text-white">
                        $
                        {portfolio
                          .reduce(
                            (acc, curr) =>
                              acc + curr.shares * curr.currentPrice,
                            0,
                          )
                          .toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                      </p>
                    </div>
                    <div className="bg-[#151921] border border-white/5 p-4 rounded-xl flex items-center gap-4">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        P/L Total
                      </p>
                      <p
                        className={cn(
                          "text-xl font-black",
                          portfolio.reduce(
                            (acc, curr) =>
                              acc +
                              curr.shares * (curr.currentPrice - curr.avgPrice),
                            0,
                          ) >= 0
                            ? "text-emerald-500"
                            : "text-red-500",
                        )}
                      >
                        {portfolio.reduce(
                          (acc, curr) =>
                            acc +
                            curr.shares * (curr.currentPrice - curr.avgPrice),
                          0,
                        ) >= 0
                          ? "+"
                          : ""}
                        $
                        {portfolio
                          .reduce(
                            (acc, curr) =>
                              acc +
                              curr.shares * (curr.currentPrice - curr.avgPrice),
                            0,
                          )
                          .toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                      </p>
                    </div>
                  </div>
                </div>

                {isScanningPortfolio && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center gap-6"
                  >
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                      <Zap className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">
                        Escaner Inteligente Activo
                      </p>
                      <p className="text-sm font-bold text-white">
                        Analizando diversificación, riesgo sistémico y
                        correlación de activos...
                      </p>
                    </div>
                  </motion.div>
                )}

                {portfolioScanResult && !isScanningPortfolio && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 bg-[#151921] border border-emerald-500/20 rounded-3xl relative overflow-hidden"
                  >
                    <button
                      onClick={() => setPortfolioScanResult(null)}
                      className="absolute top-4 right-4 text-slate-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-5 h-5 text-emerald-500" />
                      <h4 className="text-xs font-black text-white uppercase tracking-widest">
                        IA Strategic Insight
                      </h4>
                    </div>
                    <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-3xl">
                      {portfolioScanResult}
                    </p>
                  </motion.div>
                )}

                {/* Bot Statistics Panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#151921] border border-white/5 p-8 rounded-3xl group transition-all"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                        <Zap className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Operaciones
                        </p>
                        <h4 className="text-xl font-black text-white">
                          {botStats.tradesCount}
                        </h4>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold uppercase leading-relaxed">
                      Total de transacciones ejecutadas por el bot en esta
                      sesión.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#151921] border border-white/5 p-8 rounded-3xl group transition-all"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Ganancia Bot
                        </p>
                        <h4 className="text-xl font-black text-emerald-500">
                          +$
                          {botStats.totalProfit.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </h4>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold uppercase leading-relaxed">
                      P&L acumulado proyectado basado en señales algorítmicas.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#151921] border border-white/5 p-8 rounded-3xl group transition-all"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                        <Target className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Estrategia
                        </p>
                        <h4 className="text-lg font-black text-white uppercase tracking-tighter">
                          {botStats.strategy}
                        </h4>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold uppercase leading-relaxed">
                      Cruce de medias móviles rápidas (EMA) con filtro de RSI
                      dinámico.
                    </p>
                  </motion.div>
                </div>

                {portfolio.length === 0 ? (
                  <div className="bg-[#151921] border border-dashed border-white/5 p-20 rounded-3xl text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Briefcase className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Portfolio Vacío
                    </h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mb-8">
                      Comience a operar con el Trading Bot para ver sus activos
                      reflejados aquí.
                    </p>
                    <button
                      onClick={() => setView("bot")}
                      className="bg-emerald-500 text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all"
                    >
                      Ir al Bot de Trading
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolio.map((item, i) => {
                      const pl =
                        (item.currentPrice - item.avgPrice) * item.shares;
                      const plPercent =
                        ((item.currentPrice - item.avgPrice) / item.avgPrice) *
                        100;

                      return (
                        <motion.div
                          key={item.symbol}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-[#151921] border border-white/5 p-8 rounded-3xl group hover:border-emerald-500/30 transition-all"
                        >
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h4 className="text-2xl font-black text-white group-hover:text-emerald-500 transition-colors uppercase tracking-tight">
                                {item.symbol}
                              </h4>
                              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                {item.shares} Unidades
                              </p>
                            </div>
                            <div
                              className={cn(
                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                pl >= 0
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-red-500/10 text-red-500",
                              )}
                            >
                              {pl >= 0 ? "+" : ""}
                              {plPercent.toFixed(2)}%
                            </div>
                          </div>

                          <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="text-slate-500 uppercase tracking-widest">
                                Precio Promedio
                              </span>
                              <span className="text-white">
                                $
                                {item.avgPrice.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="text-slate-500 uppercase tracking-widest">
                                Precio Actual
                              </span>
                              <span className="text-white">
                                $
                                {item.currentPrice.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="text-slate-500 uppercase tracking-widest">
                                Valor Mercado
                              </span>
                              <span className="text-white">
                                $
                                {(
                                  item.shares * item.currentPrice
                                ).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                              G/P Latente
                            </span>
                            <span
                              className={cn(
                                "text-lg font-black",
                                pl >= 0 ? "text-emerald-500" : "text-red-500",
                              )}
                            >
                              {pl >= 0 ? "+" : ""}$
                              {pl.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : view === "sectors" ? (
              <motion.div
                key="sectors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">
                      Market Sectors
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">
                      Top 10 companies by sector in real-time.
                    </p>
                  </div>
                  <div className="flex gap-2 bg-[#151921] p-1 rounded-xl border border-white/5 overflow-x-auto custom-scrollbar">
                    {SECTORS_DATA.map((sec) => (
                      <button
                        key={sec.id}
                        onClick={() => setActiveSector(sec.id)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                          activeSector === sec.id
                            ? "bg-white text-black"
                            : "text-slate-500 hover:text-slate-300",
                        )}
                      >
                        {sec.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {SECTORS_DATA.find(
                    (s) => s.id === activeSector,
                  )?.companies.map((company, i) => (
                    <motion.div
                      key={company.ticker}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-[#151921] border border-white/5 p-5 rounded-2xl group hover:border-emerald-500/30 transition-all cursor-pointer flex flex-col justify-between h-32"
                      onClick={() => {
                        setSearchQuery(company.ticker);
                        setView("analysis");
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-base font-black text-white group-hover:text-emerald-500 transition-colors uppercase tracking-tight">
                            {company.ticker}
                          </h4>
                          <p className="text-[9px] font-bold text-slate-600 uppercase truncate w-24">
                            {company.name}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-black",
                            i % 2 === 0
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-red-500/10 text-red-500",
                          )}
                        >
                          {i % 2 === 0 ? "+" : "-"}
                          {(Math.random() * 2 + 0.1).toFixed(2)}%
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="h-6 w-12 opacity-50">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={Array.from({ length: 10 }, (_, idx) => ({
                                v: 50 + Math.random() * 20,
                              }))}
                            >
                              <Line
                                type="monotone"
                                dataKey="v"
                                stroke={i % 2 === 0 ? "#10B981" : "#EF4444"}
                                strokeWidth={1.5}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="text-sm font-black text-white">
                          ${(100 + Math.random() * 400).toFixed(2)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Info className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-emerald-500">
                      Inteligencia de Mercado
                    </h5>
                    <p className="text-xs text-slate-400">
                      Seleccione cualquier ticker para realizar un análisis de
                      riesgo profundo mediante Numora AI.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="analysis-intel-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-5xl mx-auto"
              >
                <div className="flex flex-col items-center justify-center pt-20 pb-32 text-center">
                  <div className="max-w-3xl w-full">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                      <Activity className="w-3 h-3" />
                      Intelligence engine online: v2.4.0
                    </div>

                    <h1 className="text-7xl font-black text-white tracking-tighter leading-none mb-8">
                      Análisis{" "}
                      <span className="text-emerald-500">Estratégico</span>{" "}
                      Institucional.
                    </h1>

                    <p className="text-lg text-slate-400 font-medium mb-12 leading-relaxed max-w-xl mx-auto">
                      Inicie una nueva investigación financiera ingresando el
                      nombre de la compañía o su ticker de mercado para obtener
                      un dictamen de riesgo.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
                      {[
                        {
                          label: "Market Volatility",
                          val: "Low",
                          icon: ShieldCheck,
                          color: "text-emerald-500",
                        },
                        {
                          label: "Institutional Flow",
                          val: "$4.2B",
                          icon: TrendingUp,
                          color: "text-emerald-500",
                        },
                        {
                          label: "Sentiment Index",
                          val: "Greed",
                          icon: Activity,
                          color: "text-amber-500",
                        },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-[#151921] border border-white/5 p-6 rounded-2xl"
                        >
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mb-4",
                              item.color,
                            )}
                          >
                            <item.icon className="w-4 h-4" />
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                            {item.label}
                          </p>
                          <p className="text-2xl font-black text-white">
                            {item.val}
                          </p>
                        </div>
                      ))}
                    </div>

                    <form
                      onSubmit={handleResearch}
                      className="relative group max-w-2xl mx-auto mb-20 shadow-2xl shadow-emerald-500/10"
                    >
                      <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <BarChart3 className="w-5 h-5 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ej. Apple Inc, TSLA, NVDA..."
                        className="w-full bg-[#151921] border border-white/5 rounded-2xl py-6 pl-16 pr-44 text-lg font-bold focus:outline-none focus:border-emerald-500/30 transition-all shadow-2xl"
                      />
                      <button
                        type="submit"
                        disabled={!searchQuery.trim() || isResearching}
                        className="absolute right-3 top-3 bottom-3 px-8 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {isResearching ? (
                          <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : (
                          "Investigar"
                        )}
                      </button>
                    </form>

                    {/* Re-implementing Dropzone */}
                    <div
                      {...getRootProps()}
                      className={cn(
                        "max-w-2xl mx-auto bg-[#151921]/50 border-2 border-dashed border-white/5 p-8 rounded-2xl flex flex-col items-center justify-center text-center group cursor-pointer hover:border-emerald-500/30 transition-all",
                        isDragActive
                          ? "border-emerald-500 bg-emerald-500/5"
                          : "",
                      )}
                    >
                      <input {...getInputProps()} />
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                          <Upload className="w-5 h-5 text-slate-500 group-hover:text-emerald-500" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-white">
                            ¿Tienes un reporte financiero?
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Sube PDF o XLSX para un análisis granular automático
                          </p>
                        </div>
                      </div>

                      {analyzing && (
                        <div className="mt-6 flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                          <Activity className="w-3 h-3" /> Procesando
                          documento...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-white/5">
                  {[
                    {
                      icon: Activity,
                      title: "Risk Engine",
                      desc: "Cálculo en tiempo real de riesgo sintético institucional basado en 48 métricas.",
                    },
                    {
                      icon: BarChart3,
                      title: "Equity Insights",
                      desc: "Comparación instantánea contra promedios del sector y proyecciones ML.",
                    },
                    {
                      icon: MessageSquare,
                      title: "Asistente IA",
                      desc: "Chat interactivo especializado en interrogación de estados financieros.",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-[#151921] border border-white/5 p-10 rounded-3xl group hover:bg-[#191f2a] transition-all"
                    >
                      <item.icon className="w-8 h-8 text-emerald-500 mb-6" />
                      <h4 className="text-xl font-black text-white mb-4">
                        {item.title}
                      </h4>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* News Detail Modal */}
          <AnimatePresence>
            {selectedNews && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10"
              >
                <motion.div
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                  onClick={() => setSelectedNews(null)}
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-[#10141d] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative z-10"
                >
                  <div className="p-8 border-b border-white/5 bg-[#151921]/50 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">
                          {selectedNews.source}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {selectedNews.time}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-slate-800">
                          •
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {selectedNews.category}
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                        {selectedNews.title}
                      </h2>
                    </div>
                    <button
                      onClick={() => setSelectedNews(null)}
                      className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                      <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                          Sentimiento AI
                        </p>
                        <p
                          className={cn(
                            "text-sm font-black uppercase tracking-tight",
                            selectedNews.sentiment === "Positive"
                              ? "text-emerald-500"
                              : selectedNews.sentiment === "Negative"
                                ? "text-red-500"
                                : "text-white",
                          )}
                        >
                          {selectedNews.sentiment}
                        </p>
                      </div>
                      <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                          Impacto Previsto
                        </p>
                        <p className="text-sm font-black text-white uppercase tracking-tight">
                          {selectedNews.impact}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Newspaper className="w-4 h-4" />
                        Contenido Original
                      </h4>
                      <p className="text-slate-300 text-base leading-relaxed font-medium">
                        {selectedNews.content}
                      </p>
                    </div>

                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Activity className="w-16 h-16 text-emerald-500" />
                      </div>
                      <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4">
                        NUMORA AI DEEP DIVE
                      </h4>
                      <p className="text-slate-300 text-sm font-medium leading-relaxed relative z-10">
                        Nuestro análisis algorítmico sugiere que esta noticia
                        valida una tesis de inversión de largo plazo.
                        Recomendamos monitorear la volatilidad del sector{" "}
                        {selectedNews.category} en las próximas 48 horas. Si
                        tienes posiciones abiertas, considera recalibrar tus
                        stop-loss or incrementar exposición si el sentimiento
                        alcista persiste.
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedNews(null)}
                      className="w-full bg-white text-black font-black uppercase text-xs tracking-[0.2em] py-4 rounded-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-lg shadow-white/5 mt-4"
                    >
                      Entendido, Seguir Analizando
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Alert Analysis Modal */}
          <AnimatePresence>
            {viewingAlert && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-black/80"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-[#0D1117] border border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl overflow-y-auto max-h-[90vh]"
                >
                  <div className="relative p-8">
                    <button
                      onClick={() => setViewingAlert(null)}
                      className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          viewingAlert.priority === "High"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-amber-500/10 text-amber-500",
                        )}
                      >
                        {viewingAlert.priority} IMPACT
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        {viewingAlert.type} • {viewingAlert.time}
                      </span>
                    </div>

                    <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight leading-tight">
                      {viewingAlert.title}
                    </h2>

                    <div className="prose prose-invert max-w-none mb-8">
                      <p className="text-slate-400 text-lg leading-relaxed font-medium capitalize">
                        {viewingAlert.desc}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                          Probabilidad de Éxito
                        </p>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-black text-emerald-500">
                            78%
                          </span>
                          <TrendingUp className="w-5 h-5 text-emerald-500 mb-1" />
                        </div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                          Riesgo Calculado
                        </p>
                        <div className="flex items-end gap-2 text-amber-500">
                          <span className="text-2xl font-black">2.4%</span>
                          <AlertTriangle className="w-5 h-5 mb-1" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">
                        Recomendación Smart AI
                      </h3>
                      <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-start gap-4">
                        <div className="p-2 bg-purple-500/20 rounded-xl">
                          <BrainCircuit className="w-5 h-5 text-purple-400" />
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                          Nuestro motor de IA sugiere una entrada escalonada. El
                          volumen confirma la ruptura, pero la sobrecompra en el
                          RSI sugiere esperar un ligero 'pullback' a los $191.80
                          antes de tomar posición completa.
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 flex gap-4">
                      <button
                        onClick={() => setViewingAlert(null)}
                        className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                      >
                        Cerrar
                      </button>
                      <button
                        onClick={() => {
                          setViewingAlert(null);
                          setView("bot");
                        }}
                        className="flex-1 px-6 py-4 bg-emerald-500 text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                      >
                        Operar con Bot
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Smart Match Overlay */}
          <AnimatePresence>
            {showSmartMatch && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0A0D12]/95 backdrop-blur-xl"
              >
                <div className="w-full max-w-md relative">
                  <div className="flex justify-between items-center mb-8 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping" />
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
                        AI Discovery Live
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setShowSmartMatch(false);
                        setMatchStep(0);
                      }}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="relative h-[550px]">
                    {(() => {
                      const allSmartMatchStocks = [
                        // TECH
                        {
                          ticker: "PLTR",
                          name: "Palantir Tech",
                          match: 98,
                          price: "$24.50",
                          change: "+5.2%",
                          sector: "tech",
                          reason: "Fuerte demanda en IA gubernamental.",
                        },
                        {
                          ticker: "NVDA",
                          name: "NVIDIA Corp",
                          match: 96,
                          price: "$850.12",
                          change: "+3.1%",
                          sector: "tech",
                          reason: "Monopolio en H100 chips.",
                        },
                        {
                          ticker: "MSFT",
                          name: "Microsoft",
                          match: 89,
                          price: "$412.30",
                          change: "+0.8%",
                          sector: "tech",
                          reason: "Crecimiento sostenido en Azure AI.",
                        },
                        {
                          ticker: "AMD",
                          name: "Advanced Micro Devices",
                          match: 91,
                          price: "$180.45",
                          change: "+3.1%",
                          sector: "tech",
                          reason:
                            "Flujo de capital rotando desde competidores.",
                        },
                        {
                          ticker: "GOOGL",
                          name: "Alphabet Inc",
                          match: 87,
                          price: "$152.12",
                          change: "+1.5%",
                          sector: "tech",
                          reason: "Potencial infravalorado en Gemini 1.5.",
                        },
                        {
                          ticker: "SNOW",
                          name: "Snowflake",
                          match: 82,
                          price: "$165.40",
                          change: "-0.5%",
                          sector: "tech",
                          reason: "Recuperación en gasto de nube esperado.",
                        },

                        // FINANCE
                        {
                          ticker: "JPM",
                          name: "JP Morgan",
                          match: 88,
                          price: "$192.40",
                          change: "+0.5%",
                          sector: "finance",
                          reason: "Expansión de márgenes netos.",
                        },
                        {
                          ticker: "V",
                          name: "Visa Inc",
                          match: 84,
                          price: "$275.10",
                          change: "+1.1%",
                          sector: "finance",
                          reason: "Crecimiento en pagos cross-border.",
                        },
                        {
                          ticker: "GS",
                          name: "Goldman Sachs",
                          match: 82,
                          price: "$405.12",
                          change: "+1.2%",
                          sector: "finance",
                          reason: "Recuperación en el mercado de M&A.",
                        },
                        {
                          ticker: "MA",
                          name: "Mastercard",
                          match: 85,
                          price: "$460.25",
                          change: "+0.9%",
                          sector: "finance",
                          reason: "Resiliencia en consumo global.",
                        },
                        {
                          ticker: "BAC",
                          name: "Bank of America",
                          match: 79,
                          price: "$35.12",
                          change: "+0.2%",
                          sector: "finance",
                          reason: "Sólida base de depósitos retail.",
                        },
                        {
                          ticker: "PYPL",
                          name: "PayPal",
                          match: 71,
                          price: "$62.30",
                          change: "-1.2%",
                          sector: "finance",
                          reason: "Fuerte competencia en checkout.",
                        },

                        // HEALTH
                        {
                          ticker: "LLY",
                          name: "Eli Lilly",
                          match: 95,
                          price: "$780.20",
                          change: "+4.2%",
                          sector: "health",
                          reason: "Liderazgo en farmacéutica metabólica.",
                        },
                        {
                          ticker: "VRTX",
                          name: "Vertex Pharma",
                          match: 92,
                          price: "$420.30",
                          change: "+3.4%",
                          sector: "health",
                          reason:
                            "Nueva patente aprobada para tratamiento genético.",
                        },
                        {
                          ticker: "UNH",
                          name: "UnitedHealth",
                          match: 86,
                          price: "$480.15",
                          change: "+0.4%",
                          sector: "health",
                          reason: "Dominio en gestión de planes de salud.",
                        },
                        {
                          ticker: "PFE",
                          name: "Pfizer",
                          match: 72,
                          price: "$28.15",
                          change: "-0.8%",
                          sector: "health",
                          reason: "Reestructuración post-pandemia.",
                        },
                        {
                          ticker: "ABBV",
                          name: "AbbVie",
                          match: 84,
                          price: "$175.40",
                          change: "+1.5%",
                          sector: "health",
                          reason: "Sólido portafolio de inmunología.",
                        },
                        {
                          ticker: "AMGN",
                          name: "Amgen",
                          match: 81,
                          price: "$282.10",
                          change: "+0.7%",
                          sector: "health",
                          reason: "Crecimiento en biosimilares.",
                        },

                        // ENERGY
                        {
                          ticker: "XOM",
                          name: "Exxon Mobil",
                          match: 91,
                          price: "$118.45",
                          change: "+2.1%",
                          sector: "energy",
                          reason: "Máxima eficiencia operativa.",
                        },
                        {
                          ticker: "TSLA",
                          name: "Tesla Inc",
                          match: 89,
                          price: "$175.20",
                          change: "-1.5%",
                          sector: "energy",
                          reason: "Líder en almacenamiento Megapacks.",
                        },
                        {
                          ticker: "FSLR",
                          name: "First Solar",
                          match: 88,
                          price: "$150.25",
                          change: "+4.1%",
                          sector: "energy",
                          reason: "Subsidios gubernamentales.",
                        },
                        {
                          ticker: "CVX",
                          name: "Chevron",
                          match: 87,
                          price: "$158.20",
                          change: "+1.3%",
                          sector: "energy",
                          reason: "Fuerte generación de flujo de caja.",
                        },
                        {
                          ticker: "NEP",
                          name: "NextEra Energy",
                          match: 85,
                          price: "$62.15",
                          change: "+2.4%",
                          sector: "energy",
                          reason: "Líder en utilities renovables.",
                        },
                        {
                          ticker: "ENPH",
                          name: "Enphase Energy",
                          match: 83,
                          price: "$120.40",
                          change: "-2.1%",
                          sector: "energy",
                          reason: "Recuperación de inventarios en Europa.",
                        },

                        // CONSUMER
                        {
                          ticker: "AMZN",
                          name: "Amazon.com",
                          match: 97,
                          price: "$178.40",
                          change: "+1.2%",
                          sector: "consumer",
                          reason: "Dominio absoluto en e-commerce y AWS.",
                        },
                        {
                          ticker: "WMT",
                          name: "Walmart Inc.",
                          match: 85,
                          price: "$60.12",
                          change: "+0.4%",
                          sector: "consumer",
                          reason: "Resiliencia en consumo básico.",
                        },
                        {
                          ticker: "NKE",
                          name: "Nike Inc.",
                          match: 78,
                          price: "$92.30",
                          change: "-0.5%",
                          sector: "consumer",
                          reason:
                            "Optimización de venta directa al consumidor.",
                        },
                        {
                          ticker: "MCD",
                          name: "McDonald's",
                          match: 82,
                          price: "$282.15",
                          change: "+0.1%",
                          sector: "consumer",
                          reason: "Fuerte poder de fijación de precios.",
                        },

                        // COMMUNICATION
                        {
                          ticker: "NFLX",
                          name: "Netflix Inc",
                          match: 93,
                          price: "$610.12",
                          change: "+2.1%",
                          sector: "comm",
                          reason: "Líder indiscutible en streaming pago.",
                        },
                        {
                          ticker: "META",
                          name: "Meta Platforms",
                          match: 95,
                          price: "$485.30",
                          change: "+3.2%",
                          sector: "comm",
                          reason: "Potencial de monetización de Llama 3.",
                        },
                        {
                          ticker: "DIS",
                          name: "Walt Disney",
                          match: 74,
                          price: "$112.45",
                          change: "+0.5%",
                          sector: "comm",
                          reason: "Recuperación gradual en parques y Disney+.",
                        },
                      ];

                      const filteredStocks = allSmartMatchStocks.filter(
                        (s) => s.sector === activeSector,
                      );

                      if (filteredStocks.length === 0) {
                        return (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-[#151921] border border-white/10 rounded-[40px]">
                            <BrainCircuit className="w-16 h-16 text-purple-400 mb-6 opacity-40" />
                            <h3 className="text-xl font-bold text-white mb-2">
                              Sin coincidencias hoy
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mb-8">
                              Nuestros modelos no detectaron oportunidades de
                              alta afinidad para el sector {activeSector} en
                              este momento.
                            </p>
                            <button
                              onClick={() => {
                                setShowSmartMatch(false);
                                setMatchStep(0);
                              }}
                              className="bg-purple-500 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest"
                            >
                              Volver al Lab
                            </button>
                          </div>
                        );
                      }

                      if (matchStep < filteredStocks.length) {
                        const stock = filteredStocks[matchStep];
                        return (
                          <motion.div
                            key={stock.ticker}
                            initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ x: 500, opacity: 0, rotate: 20 }}
                            className="absolute inset-0 bg-[#151921] border border-white/10 rounded-[40px] p-8 shadow-2xl flex flex-col"
                          >
                            <div className="flex justify-between items-start mb-6">
                              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-purple-500/20">
                                {stock.ticker[0]}
                              </div>
                              <div className="text-right">
                                <p className="text-3xl font-black text-white tracking-tighter">
                                  {stock.price}
                                </p>
                                <p className="text-sm font-bold text-emerald-500">
                                  {stock.change}
                                </p>
                              </div>
                            </div>

                            <div className="mb-8">
                              <h3 className="text-4xl font-black text-white tracking-tighter mb-1">
                                {stock.ticker}
                              </h3>
                              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                                {stock.name}
                              </p>
                            </div>

                            <div className="flex-1 bg-white/5 rounded-3xl p-6 border border-white/5 mb-8">
                              <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                                  IA Insight
                                </span>
                              </div>
                              <p className="text-sm text-slate-300 font-medium leading-relaxed">
                                {stock.reason}
                              </p>
                              <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-end">
                                <div>
                                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">
                                    Score de afinidad
                                  </p>
                                  <p className="text-2xl font-black text-white">
                                    {stock.match}%
                                  </p>
                                </div>
                                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-purple-500"
                                    style={{ width: `${stock.match}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-4">
                              <button
                                onClick={() => setMatchStep((prev) => prev + 1)}
                                className="flex-1 bg-white/5 hover:bg-red-500/20 border border-white/10 py-5 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all"
                              >
                                <X className="w-6 h-6" />
                              </button>
                              <button
                                onClick={() => setMatchStep((prev) => prev + 1)}
                                className="flex-[2] bg-purple-500 hover:bg-purple-400 text-white font-black uppercase text-xs tracking-widest py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-purple-500/20 transition-all"
                              >
                                Agregar a Watchlist
                                <Zap className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      } else {
                        return (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                              <ShieldCheck className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">
                              ¡Todo al día!
                            </h3>
                            <p className="text-sm text-slate-500 font-medium mb-8">
                              Has revisado todas las sugerencias de hoy para el
                              sector {activeSector}.
                            </p>
                            <button
                              onClick={() => {
                                setShowSmartMatch(false);
                                setMatchStep(0);
                              }}
                              className="bg-white text-black px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest"
                            >
                              Volver al Lab
                            </button>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

// --- Welcome Intro Component ---
const WelcomeIntro = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    // Safety fallback: auto-complete intro after 25 seconds (video should be shorter)
    const timer = setTimeout(onComplete, 25000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#0B0E14] flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
      <video
        autoPlay
        muted
        playsInline
        onEnded={onComplete}
        onError={onComplete}
        className="w-full h-full object-cover scale-[1.01]"
      >
        <source
          src="https://firebasestorage.googleapis.com/v0/b/involuted-reach-493501-n0.firebasestorage.app/o/descarga%20(2).mp4?alt=media&token=50c1edb1-1759-4e25-a355-c085b21165f0"
          type="video/mp4"
        />
      </video>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/20">
            <ChevronRight className="w-6 h-6 text-black rotate-[-45deg]" />
          </div>
          <h2 className="text-xl font-black text-white tracking-[0.4em] uppercase">
            Numora
          </h2>
        </motion.div>

        <button
          onClick={onComplete}
          className="px-8 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-full text-white/50 hover:text-white text-[9px] font-black uppercase tracking-[0.3em] transition-all group overflow-hidden relative"
        >
          <span className="relative z-10 flex items-center gap-2">
            Omitir Intro
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </button>
      </div>
    </motion.div>
  );
};

// --- TradingView Chart Component ---
const TradingViewChart = ({ symbol }: { symbol: string }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current || !symbol) return;

    // Clear previous widget
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol.includes(":") ? symbol : `NASDAQ:${symbol}`,
      interval: "D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "3",
      locale: "en",
      backgroundColor: "rgba(0, 0, 0, 0)",
      gridColor: "rgba(255, 255, 255, 0.05)",
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = "";
      }
    };
  }, [symbol]);

  return (
    <div className="w-full h-[500px] bg-black/20 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-2">
          <Activity className="w-8 h-8 text-indigo-500 animate-pulse" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Neural Stream Linking...
          </p>
        </div>
      </div>
      <div
        ref={container}
        className="tradingview-widget-container w-full h-full relative z-10"
      />
    </div>
  );
};

const AppContent = () => {
  const { user, loading, isAuthReady } = useAuth();
  const [showIntro, setShowIntro] = useState(true);

  if (!isAuthReady || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0E14]">
        <div className="w-16 h-16 bg-[#0B0E14] border-2 border-white/5 border-t-emerald-500 rounded-2xl animate-spin mb-8 shadow-2xl" />
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">
            Neural Link
          </h3>
          <div className="flex gap-1">
            <motion.div
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-1 bg-emerald-500 rounded-full"
            />
            <motion.div
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
              className="w-1 h-1 bg-emerald-500 rounded-full"
            />
            <motion.div
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
              className="w-1 h-1 bg-emerald-500 rounded-full"
            />
          </div>
        </div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <AnimatePresence mode="wait">
        <WelcomeIntro
          key="welcome-intro"
          onComplete={() => setShowIntro(false)}
        />
      </AnimatePresence>
    );
  }

  return user ? <Dashboard /> : <Login />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
