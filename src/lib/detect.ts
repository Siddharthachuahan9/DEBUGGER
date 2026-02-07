import { InputType } from "@/types";

type DetectionResult = {
  inputType: InputType;
  language: string | null;
  framework: string | null;
  database: string | null;
  cloud: string | null;
};

const LANGUAGE_PATTERNS: Record<string, RegExp[]> = {
  Python: [
    /Traceback \(most recent call last\)/i,
    /File ".*\.py"/i,
    /\.py", line \d+/i,
    /ImportError|ModuleNotFoundError/i,
    /IndentationError|SyntaxError.*\.py/i,
  ],
  JavaScript: [
    /at\s+\S+\s+\(.*\.js:\d+:\d+\)/,
    /TypeError:.*is not a function/i,
    /ReferenceError:.*is not defined/i,
    /\.js:\d+/,
    /node_modules\//,
  ],
  TypeScript: [
    /\.ts:\d+:\d+/,
    /\.tsx:\d+:\d+/,
    /TS\d{4}:/,
    /Type '.*' is not assignable/i,
  ],
  Java: [
    /at\s+[\w.]+\([\w]+\.java:\d+\)/,
    /Exception in thread/i,
    /\.java:\d+/,
    /NullPointerException/i,
  ],
  Go: [
    /goroutine \d+/,
    /\.go:\d+/,
    /panic:/,
    /runtime\.gopanic/,
  ],
  Rust: [
    /thread '.*' panicked at/,
    /\.rs:\d+:\d+/,
    /error\[E\d+\]/,
  ],
  Ruby: [
    /\.rb:\d+:in/,
    /from.*\.rb:\d+/,
    /NoMethodError|NameError/i,
  ],
  PHP: [
    /\.php on line \d+/i,
    /Fatal error:/i,
    /PHP (?:Parse|Fatal|Warning) error/i,
  ],
  SQL: [
    /SELECT|INSERT|UPDATE|DELETE|ALTER|CREATE|DROP/i,
    /FROM\s+\w+/i,
    /WHERE\s+/i,
    /JOIN\s+/i,
  ],
};

const FRAMEWORK_PATTERNS: Record<string, RegExp[]> = {
  "Next.js": [/next\/dist/i, /getServerSideProps|getStaticProps/i, /next-server/i],
  React: [/react-dom/i, /React\.createElement/i, /useState|useEffect/i],
  Django: [/django\./i, /wsgi\.py/i, /manage\.py/i],
  Express: [/express/i, /app\.listen/i, /req\.\w+|res\.\w+/],
  "Spring Boot": [/org\.springframework/i, /\.java:\d+.*Controller/i],
  Rails: [/actionpack|activerecord|activesupport/i, /\.rb:\d+:in/],
  Laravel: [/Illuminate\\/i, /artisan/i, /Laravel/i],
  Flask: [/flask\./i, /werkzeug/i],
  FastAPI: [/fastapi/i, /uvicorn/i, /starlette/i],
};

const DATABASE_PATTERNS: Record<string, RegExp[]> = {
  PostgreSQL: [/psycopg|pg_|postgresql|PGRES|ERROR:\s+\d{5}/i],
  MySQL: [/mysql|MariaDB|errno: \d+/i],
  MongoDB: [/MongoError|mongoose|mongo/i],
  Redis: [/REDIS|redis-cli|WRONGTYPE/i],
  SQLite: [/sqlite3?/i, /SQLITE_/i],
};

const CLOUD_PATTERNS: Record<string, RegExp[]> = {
  AWS: [/arn:aws|amazonaws\.com|AWS::/i, /botocore|boto3/i],
  GCP: [/googleapis\.com|gcloud|google\.cloud/i],
  Azure: [/azure|\.windows\.net|microsoft\.com\/azure/i],
  Vercel: [/vercel|VERCEL_|v0\.dev/i],
  Cloudflare: [/cloudflare|workers\.dev|CF-/i],
};

function matchPatterns(input: string, patterns: Record<string, RegExp[]>): string | null {
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const [name, regexes] of Object.entries(patterns)) {
    const score = regexes.filter((r) => r.test(input)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = name;
    }
  }

  return bestMatch;
}

function detectInputType(input: string): InputType {
  const trimmed = input.trim();

  // JSON detection
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      return "json"; // malformed JSON is still JSON debug territory
    }
  }

  // SQL detection
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|ALTER|CREATE|DROP|WITH|EXPLAIN)\s/i.test(trimmed)) {
    return "sql";
  }

  // Stack trace detection
  if (
    /Traceback \(most recent call last\)/i.test(trimmed) ||
    /at\s+\S+\s+\(.*:\d+:\d+\)/.test(trimmed) ||
    /Exception in thread/i.test(trimmed) ||
    /goroutine \d+/.test(trimmed) ||
    /thread '.*' panicked at/.test(trimmed)
  ) {
    return "stacktrace";
  }

  // API error detection
  if (
    /HTTP\/\d|status[: ]\d{3}|curl|4\d{2}|5\d{2}/i.test(trimmed) &&
    /(error|fail|refused|timeout|unauthorized|forbidden)/i.test(trimmed)
  ) {
    return "api";
  }

  // Build error detection
  if (
    /error TS\d+|ELIFECYCLE|Build failed|Compilation failed|ERROR in/i.test(trimmed) ||
    /Module not found|Cannot find module/i.test(trimmed)
  ) {
    return "build";
  }

  // Config detection
  if (
    /\.ya?ml|\.toml|\.ini|\.conf|\.env/i.test(trimmed) ||
    /configuration error|config/i.test(trimmed)
  ) {
    return "config";
  }

  // Log detection
  if (
    /\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}/i.test(trimmed) ||
    /\[(INFO|WARN|ERROR|DEBUG|FATAL)\]/i.test(trimmed) ||
    /^\[?\d{2}:\d{2}:\d{2}/m.test(trimmed)
  ) {
    return "log";
  }

  // Runtime error detection
  if (
    /(Error|Exception|Panic|Fatal|Segfault|SIGSEGV|SIGABRT):/i.test(trimmed)
  ) {
    return "runtime";
  }

  return "unknown";
}

export function detect(input: string): DetectionResult {
  return {
    inputType: detectInputType(input),
    language: matchPatterns(input, LANGUAGE_PATTERNS),
    framework: matchPatterns(input, FRAMEWORK_PATTERNS),
    database: matchPatterns(input, DATABASE_PATTERNS),
    cloud: matchPatterns(input, CLOUD_PATTERNS),
  };
}
