export const OVERVIEW_QUESTIONS = [
  {
    id: "inventory",
    question: "How much inventory exists?",
    widget: "Total inventory KPI",
  },
  {
    id: "distributed",
    question: "How much has been distributed?",
    widget: "Distributed KPI",
  },
  {
    id: "sold",
    question: "How much has been sold?",
    widget: "Sold KPI",
  },
  {
    id: "libraries",
    question: "Which libraries sell fastest?",
    widget: "Fastest-selling libraries",
  },
  {
    id: "low-stock",
    question: "Which books are low stock?",
    widget: "Low-stock books",
  },
  {
    id: "top-books",
    question: "Which books sell best?",
    widget: "Top sellers",
  },
  {
    id: "activity",
    question: "What happened recently?",
    widget: "Recent activity",
  },
] as const;

export const PERIOD_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
] as const;
