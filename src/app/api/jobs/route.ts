import { NextRequest, NextResponse } from 'next/server'

/* ------------------------------------------------------------------ */
/*  Role categories with Firecrawl search prompts                      */
/* ------------------------------------------------------------------ */

const ROLE_CATEGORIES: Record<string, { label: string; queries: string[] }> = {
  all: {
    label: 'All Jobs',
    queries: [
      'freshers jobs India hiring now 2025 2026',
      'entry level jobs India walk-in interview',
    ],
  },
  sales: {
    label: 'Sales',
    queries: [
      'sales executive jobs Delhi NCR fresher salary 15000 to 30000 site:naukri.com OR site:indeed.co.in',
    ],
  },
  receptionist: {
    label: 'Front Desk',
    queries: [
      'receptionist front desk executive jobs Delhi site:naukri.com OR site:indeed.co.in OR site:quikr.com',
    ],
  },
  admin: {
    label: 'Admin',
    queries: [
      'office admin coordinator jobs Delhi NCR graduate site:indeed.co.in OR site:shine.com',
    ],
  },
  'customer-support': {
    label: 'BPO / Telecaller',
    queries: [
      'BPO telecaller customer support voice process jobs Gurugram Delhi site:naukri.com OR site:indeed.co.in',
    ],
  },
  accounts: {
    label: 'Accounts',
    queries: [
      'accounts assistant tally BCom jobs Delhi NCR site:naukri.com OR site:indeed.co.in',
    ],
  },
  marketing: {
    label: 'Marketing',
    queries: [
      'field marketing executive jobs Delhi freshers site:indeed.co.in OR site:naukri.com',
    ],
  },
  retail: {
    label: 'Retail',
    queries: [
      'retail store associate sales jobs Delhi site:indeed.co.in OR site:quikr.com',
    ],
  },
  'data-entry': {
    label: 'Data Entry',
    queries: [
      'data entry operator jobs Delhi work from home site:indeed.co.in OR site:naukri.com',
    ],
  },
  telecalling: {
    label: 'Telecalling',
    queries: [
      'telecaller telesales executive jobs India hiring site:naukri.com OR site:indeed.co.in',
    ],
  },
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface JobPost {
  id: string
  title: string
  company: string
  location: string
  salary: string
  type: string
  experience: string
  description: string
  requirements: string[]
  postedAt: string
  sourceUrl: string
  sourceName: string
  category: string
  tags: string[]
}

/* ------------------------------------------------------------------ */
/*  Cache                                                              */
/* ------------------------------------------------------------------ */

const cache: Record<string, { data: JobPost[]; timestamp: number }> = {}
const CACHE_TTL = 30 * 60 * 1000

/* ------------------------------------------------------------------ */
/*  GET handler                                                        */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category') || 'all'
  const search = req.nextUrl.searchParams.get('search') || ''
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1')
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10')

  const cacheKey = `jobs_${category}`

  let allJobs: JobPost[]

  // Check cache
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
    allJobs = cache[cacheKey].data
  } else {
    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY
    if (!FIRECRAWL_API_KEY) {
      allJobs = generateMockJobs(category)
    } else {
      allJobs = await fetchFromFirecrawl(category, FIRECRAWL_API_KEY)
      cache[cacheKey] = { data: allJobs, timestamp: Date.now() }
    }
  }

  // Apply search filter
  let filtered = allJobs
  if (search) {
    const q = search.toLowerCase()
    filtered = allJobs.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.tags.some((t) => t.toLowerCase().includes(q)) ||
        job.description.toLowerCase().includes(q)
    )
  }

  const paginated = filtered.slice((page - 1) * limit, page * limit)

  return NextResponse.json({
    jobs: paginated,
    total: filtered.length,
    page,
    hasMore: page * limit < filtered.length,
    categories: Object.entries(ROLE_CATEGORIES).map(([key, val]) => ({
      key,
      label: val.label,
    })),
  })
}

/* ------------------------------------------------------------------ */
/*  Firecrawl fetcher                                                  */
/* ------------------------------------------------------------------ */

async function fetchFromFirecrawl(category: string, apiKey: string): Promise<JobPost[]> {
  const roleConfig = ROLE_CATEGORIES[category] || ROLE_CATEGORIES.all
  const allJobs: JobPost[] = []

  for (const query of roleConfig.queries) {
    try {
      const response = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          query,
          limit: 10,
          scrapeOptions: { formats: ['markdown'] },
        }),
      })

      if (!response.ok) continue
      const data = await response.json()

      if (data.data && Array.isArray(data.data)) {
        for (const result of data.data) {
          const parsed = parseJobFromSearchResult(result, category)
          if (parsed) allJobs.push(parsed)
        }
      }
    } catch {
      // Continue on failure
    }
  }

  // Deduplicate
  const seen = new Set<string>()
  return allJobs.filter((job) => {
    const key = `${job.title}-${job.company}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/* ------------------------------------------------------------------ */
/*  Parser                                                             */
/* ------------------------------------------------------------------ */

function parseJobFromSearchResult(
  result: { url?: string; title?: string; markdown?: string; description?: string },
  category: string
): JobPost | null {
  if (!result.url || !result.title) return null

  const content = result.markdown || result.description || ''
  const title = extractJobTitle(result.title, content)
  const company = extractCompany(result.title, content)
  const location = extractLocation(content)
  const salary = extractSalary(content)
  const experience = extractExperience(content)
  const requirements = extractRequirements(content)

  if (!title) return null

  return {
    id: Buffer.from(result.url).toString('base64').slice(0, 20) + Date.now().toString(36),
    title,
    company: company || 'Company',
    location: location || 'India',
    salary: salary || 'Not disclosed',
    type: 'Full-time',
    experience: experience || 'Fresher - 3 years',
    description: cleanDescription(content).slice(0, 500),
    requirements,
    postedAt: new Date().toISOString(),
    sourceUrl: result.url,
    sourceName: extractSourceName(result.url),
    category,
    tags: extractTags(title, content, category),
  }
}

/* ------------------------------------------------------------------ */
/*  Extraction helpers                                                 */
/* ------------------------------------------------------------------ */

function extractJobTitle(pageTitle: string, content: string): string {
  const cleaned = pageTitle
    .replace(/\s*[-|]\s*(Naukri|Indeed|LinkedIn|Glassdoor|Shine|Monster).*$/i, '')
    .replace(/\s*[-|]\s*Apply Now.*$/i, '')
    .replace(/Job\s*Details?\s*[-|:]/i, '')
    .trim()
  if (cleaned.length > 10 && cleaned.length < 100) return cleaned
  const titleMatch = content.match(/(?:Job\s*Title|Position|Role)\s*[:\-]\s*(.+?)[\n\r]/i)
  if (titleMatch) return titleMatch[1].trim()
  return pageTitle.slice(0, 80)
}

function extractCompany(pageTitle: string, content: string): string {
  const patterns = [
    /(?:Company|Employer|Organisation|Organization)\s*[:\-]\s*(.+?)[\n\r]/i,
    /(?:at|@)\s+([A-Z][A-Za-z\s&.]+?)(?:\s*[-|,]|\n)/,
  ]
  for (const pattern of patterns) {
    const match = content.match(pattern) || pageTitle.match(pattern)
    if (match) return match[1].trim().slice(0, 60)
  }
  return ''
}

function extractLocation(content: string): string {
  const patterns = [
    /(?:Location|City|Place)\s*[:\-]\s*(.+?)[\n\r]/i,
    /(?:Delhi|Mumbai|Bangalore|Bengaluru|Hyderabad|Chennai|Kolkata|Pune|Noida|Gurgaon|Gurugram|Jaipur|Lucknow|Ahmedabad|Chandigarh|Indore|Bhopal|Patna|Remote|Work from home|WFH)/i,
  ]
  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match) return (match[1] || match[0]).trim().slice(0, 50)
  }
  return ''
}

function extractSalary(content: string): string {
  const patterns = [
    /(?:Salary|CTC|Package|Compensation)\s*[:\-]\s*(.+?)[\n\r]/i,
    /(?:Rs\.?|INR|₹)\s*[\d,.]+\s*[-–to]+\s*(?:Rs\.?|INR|₹)?\s*[\d,.]+\s*(?:per\s*(?:month|annum|year)|LPA|L\.?P\.?A\.?|p\.?a\.?|PM|lakh)/i,
    /[\d,.]+\s*[-–]\s*[\d,.]+\s*(?:LPA|L\.?P\.?A\.?|lakh|per\s*month)/i,
  ]
  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match) return (match[1] || match[0]).trim().slice(0, 60)
  }
  return ''
}

function extractExperience(content: string): string {
  const patterns = [
    /(?:Experience|Exp\.?)\s*[:\-]\s*(.+?)[\n\r]/i,
    /(\d+\s*[-–to]+\s*\d+\s*(?:years?|yrs?))/i,
    /(Fresher|Fresh graduate|0\s*[-–]\s*\d+\s*(?:years?|yrs?))/i,
  ]
  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match) return (match[1] || match[0]).trim().slice(0, 40)
  }
  return ''
}

function extractRequirements(content: string): string[] {
  const requirements: string[] = []

  const reqSection = content.match(
    /(?:Requirements?|Qualifications?|Eligibility|Skills?\s*Required|Must\s*Have)[:\s]*\n([\s\S]*?)(?:\n\n|\n(?=[A-Z][a-z]+:))/i
  )

  if (reqSection) {
    const lines = reqSection[1].split('\n')
    for (const line of lines) {
      const cleaned = line.replace(/^[\s\-*•·]+/, '').trim()
      if (cleaned.length > 5 && cleaned.length < 120) {
        requirements.push(cleaned)
      }
    }
  }

  if (requirements.length === 0) {
    const patterns = [
      /(?:Graduate|BA|BCom|BBA|BSc|BTech|BCA|MBA|MCom|MSc|12th|10th)\s*(?:pass|or above|preferred)?/gi,
      /good\s+communication\s+(?:skills?)?/gi,
      /(?:Bike|Two[\s-]wheeler|DL)\s*(?:\+\s*DL)?\s*(?:preferred|required|mandatory)?/gi,
      /(?:Tally|MS\s*Office|Excel|SAP)\s*(?:knowledge|required|preferred)?/gi,
    ]
    for (const pattern of patterns) {
      const matches = content.match(pattern)
      if (matches) {
        for (const m of matches) {
          const cleaned = m.trim()
          if (cleaned.length > 3 && !requirements.includes(cleaned)) {
            requirements.push(cleaned)
          }
        }
      }
    }
  }

  return requirements.slice(0, 6)
}

function extractSourceName(url: string): string {
  try {
    const hostname = new URL(url).hostname
    if (hostname.includes('naukri')) return 'Naukri'
    if (hostname.includes('indeed')) return 'Indeed'
    if (hostname.includes('linkedin')) return 'LinkedIn'
    if (hostname.includes('glassdoor')) return 'Glassdoor'
    if (hostname.includes('shine')) return 'Shine'
    if (hostname.includes('monster')) return 'Monster India'
    if (hostname.includes('freshersworld')) return 'FreshersWorld'
    if (hostname.includes('timesjobs')) return 'TimesJobs'
    if (hostname.includes('quikr')) return 'QuikrJobs'
    if (hostname.includes('workindia')) return 'WorkIndia'
    return hostname.replace('www.', '').split('.')[0]
  } catch {
    return 'Web'
  }
}

function extractTags(title: string, content: string, category: string): string[] {
  const tags: string[] = []
  const text = `${title} ${content}`.toLowerCase()

  const tagKeywords: Record<string, string> = {
    fresher: 'Freshers OK',
    'walk-in': 'Walk-in',
    'work from home': 'WFH Option',
    wfh: 'WFH Option',
    remote: 'Remote',
    urgent: 'Urgent Hiring',
    'immediate joining': 'Immediate Joining',
    'part time': 'Part-time',
    'night shift': 'Night Shift',
    rotational: 'Rotational Shift',
    internship: 'Internship',
    'no experience': 'No Exp Required',
    incentive: 'Incentives',
    cab: 'Cab Facility',
  }

  for (const [keyword, tag] of Object.entries(tagKeywords)) {
    if (text.includes(keyword) && !tags.includes(tag)) tags.push(tag)
  }

  if (tags.length === 0) {
    const catLabel = ROLE_CATEGORIES[category]?.label
    if (catLabel) tags.push(catLabel)
  }

  return tags.slice(0, 5)
}

function cleanDescription(content: string): string {
  return content
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*{1,2}/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

function generateMockJobs(category: string): JobPost[] {
  const mockData: JobPost[] = [
    {
      id: 'mock-1',
      title: 'Sales Executive - Field Sales',
      company: 'ABC Corp Pvt Ltd',
      location: 'Noida, UP',
      salary: '₹18,000 – ₹25,000/mo',
      type: 'Full-time',
      experience: '0 - 2 years',
      description: 'We are looking for energetic Sales Executives for our Delhi NCR operations. Candidates should have good communication skills in Hindi and English. Freshers with a go-getter attitude are welcome. Daily field visits to retail shops and small businesses required. Attractive incentives on achieving targets.',
      requirements: ['Graduate (BA/BCom/BBA)', 'Good communication in Hindi & English', 'Bike + DL preferred', 'Willingness to travel locally'],
      postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://naukri.com',
      sourceName: 'Naukri',
      category: 'sales',
      tags: ['Walk-in', 'Freshers OK', 'Immediate Joining'],
    },
    {
      id: 'mock-2',
      title: 'Receptionist / Front Desk Executive',
      company: 'Sunrise Hospital',
      location: 'Mumbai, Maharashtra',
      salary: '₹12,000 – ₹18,000/mo',
      type: 'Full-time',
      experience: 'Fresher - 1 year',
      description: 'Hiring a polite and presentable Front Desk Executive for our hospital reception. Must be comfortable handling patient queries, phone calls, and appointment scheduling. Basic computer knowledge required.',
      requirements: ['Graduate in any stream', 'Basic computer knowledge', 'Presentable personality', 'Hindi & English fluency'],
      postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://indeed.com',
      sourceName: 'Indeed',
      category: 'receptionist',
      tags: ['Freshers OK', 'Immediate Joining'],
    },
    {
      id: 'mock-3',
      title: 'Data Entry Operator - Work From Home',
      company: 'InfoTech Solutions',
      location: 'Remote / Delhi NCR',
      salary: '₹10,000 – ₹15,000/mo',
      type: 'Full-time',
      experience: '0 - 1 year',
      description: 'Data entry position with typing speed requirement of 30+ WPM. Work involves entering customer data, maintaining Excel sheets, and basic reporting. Fixed shift timing 10 AM - 7 PM. Laptop/desktop with internet required for WFH.',
      requirements: ['12th pass or Graduate', 'Typing speed 30+ WPM', 'MS Office / Excel knowledge', 'Laptop with internet (for WFH)'],
      postedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://naukri.com',
      sourceName: 'Naukri',
      category: 'data-entry',
      tags: ['WFH Option', 'Freshers OK', 'Night Shift'],
    },
    {
      id: 'mock-4',
      title: 'Customer Care Executive - Voice Process',
      company: 'ConnectPlus BPO',
      location: 'Bangalore, Karnataka',
      salary: '₹14,000 – ₹20,000/mo',
      type: 'Full-time',
      experience: '0 - 2 years',
      description: 'Inbound customer support for a leading telecom company. Must have good communication skills. Rotational shifts with cab facility provided. PF, ESI, and health insurance included. Freshers welcome - training provided.',
      requirements: ['Graduate (any stream)', 'Good communication in English + Hindi/Kannada', 'Comfortable with rotational shifts'],
      postedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://indeed.com',
      sourceName: 'Indeed',
      category: 'customer-support',
      tags: ['Freshers OK', 'Immediate Joining'],
    },
    {
      id: 'mock-5',
      title: 'Telecaller - Insurance Sales',
      company: 'Bajaj Finserv Partner',
      location: 'Hyderabad, Telangana',
      salary: '₹12,000 – ₹18,000 + Incentives',
      type: 'Full-time',
      experience: '0 - 1 year',
      description: 'Outbound calling for insurance product promotion. Fixed salary plus attractive performance incentives. We provide complete product training. Hindi and Telugu speaking candidates preferred.',
      requirements: ['BA/BSc/BCom preferred', 'Good phone etiquette', 'Hindi + Telugu speaking preferred'],
      postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://naukri.com',
      sourceName: 'Naukri',
      category: 'telecalling',
      tags: ['Freshers OK', 'Immediate Joining'],
    },
    {
      id: 'mock-6',
      title: 'Showroom Sales Associate',
      company: 'Reliance Retail',
      location: 'Pune, Maharashtra',
      salary: '₹13,000 – ₹17,000/mo',
      type: 'Full-time',
      experience: '0 - 2 years',
      description: 'Looking for energetic candidates for our retail store in Pune. Job involves assisting customers, maintaining product displays, and achieving daily sales targets. Employee discount on all products. Growth opportunities to floor manager.',
      requirements: ['12th pass or Graduate', 'Presentable and customer-friendly', 'Comfortable standing for long hours', 'Marathi/Hindi fluency'],
      postedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://indeed.com',
      sourceName: 'Indeed',
      category: 'retail',
      tags: ['Walk-in', 'Freshers OK'],
    },
    {
      id: 'mock-7',
      title: 'Office Admin / Coordinator',
      company: 'Sharma & Associates',
      location: 'Jaipur, Rajasthan',
      salary: '₹10,000 – ₹14,000/mo',
      type: 'Full-time',
      experience: 'No experience required',
      description: 'Office coordinator required for CA firm. Work includes document management, courier dispatch, client coordination, and basic admin tasks. Timings 9:30 AM to 6:30 PM. Immediate joining available.',
      requirements: ['12th pass minimum', 'Basic English reading/writing', 'Punctual and reliable'],
      postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://naukri.com',
      sourceName: 'Naukri',
      category: 'admin',
      tags: ['Immediate Joining', 'Freshers OK'],
    },
    {
      id: 'mock-8',
      title: 'Accounts Assistant - Tally Required',
      company: 'Gupta Traders',
      location: 'Lucknow, UP',
      salary: '₹12,000 – ₹16,000/mo',
      type: 'Full-time',
      experience: '0 - 2 years',
      description: 'Accounts assistant needed for managing daily accounting entries in Tally ERP. Should know GST filing basics, bank reconciliation, and voucher entry. Good opportunity to learn practical accounting in a fast-paced trading firm.',
      requirements: ['BCom graduate', 'Tally ERP knowledge', 'GST filing basics', 'MS Excel proficiency'],
      postedAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://indeed.com',
      sourceName: 'Indeed',
      category: 'accounts',
      tags: ['Freshers OK'],
    },
    {
      id: 'mock-9',
      title: 'Field Marketing Executive',
      company: 'Jio Platforms',
      location: 'Chennai, Tamil Nadu',
      salary: '₹15,000 – ₹22,000 + Incentives',
      type: 'Full-time',
      experience: '0 - 3 years',
      description: 'Field marketing role for promoting Jio fiber and broadband connections. Door-to-door sales and society activations. Petrol allowance and phone recharge provided. Unlimited earning potential with per-connection incentives.',
      requirements: ['Graduate preferred', 'Own two-wheeler + DL', 'Local area knowledge', 'Hindi/Tamil fluency'],
      postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://naukri.com',
      sourceName: 'Naukri',
      category: 'marketing',
      tags: ['Freshers OK', 'Immediate Joining'],
    },
    {
      id: 'mock-10',
      title: 'Back Office Executive - Night Shift',
      company: 'Global Data Services',
      location: 'Gurgaon, Haryana',
      salary: '₹16,000 – ₹22,000/mo',
      type: 'Full-time',
      experience: '0 - 1 year',
      description: 'Back office data processing role for international client. Night shift (9 PM - 6 AM) with cab facility and night shift allowance. Work involves data verification, report generation, and email processing.',
      requirements: ['Graduate in any stream', 'Good typing speed', 'Basic English proficiency', 'Comfortable with night shifts'],
      postedAt: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://indeed.com',
      sourceName: 'Indeed',
      category: 'data-entry',
      tags: ['Night Shift', 'Freshers OK'],
    },
    {
      id: 'mock-11',
      title: 'Receptionist cum Admin Assistant',
      company: 'OYO Rooms Regional',
      location: 'Delhi NCR',
      salary: '₹14,000 – ₹20,000/mo',
      type: 'Full-time',
      experience: '0 - 2 years',
      description: 'Receptionist for regional office handling visitor management, call routing, and basic admin work. Must know MS Office. Pleasant personality and good English communication required.',
      requirements: ['Graduate in any stream', 'MS Office proficiency', 'Pleasant personality', 'English + Hindi fluency'],
      postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://naukri.com',
      sourceName: 'Naukri',
      category: 'receptionist',
      tags: ['Freshers OK'],
    },
    {
      id: 'mock-12',
      title: 'Delivery Partner Coordinator',
      company: 'Delhivery Logistics',
      location: 'Multiple Cities',
      salary: '₹13,000 – ₹18,000/mo',
      type: 'Full-time',
      experience: '0 - 1 year',
      description: 'Coordinate with delivery partners and customers for last-mile delivery operations. Handle dispatch scheduling, complaint resolution, and daily MIS reporting.',
      requirements: ['12th pass or Graduate', 'Hindi + regional language', 'Basic computer skills'],
      postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://indeed.com',
      sourceName: 'Indeed',
      category: 'admin',
      tags: ['Freshers OK', 'Immediate Joining'],
    },
    {
      id: 'mock-13',
      title: 'Retail Store Cashier',
      company: 'DMart Ready',
      location: 'Ahmedabad, Gujarat',
      salary: '₹11,000 – ₹15,000/mo',
      type: 'Full-time',
      experience: 'Fresher',
      description: 'Cashier position at our supermarket store. Handle billing, cash management, and customer interactions. Must be comfortable with POS systems (training provided). Rotational shifts including weekends.',
      requirements: ['12th pass minimum', 'Basic math skills', 'Comfortable with POS systems', 'Rotational shift availability'],
      postedAt: new Date(Date.now() - 5.5 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://naukri.com',
      sourceName: 'Naukri',
      category: 'retail',
      tags: ['Freshers OK', 'Walk-in'],
    },
    {
      id: 'mock-14',
      title: 'Hindi/English Telecaller - WFH',
      company: 'EduNext Learning',
      location: 'Work From Home',
      salary: '₹10,000 – ₹15,000 + Incentives',
      type: 'Full-time',
      experience: '0 - 1 year',
      description: 'Work from home telecalling opportunity. Call parents and students to explain our online coaching programs. Laptop/PC with internet required. Fixed salary plus per-enrollment incentives. Training provided.',
      requirements: ['12th pass or Graduate', 'Laptop/PC with internet', 'Good phone voice in Hindi/English'],
      postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://indeed.com',
      sourceName: 'Indeed',
      category: 'telecalling',
      tags: ['WFH Option', 'Freshers OK'],
    },
    {
      id: 'mock-15',
      title: 'Billing Executive - GST',
      company: 'Metro Wholesale',
      location: 'Chandigarh',
      salary: '₹14,000 – ₹18,000/mo',
      type: 'Full-time',
      experience: '0 - 2 years',
      description: 'Generate GST invoices, manage purchase/sales registers, and coordinate with the accounts team. 6-day work week with alternate Saturday off.',
      requirements: ['BCom graduate', 'Tally + Excel mandatory', 'GST knowledge preferred'],
      postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://naukri.com',
      sourceName: 'Naukri',
      category: 'accounts',
      tags: ['Freshers OK'],
    },
  ]

  if (category === 'all') return mockData
  return mockData.filter((job) => job.category === category)
}
