// ============================================================================
// iKlavya Classroom — Complete Course Scripts
// 7 Modules × 4 Segments × 150 seconds each
// ============================================================================

export interface CourseSegment {
  title: string
  narration: string
  keyPoints: string[]
  durationSeconds: number
}

export interface CourseQuiz {
  triggerAtSeconds: number
  question: string
  options: string[]
  correctIndex: number
  hint: string
}

export interface CourseScript {
  id: string
  title: string
  description: string
  category: string
  segments: CourseSegment[]
  quizzes: CourseQuiz[]
}

// ============================================================================
// MODULE 1: TIME MANAGEMENT
// ============================================================================

const timeManagement: CourseScript = {
  id: 'time-management',
  title: 'Time Management for Young Professionals',
  description:
    'Master the art of managing your time effectively as you transition from college life to the professional world. Learn proven frameworks like Deep Work, the Pareto Principle, the Eisenhower Matrix, and the Pomodoro Technique.',
  category: 'Productivity',
  segments: [
    {
      title: 'Deep Work & The Pareto Principle',
      durationSeconds: 150,
      narration: `Let me ask you something. During your final year of college, how many times did you sit down to study for an exam, only to find yourself scrolling through Instagram thirty minutes later? Don't worry, we have all been there. But here is the thing — in the professional world, that habit can seriously hurt your career.

Welcome to your first lesson on time management. Today we are going to talk about two powerful ideas: Deep Work and the Pareto Principle.

Deep Work is a concept popularized by Cal Newport. It means focusing without distraction on a cognitively demanding task. Think about the best coders at companies like Infosys or TCS. The ones who get promoted fast are not the ones who spend eight hours in front of a screen — they are the ones who can lock in for two or three hours of truly focused work and produce something remarkable.

Here is how Deep Work looks in practice. Imagine you just joined a Bangalore-based startup as a junior developer. Your tech lead gives you a module to build. Instead of having Slack open, YouTube running in a tab, and your phone buzzing with WhatsApp messages, you close everything. You put your phone on Do Not Disturb. You set a timer for ninety minutes. And you code. That ninety minutes of Deep Work will produce more output than an entire day of scattered attention.

Now let us pair this with the Pareto Principle, also called the Eighty-Twenty rule. It says that roughly eighty percent of your results come from just twenty percent of your efforts. In a real workplace, this means that not all tasks are equally important. Maybe out of ten tasks on your to-do list, only two truly move the needle for your project. Your job is to identify those two tasks and give them your Deep Work hours. The remaining eight tasks? Handle them in your shallow work time — answering emails, attending stand-ups, updating Jira tickets. Learning to distinguish between the vital few and the trivial many is one of the most valuable skills you will ever develop.`,
      keyPoints: [
        'Deep Work = Focused, distraction-free effort on demanding tasks',
        'Pareto Principle: 80% of results come from 20% of efforts',
        'Identify your high-impact tasks and protect time for them',
        'Shallow work (emails, Slack, stand-ups) fills the rest',
        'Close all distractions — phone on DND, tabs shut',
      ],
    },
    {
      title: 'The Eisenhower Matrix',
      durationSeconds: 150,
      narration: `Alright, now that you understand Deep Work and the Pareto Principle, let us talk about a framework that will help you decide what to work on and when. It is called the Eisenhower Matrix, named after Dwight Eisenhower, the thirty-fourth President of the United States, who was famous for being incredibly productive.

The matrix divides all your tasks into four quadrants based on two dimensions: urgency and importance.

Quadrant One is Urgent and Important. These are your fires — a production bug that is affecting customers, a client deliverable due today, or your manager asking for a report before a board meeting. You have to do these immediately. No choice.

Quadrant Two is Important but Not Urgent. This is where the magic happens. These are tasks like learning a new framework, building relationships with your team, working on a side project that boosts your skills, or preparing for that upcoming presentation well in advance. Most people neglect this quadrant because nothing is screaming for attention. But the best professionals spend most of their time here.

Quadrant Three is Urgent but Not Important. These are interruptions — a colleague asking you to help with something that is not your responsibility, most meetings that could have been an email, or random Slack pings. The trick here is to delegate or set boundaries.

Quadrant Four is Neither Urgent nor Important. This is scrolling social media at work, gossiping near the chai counter for forty-five minutes, or reorganizing your desktop icons for the third time this week. Eliminate these ruthlessly.

Let me give you a real example. Say you are a fresher at Wipro. Your manager asks you to update a spreadsheet by end of day — that is Quadrant One. Learning Python for an upcoming project is Quadrant Two. A colleague asking you to help them format their slides is Quadrant Three. And binge-watching reels during lunch break that extends to two hours — that is Quadrant Four. Once you start categorizing your tasks this way, you will notice that you automatically become more intentional with your time. You stop reacting and start planning.`,
      keyPoints: [
        'Q1 — Urgent + Important: Do it now (production bugs, deadlines)',
        'Q2 — Important + Not Urgent: Schedule it (learning, planning, growth)',
        'Q3 — Urgent + Not Important: Delegate or set boundaries',
        'Q4 — Not Urgent + Not Important: Eliminate (social media, gossip)',
        'Spend maximum time in Quadrant 2 for long-term career growth',
      ],
    },
    {
      title: 'The Pomodoro Technique',
      durationSeconds: 150,
      narration: `So we have covered what to work on and how to prioritize. Now let us talk about how to actually execute — because knowing what to do and doing it are two very different things. Enter the Pomodoro Technique.

Invented by Francesco Cirillo in the late nineteen eighties, the Pomodoro Technique is beautifully simple. You work for twenty-five minutes with absolute focus. Then you take a five-minute break. That is one Pomodoro. After four Pomodoros, you take a longer break of fifteen to thirty minutes.

Now, why does this work so well? Because our brains are not designed for marathon focus sessions. Think of it like going to the gym. You do not lift weights for three hours straight — you do sets with rest in between. The Pomodoro Technique does the same thing for your mind.

Here is how I would recommend you use it at work. Let us say you have just joined Cognizant and you have been assigned to write test cases for a module. Instead of staring at your screen thinking about how much work there is, you set a timer for twenty-five minutes and commit to just starting. You tell yourself — I only have to focus for twenty-five minutes, that is it. And here is the beautiful part — once you start, momentum kicks in. You often find yourself wanting to keep going even after the timer rings.

During your five-minute break, stand up and stretch. Get some water. Do not check Instagram — that is a trap. The break is meant to rest your brain, not overstimulate it.

There are some great tools for this. On your phone, you can use the Forest app — it gamifies focus by growing a virtual tree while you work. On your laptop, there is Pomofocus dot io, which is free and simple. Some teams at companies like Freshworks and Zoho even do team Pomodoros, where the entire team focuses together and takes breaks together. It builds a culture of focused work.

One tip from my side — track your Pomodoros for a week. You will be surprised to discover how many focused twenty-five-minute blocks you can actually complete in a day. Most people find it is somewhere between eight and twelve. That is real, productive work — and it adds up incredibly fast.`,
      keyPoints: [
        '25 min focused work + 5 min break = 1 Pomodoro',
        'After 4 Pomodoros, take a longer 15-30 min break',
        'Do NOT check social media during breaks — rest your brain',
        'Tools: Forest app, Pomofocus.io, team Pomodoros',
        'Track your daily Pomodoro count for self-awareness',
      ],
    },
    {
      title: 'The Art of Saying No',
      durationSeconds: 150,
      narration: `We have reached the final and perhaps the most difficult part of time management — saying no. This is especially hard in Indian work culture, where we are taught from a young age to be accommodating, to not upset seniors, to always say yes when someone asks for help. But here is the truth that no one tells you in college: every time you say yes to something, you are saying no to something else.

Let me paint a picture. You are three months into your job at an IT services company. You have your own deliverables, your own deadlines. But because you are the new person and you are eager to make a good impression, you keep saying yes. Yes, I will help you with your presentation. Yes, I will attend that optional meeting. Yes, I will take on that extra task. Before you know it, your own work is suffering, you are staying late every day, and you are exhausted. And the worst part? The people you helped have already forgotten about it. Nobody is tracking your favors.

Here is how to say no professionally. First, never say no without offering an alternative. Instead of saying I cannot do that, say I am currently working on the API module that is due Thursday. I can help you with this on Friday, would that work? This shows you are not being lazy or uncooperative — you are being responsible about your commitments.

Second, learn to identify requests that are actually someone else's responsibility being pushed onto you. In many companies, especially during the first year, freshers become the default people for every random task. It is okay to push back politely. You can say, I think Rahul from the testing team would be better suited for this. Should I loop him in?

Third, protect your Quadrant Two time fiercely. When someone asks you to do something during your scheduled learning or deep work time, it is perfectly fine to say, I have blocked this hour for focused work. Can we discuss this at three PM instead?

Remember, saying no is not about being rude. It is about respecting your own time and priorities. The most successful professionals are not the ones who say yes to everything — they are the ones who say yes to the right things. Warren Buffett once said, the difference between successful people and really successful people is that really successful people say no to almost everything. Let that sink in.`,
      keyPoints: [
        'Every YES to one thing is a NO to something else',
        'Never say No alone — always offer an alternative or timeline',
        'Identify "dumped" tasks that belong to someone else',
        'Protect your Deep Work and Quadrant 2 time blocks',
        'Saying No = respecting your priorities, not being rude',
      ],
    },
  ],
  quizzes: [
    {
      triggerAtSeconds: 150,
      question:
        'According to the Pareto Principle, what percentage of your results typically come from what percentage of your efforts?',
      options: [
        '50% results from 50% efforts',
        '80% results from 20% efforts',
        '70% results from 30% efforts',
        '90% results from 10% efforts',
      ],
      correctIndex: 1,
      hint: 'Think about the "Eighty-Twenty" rule we just discussed.',
    },
    {
      triggerAtSeconds: 300,
      question:
        'In the Eisenhower Matrix, which quadrant should you spend the MOST time in for long-term career growth?',
      options: [
        'Q1 — Urgent and Important',
        'Q2 — Important but Not Urgent',
        'Q3 — Urgent but Not Important',
        'Q4 — Not Urgent and Not Important',
      ],
      correctIndex: 1,
      hint: 'This quadrant includes learning, planning, and skill-building — things that matter but do not scream for attention.',
    },
    {
      triggerAtSeconds: 450,
      question: 'What is the standard duration of one Pomodoro focus session?',
      options: ['15 minutes', '25 minutes', '45 minutes', '60 minutes'],
      correctIndex: 1,
      hint: 'It is shorter than you think — designed for intense bursts of focus.',
    },
  ],
}

// ============================================================================
// MODULE 2: WORKPLACE ETIQUETTE
// ============================================================================

const workplaceEtiquette: CourseScript = {
  id: 'workplace-etiquette',
  title: 'Workplace Etiquette for Indian Professionals',
  description:
    'Navigate the unwritten rules of Indian workplaces with confidence. From making strong first impressions to mastering meeting behavior, feedback culture, and digital communication.',
  category: 'Professional Skills',
  segments: [
    {
      title: 'First Impressions That Last',
      durationSeconds: 150,
      narration: `You know that saying — first impression is the last impression? It sounds like something your grandmother would say, but in the professional world, it is backed by science. Research shows that people form an opinion about you within the first seven seconds of meeting you. Seven seconds. That is less time than it takes to order a chai.

So let us talk about how to nail those first seven seconds and the days that follow when you join a new organization.

First, appearance matters. I am not saying you need to wear a three-piece suit to your IT job in Hyderabad. But dressing appropriately for your workplace shows respect. If your company has a business casual dress code, do not show up in flip-flops and a wrinkled t-shirt. Iron your clothes. Clean shoes. Neat hair. These small things signal that you take your job seriously.

Second, your body language speaks before you do. Walk in with your shoulders back, make eye contact, and offer a firm handshake — not a bone-crusher, not a dead fish, just firm and confident. When you are introduced to people, smile genuinely and use their name. People love hearing their own name. Instead of just saying hi, say Hi Priya, great to meet you.

Third, be punctual from day one. In many Indian companies, there is a casual attitude toward time — people stroll in fifteen or twenty minutes late. Do not be that person, especially as a fresher. Arriving five minutes early shows that you are dependable.

Now let me tell you about the first week specifically. During your onboarding at a company like TCS or HCL, you will meet dozens of people — managers, teammates, HR folks, admin staff. Carry a small notebook. Write down names and key details. When you see someone the next day and say Hey Vikram, how did that client call go, they will be impressed. It shows you were paying attention and that you care.

One more thing — be curious but not intrusive. Ask questions about the work, the team, the processes. But do not ask people about their salary or why they look tired today. Read the room. The first few weeks are about observing, learning, and building goodwill.`,
      keyPoints: [
        'First 7 seconds shape lasting opinions — dress and groom well',
        'Body language: eye contact, firm handshake, confident posture',
        'Be punctual from day one — arrive 5 minutes early',
        'Remember names and details — carry a small notebook',
        'Be curious about work, not intrusive about personal matters',
      ],
    },
    {
      title: 'Meeting Discipline & Professional Behavior',
      durationSeconds: 150,
      narration: `Meetings. The one thing every professional complains about, yet nobody seems to fix. Here is a stat that will alarm you — the average professional spends about thirty-one hours per month in unproductive meetings. That is almost four full working days wasted. As a new professional, you have a chance to develop good meeting habits from the start.

Rule number one: come prepared. If there is an agenda shared before the meeting, read it. If there are documents attached, go through them. Nothing is more frustrating for a team lead than explaining something in a meeting that was already explained in the pre-read. At companies like Infosys, managers notice who comes prepared and who does not. It is a silent evaluation that happens constantly.

Rule number two: be on time. For virtual meetings on Zoom or Teams, join one or two minutes early. Test your audio and video beforehand. There is nothing worse than spending the first five minutes of a meeting saying can you hear me, is my screen shared, let me reconnect. At TCS, they have a saying — if you are on time, you are late. The expectation is to be ready before the meeting starts.

Rule number three: contribute meaningfully. You do not need to speak in every meeting, especially as a fresher. But when you do speak, make it count. Do not repeat what someone else said just to seem active. Instead, add a new perspective, ask a clarifying question, or offer to take an action item. One of the best things a fresher can say in a meeting is I will take that action item and follow up by end of day. It shows initiative.

Rule number four: do not be on your phone. This sounds obvious, but you would be shocked at how many people scroll through their phones during meetings, thinking nobody notices. Everyone notices. Your manager notices. The client on the video call notices. Keep your phone face down or in your bag.

Rule number five: follow up. After the meeting, if you took action items, send a quick email summarizing what you committed to and by when. This creates accountability and builds trust. Even a simple message saying Hi team, here are the action items from today's meeting goes a long way. The people who follow up are the people who get promoted.`,
      keyPoints: [
        'Read the agenda and pre-reads before every meeting',
        'Join virtual calls 1-2 minutes early — test audio/video',
        'Speak to add value, not just to seem active',
        'Phone face down — everyone notices distractions',
        'Send a follow-up email with action items after every meeting',
      ],
    },
    {
      title: 'Giving & Receiving Feedback',
      durationSeconds: 150,
      narration: `Let me share something that trips up almost every fresher. In college, feedback was simple — you got marks on your exam, you either passed or failed, and that was that. But in the workplace, feedback is continuous, nuanced, and sometimes uncomfortable. Learning to give and receive feedback gracefully is one of the most important skills you will develop.

Let us start with receiving feedback, because that is what you will experience first. Imagine this scenario. You have been at Accenture for two months. Your team lead reviews your code and says, this function is poorly structured, you need to refactor the entire thing. Your first instinct might be to feel defensive. You might think, I worked on this for two days, how dare they dismiss it. But here is the thing — that feedback is a gift. Your team lead is investing their time in making you better. The worst thing that can happen is not getting harsh feedback — it is getting no feedback at all, because that means nobody cares about your growth.

When you receive feedback, follow this framework. First, listen fully without interrupting. Let the person finish. Second, ask clarifying questions. Instead of getting defensive, say something like, could you help me understand what specifically needs to change in the function structure? Third, thank them. Even if the feedback stings, say thank you for pointing this out, I will work on it. Fourth, act on it. If you receive the same feedback twice, it means you did not take it seriously the first time. That is a red flag.

Now, giving feedback is equally important, even as a junior team member. The key here is to use the SBI model — Situation, Behavior, Impact. Instead of saying Amit, you are always late, say Amit, in our last three stand-up meetings, you joined ten minutes late. Because of that, we had to repeat the updates, which cost the team fifteen minutes each time. See the difference? The first one is a personal attack. The second one is specific, factual, and focused on impact.

One cultural note — in many Indian workplaces, there is a hierarchy where juniors are hesitant to give feedback to seniors. But good organizations are changing this. Companies like Flipkart and Razorpay actively encourage upward feedback. If your workplace supports it, use it. If it does not, start with peers and build the muscle gradually.`,
      keyPoints: [
        'Receiving: Listen fully, ask clarifying questions, say thank you, act on it',
        'Never receive the same feedback twice — act on it the first time',
        'Giving: Use SBI model — Situation, Behavior, Impact',
        'Avoid personal attacks — be specific and factual',
        'Good companies encourage upward feedback — use it',
      ],
    },
    {
      title: 'Digital Citizenship at Work',
      durationSeconds: 150,
      narration: `Here is a story I hear far too often. A fresher at an MNC posts a photo on their Instagram story from inside the office, and in the background you can see a whiteboard with client project details. They think nothing of it. A week later, they are called into HR because the client found out. That one careless story could have cost the company an entire account.

Welcome to the world of digital citizenship at work. In today's hyper-connected world, your online behavior is an extension of your professional identity. Let us break down the rules.

First, email etiquette. Your emails at work are not WhatsApp messages. Use a clear subject line. Start with a proper greeting. Keep the body concise and structured — use bullet points for multiple items. End with a clear call to action. And for the love of everything professional, proofread before hitting send. I have seen freshers accidentally send emails with hey bro to their clients because they were in the habit of texting casually. Your email address at work has the company domain. Everything you send represents the organization.

Second, Slack and Teams messaging. Keep it professional but not robotic. It is okay to use a friendly tone, but avoid excessive memes and GIFs in work channels. If you need to discuss something personal with a colleague, take it to a private message. And here is a big one — do not send just hi and wait. Write your complete message. Instead of typing hi followed by silence, write Hi Neha, I had a question about the API endpoint for the payment module. Can you help me understand the authentication flow? This saves everyone time.

Third, social media boundaries. Be very careful about what you post about your workplace. Never share proprietary information, client names, internal screenshots, or anything that could violate your NDA. Even vague complaints like ugh, my company is so frustrating can come back to haunt you. Recruiters and hiring managers check social media profiles.

Fourth, respect data privacy. If you have access to customer data, employee records, or financial information, treat it like it is sacred. Do not share it, do not screenshot it, do not transfer it to personal devices. At companies like Infosys and Wipro, data security violations can result in immediate termination. It is not just about rules — it is about trust. When your organization trusts you with sensitive information, honoring that trust is the foundation of your professional reputation.`,
      keyPoints: [
        'Emails: clear subject, structured body, proofread, professional tone',
        'Slack/Teams: write full messages, avoid "just hi", keep work channels professional',
        'Social media: NEVER post client info, internal details, or NDA-covered content',
        'Data privacy: treat sensitive data as sacred — no screenshots, no personal transfers',
        'Your digital behavior IS your professional reputation',
      ],
    },
  ],
  quizzes: [
    {
      triggerAtSeconds: 150,
      question:
        'According to research, how quickly do people form a first impression of you?',
      options: ['30 seconds', '7 seconds', '2 minutes', '5 minutes'],
      correctIndex: 1,
      hint: 'It is much faster than you might think — faster than ordering chai.',
    },
    {
      triggerAtSeconds: 300,
      question:
        'What should you do immediately after a meeting where you took action items?',
      options: [
        'Wait for someone else to summarize',
        'Post about it on LinkedIn',
        'Send a follow-up email summarizing your commitments',
        'Discuss it informally over chai',
      ],
      correctIndex: 2,
      hint: 'Creating written accountability builds trust with your team.',
    },
    {
      triggerAtSeconds: 450,
      question: 'What does the SBI feedback model stand for?',
      options: [
        'Simple, Brief, Impactful',
        'Situation, Behavior, Impact',
        'Specific, Bold, Insightful',
        'Summary, Background, Insight',
      ],
      correctIndex: 1,
      hint: 'It helps you give feedback that is factual and focused, not personal.',
    },
  ],
}

// ============================================================================
// MODULE 3: SOCIAL COMMUNICATION
// ============================================================================

const socialCommunication: CourseScript = {
  id: 'social-communication',
  title: 'Social Communication Skills',
  description:
    'Build the interpersonal communication skills that separate good professionals from great ones. Master active listening, non-verbal cues, small talk, and assertive communication.',
  category: 'Communication',
  segments: [
    {
      title: 'Active Listening — The Most Underrated Skill',
      durationSeconds: 150,
      narration: `I want you to think about the last conversation you had where you felt truly heard. Not just someone waiting for their turn to speak, but actually listening to you with full attention. How did that feel? Probably incredible. That is the power of active listening, and it is the single most underrated skill in the professional world.

Most of us think we are good listeners. But here is the reality — studies show that we retain only about twenty-five percent of what we hear. The rest is lost because while someone is talking, we are busy formulating our response, checking our phone, or mentally drifting to what we are having for lunch.

Active listening is different. It is intentional. It requires effort. And it will set you apart in any workplace.

Here is how to practice it. First, give your full attention. When someone is speaking to you, put your phone down. Close your laptop if you are not taking notes. Turn your body toward them. These physical actions signal that you are present. In Indian culture, we sometimes avoid direct eye contact with seniors as a sign of respect, and that is fine — the key is to show engagement through nodding and leaning in slightly.

Second, do not interrupt. This is hard, especially when you are excited or disagree. But let the person complete their thought. You can jot down your point and bring it up when they finish.

Third, paraphrase and reflect. After someone finishes speaking, summarize what they said in your own words. For example, So what you are saying is that the timeline is tight and we need to prioritize the payment module over the notification feature — is that correct? This does two things — it confirms your understanding and makes the other person feel validated.

Fourth, ask open-ended questions. Instead of asking did you like the design, ask what are your thoughts on the design. Open-ended questions encourage deeper discussion and show genuine curiosity.

Let me give you a workplace scenario. You are in a one-on-one with your manager at a Pune-based IT company. She is explaining a new project requirement. If you are actively listening — nodding, taking notes, paraphrasing — she will trust you more with complex tasks. If you are fidgeting and checking Slack, she will unconsciously label you as someone who cannot be relied upon. Active listening is not just a communication skill. It is a career accelerator.`,
      keyPoints: [
        'We retain only ~25% of what we hear — active listening fixes this',
        'Full attention: phone down, laptop closed, body oriented toward speaker',
        'Do NOT interrupt — jot down your point and wait',
        'Paraphrase: "So what you are saying is..." to confirm understanding',
        'Ask open-ended questions to encourage deeper discussion',
      ],
    },
    {
      title: 'Non-Verbal Communication Cues',
      durationSeconds: 150,
      narration: `Here is a fact that might surprise you. Research by Dr. Albert Mehrabian suggests that in face-to-face communication, only seven percent of meaning comes from words. Thirty-eight percent comes from tone of voice, and a massive fifty-five percent comes from body language. That means more than half of what you communicate has nothing to do with the words you speak.

Let us decode the non-verbal cues that matter most in the Indian workplace.

Eye contact. In Western cultures, strong eye contact is seen as confidence. In India, the dynamics are more nuanced. With peers and juniors, maintain comfortable eye contact — it shows engagement. With senior leaders or clients, a balance of eye contact with occasional looking away shows respect without appearing disengaged. The key is to avoid extremes — staring can feel aggressive, while never making eye contact can seem evasive or disinterested.

Posture. How you sit in a meeting tells a story. Slouching says I do not want to be here. Leaning too far back says I am too casual for this. Sitting upright with a slight forward lean says I am engaged and interested. When you are presenting in front of a team — whether at a stand-up at your startup in Koramangala or a client call from your Noida office — stand tall with your weight evenly distributed. Do not sway or fidget.

Hand gestures. Indians tend to be naturally expressive with hands, and that is actually an advantage. Controlled hand gestures while speaking make you appear more confident and engaging. But be mindful of crossed arms — that universally signals defensiveness or closed-mindedness, even if you are just cold.

Facial expressions. Your face should match your message. If you are congratulating someone but your face looks bored, the words lose all meaning. Practice a genuine smile — not a forced grin, but a real one that reaches your eyes. This is especially important in video calls where your face is literally on display.

Tone of voice. Speaking too softly can make you seem unsure. Speaking too loudly can come across as aggressive. Aim for a clear, steady, moderate volume. And watch your pace — when nervous, people tend to speak fast. Slow down. Pauses are powerful. A well-placed pause before an important point creates emphasis and commands attention.`,
      keyPoints: [
        '55% of communication is body language, 38% tone, only 7% words',
        'Eye contact: balance engagement with cultural respect for seniors',
        'Posture: sit upright with slight forward lean = engaged',
        'Avoid crossed arms (signals defensiveness) — use open gestures',
        'Tone: clear, moderate volume, deliberate pace with strategic pauses',
      ],
    },
    {
      title: 'The Art of Small Talk',
      durationSeconds: 150,
      narration: `Raise your hand if you have ever stood awkwardly at an office event, holding a cup of chai, not knowing how to start a conversation with a stranger. If your hand is up, you are not alone. Small talk is something most Indian professionals — especially engineers and introverts — find incredibly uncomfortable. But here is why it matters: small talk is the gateway to big opportunities.

Every meaningful professional relationship starts with small talk. The colleague who becomes your mentor. The senior leader who recommends you for a plum project. The person at a conference who later refers you for your dream job. All of these relationships likely started with a simple, casual conversation.

So how do you get good at small talk? Let us start with openers. The easiest way to start a conversation is to comment on something shared. At an office event, it could be the food — this biryani is incredible, have you tried it? At a conference, it could be the talk — that keynote on AI was fascinating, what did you think? On your first day at work, it could be as simple as Hi, I just joined the team. I am really looking forward to working here. How long have you been with the company?

The FORD framework is your best friend here. FORD stands for Family, Occupation, Recreation, and Dreams. These are four safe topics that work in almost any situation. You can ask about someone's hometown — Oh, you are from Jaipur? I have always wanted to visit during Diwali. Or about their role — What does a typical day look like for you in the data engineering team? Or about hobbies — Do you follow cricket? What did you think of the last IPL season?

Here is the golden rule of small talk — be more interested than interesting. People love talking about themselves. If you ask genuine questions and listen actively — which you learned in the previous segment — people will remember you as a great conversationalist, even if you barely spoke about yourself.

A few things to avoid. Do not ask about salary, age, or marital status — these are sensitive in professional settings. Do not monologue — if you have been talking for more than a minute without the other person speaking, you have gone too long. And do not fake it. If someone mentions a hobby you know nothing about, say oh, I do not know much about that, tell me more — honesty beats pretending every time.`,
      keyPoints: [
        'Small talk is the gateway to mentors, referrals, and opportunities',
        'Openers: comment on something shared (food, event, environment)',
        'FORD framework: Family, Occupation, Recreation, Dreams',
        'Golden rule: be more interested than interesting — ask questions',
        'Avoid: salary/age/marital status questions, monologuing, faking interest',
      ],
    },
    {
      title: 'Assertive Communication',
      durationSeconds: 150,
      narration: `Let us talk about something that many Indian professionals, especially freshers, struggle with — assertiveness. There is a common confusion between being assertive and being aggressive. Let me clear that up right away. Aggressiveness is about dominating others. Assertiveness is about expressing your needs, opinions, and boundaries clearly and respectfully.

There are actually four communication styles. Passive, where you stay quiet even when you disagree, avoid conflict, and let others walk over you. Aggressive, where you bulldoze others with your opinion, raise your voice, and disregard other people's feelings. Passive-aggressive, where you appear agreeable on the surface but express frustration indirectly through sarcasm, gossip, or deliberate inefficiency. And finally, assertive — the sweet spot where you express yourself honestly while respecting others.

Here is why assertiveness matters for your career. Imagine you are a fresher at a startup in HSR Layout, Bangalore. Your team lead assigns you work that you know will take three days, but tells you to finish it by tomorrow. If you are passive, you say okay and then work until two AM, burn out, and deliver mediocre work. If you are aggressive, you say that is impossible, figure it out yourself. Both approaches damage your career.

The assertive response sounds like this: I understand this is a priority. Based on my assessment, the full task will take three days for quality delivery. However, I can prioritize the core functionality and deliver that by tomorrow, and complete the remaining features by Wednesday. Would that work? See the difference? You have communicated the reality, offered a solution, and respected both your time and the deadline.

Here are some assertive phrases you should practice. Instead of saying I cannot do this, say Here is what I can do by that deadline. Instead of saying you never listen to me, say I feel unheard when my suggestions are not acknowledged in meetings. Instead of saying whatever you say, say I have a different perspective — can I share it?

The key to assertiveness is using I statements. I feel, I think, I need, I would like. This keeps the focus on your perspective without blaming others. It takes practice, especially in cultures that value hierarchy and deference. But the most respected professionals in every Indian company — from Tata to Zomato — are the ones who communicate assertively. They disagree without being disagreeable. They set boundaries without burning bridges. That is the balance you are aiming for.`,
      keyPoints: [
        '4 styles: Passive, Aggressive, Passive-Aggressive, Assertive (aim for this)',
        'Assertive = express your needs clearly while respecting others',
        'Use "I" statements: I feel, I think, I need — not "you always/never"',
        'Offer solutions when pushing back: "Here is what I can do by that deadline"',
        'Assertiveness builds respect — passivity and aggression both damage careers',
      ],
    },
  ],
  quizzes: [
    {
      triggerAtSeconds: 150,
      question:
        'What percentage of what we hear do we typically retain, according to studies?',
      options: ['10%', '25%', '50%', '75%'],
      correctIndex: 1,
      hint: 'It is surprisingly low — which is exactly why active listening is so important.',
    },
    {
      triggerAtSeconds: 300,
      question:
        'According to Dr. Mehrabian\'s research, what percentage of face-to-face communication comes from body language?',
      options: ['7%', '25%', '38%', '55%'],
      correctIndex: 3,
      hint: 'It is the largest component — much more than words or tone alone.',
    },
    {
      triggerAtSeconds: 450,
      question: 'What does the FORD framework stand for in small talk?',
      options: [
        'Facts, Opinions, Remarks, Details',
        'Family, Occupation, Recreation, Dreams',
        'Friendly, Open, Relaxed, Direct',
        'Focus, Observe, Respond, Discuss',
      ],
      correctIndex: 1,
      hint: 'These are four safe, universal topics for professional conversations.',
    },
  ],
}

// ============================================================================
// MODULE 4: RESUME & INTERVIEW MASTERY
// ============================================================================

const resumeInterviewMastery: CourseScript = {
  id: 'resume-interview-mastery',
  title: 'Resume & Interview Mastery',
  description:
    'Learn to craft ATS-friendly resumes, ace interviews using the STAR method, avoid common mistakes, and confidently negotiate your salary. Your complete guide to landing the job you deserve.',
  category: 'Career Development',
  segments: [
    {
      title: 'Building an ATS-Friendly Resume',
      durationSeconds: 150,
      narration: `Here is a harsh reality that most college placement cells do not tell you. When you apply to a company like Infosys, Deloitte, or even a well-funded startup through their careers page, your resume is almost never seen by a human first. It goes through an Applicant Tracking System, or ATS — software that scans your resume for relevant keywords, experience, and formatting before deciding whether a recruiter should even look at it. Studies show that up to seventy-five percent of resumes are rejected by ATS before a human ever reads them. Let that sink in.

So how do you build a resume that beats the ATS and impresses the human on the other side?

First, formatting. Keep it clean and simple. Use a single-column layout. Avoid fancy graphics, tables, icons, or headers and footers — ATS software cannot read these. Use standard section headings like Education, Experience, Skills, and Projects. Use a standard font like Calibri, Arial, or Times New Roman at ten to twelve point size. Save it as a PDF unless the job posting specifically asks for a Word document.

Second, keywords are everything. Read the job description carefully and mirror the exact language they use. If the posting says proficiency in React.js, do not write I know React — write React.js in your skills section. If they mention Agile methodology, include that exact phrase. ATS works on keyword matching, so the closer your language matches the job description, the higher your score.

Third, structure your experience with impact. Do not write responsible for testing software. Instead, write executed 200-plus test cases across 3 modules, reducing production bugs by 30 percent in Q2 2025. Use the formula — Action Verb plus Task plus Quantifiable Result. Every bullet point under your experience should follow this pattern.

Fourth, for freshers who lack work experience, your projects section is gold. Did you build a full-stack app for your final year project? Did you contribute to an open-source library? Did you complete a virtual internship with a company like Goldman Sachs through Forage? List these with the same impact-driven bullet points. A strong projects section can absolutely compensate for limited work experience.

One more thing — do not use the same resume for every application. Tailor it for each role. Yes, it takes more time. But sending out a hundred generic resumes is far less effective than sending twenty customized ones.`,
      keyPoints: [
        '75% of resumes are rejected by ATS before a human sees them',
        'Simple formatting: single column, standard fonts, no graphics/tables',
        'Mirror exact keywords from the job description',
        'Impact formula: Action Verb + Task + Quantifiable Result',
        'Tailor your resume for each role — no generic mass applications',
      ],
    },
    {
      title: 'The STAR Method for Interviews',
      durationSeconds: 150,
      narration: `Congratulations, your resume made it through the ATS. Now comes the interview. And here is where most Indian graduates make a critical mistake — they ramble. When an interviewer asks tell me about a time you faced a challenge, most candidates go on a five-minute unstructured monologue that leaves the interviewer confused about what actually happened and what the candidate actually did.

The STAR method is your weapon against rambling. STAR stands for Situation, Task, Action, and Result. It gives you a clear framework to answer any behavioral interview question concisely and powerfully.

Let me walk you through an example. Suppose the interviewer asks — Tell me about a time you worked under pressure.

Situation: During my final year at VIT, our team of four was building an e-commerce platform for our capstone project. Two weeks before the submission deadline, one team member dropped out due to a medical emergency, and we discovered a major bug in the payment integration module.

Task: As the team lead, I needed to redistribute the workload and fix the payment bug while ensuring we still met the submission deadline.

Action: I reorganized the remaining tasks, assigning myself the payment module since I had the strongest backend skills. I set up daily thirty-minute sync calls with the team to track progress. I also reached out to our professor for a two-day extension, presenting a clear plan of what we would deliver and by when.

Result: We delivered the project on time with the extension, received an A grade, and our professor specifically appreciated our crisis management. The payment module worked flawlessly during the demo.

Notice how that answer is structured, specific, and results-oriented. It took about ninety seconds — which is the ideal length for a STAR response. Not too short, not too long.

Here is a pro tip. Before any interview, prepare eight to ten STAR stories from your college experience, internships, or personal projects. Cover themes like teamwork, conflict, leadership, failure, tight deadlines, and learning something new. Most behavioral questions can be answered by adapting one of these prepared stories. Practice them out loud — not memorized word for word, but enough that the structure flows naturally. Companies like Amazon are famous for behavioral interviews, and they specifically train interviewers to evaluate STAR-structured answers.`,
      keyPoints: [
        'STAR = Situation, Task, Action, Result — your anti-rambling framework',
        'Keep each STAR response to 60-90 seconds',
        'Be specific: names, numbers, timelines, outcomes',
        'Prepare 8-10 STAR stories covering common themes before any interview',
        'Practice out loud — structured but not memorized word-for-word',
      ],
    },
    {
      title: 'Common Interview Mistakes to Avoid',
      durationSeconds: 150,
      narration: `I have spoken to dozens of hiring managers at Indian companies — from service giants like Wipro and Cognizant to product companies like Razorpay and Swiggy. I asked them one question — what are the most common reasons you reject candidates who otherwise look good on paper? Their answers were remarkably consistent. Let me share the top mistakes so you can avoid them.

Mistake number one — not researching the company. When an interviewer asks why do you want to work here and your answer is because it is a good company with great opportunities, you have already lost points. That answer could apply to literally any company on the planet. Instead, say something specific. For example, I have been following Razorpay's expansion into international payments, and the engineering blog post about your microservices migration was fascinating. I want to be part of a team solving payments at that scale. That shows genuine interest and effort.

Mistake number two — badmouthing previous employers or colleges. Even if your internship experience was terrible, even if your college had outdated labs, never speak negatively about past experiences. Instead, frame it positively. Rather than saying my internship was a waste of time, say the internship taught me the importance of choosing roles aligned with my interests, which is why I am so excited about this position.

Mistake number three — not asking questions. When the interviewer says do you have any questions for us and you say no, I think you covered everything, you are signaling a lack of curiosity. Always have three to four thoughtful questions ready. Ask about the team structure, the tech stack, what success looks like in the first ninety days, or what the biggest challenge facing the team is right now.

Mistake number four — poor body language on video interviews. With remote hiring becoming common, your video interview setup matters. Make sure you have a clean background, decent lighting from the front not the back, and your camera at eye level. Look at the camera when speaking, not at the screen — this simulates eye contact. And please, test your internet connection beforehand. Nothing kills momentum like a laggy call.

Mistake number five — lying or exaggerating. If you put expert in Python on your resume and cannot solve a basic problem during the technical round, you have destroyed your credibility. Be honest about your skill level. It is far better to say I have intermediate knowledge of Python and I am actively deepening it than to claim expertise you do not have. Interviewers respect honesty. They can train skills, but they cannot train integrity.`,
      keyPoints: [
        'Research the company deeply — mention specific products, blogs, news',
        'Never badmouth past employers or colleges — reframe positively',
        'Always prepare 3-4 thoughtful questions for the interviewer',
        'Video setup: clean background, front lighting, camera at eye level',
        'Never lie or exaggerate on your resume — honesty builds credibility',
      ],
    },
    {
      title: 'Salary Negotiation for Freshers',
      durationSeconds: 150,
      narration: `This is the segment most people are secretly most interested in — salary negotiation. And it is also the segment where Indian freshers make the biggest mistake: they do not negotiate at all. Here is the thing — when a company offers you a package, that number is almost never the maximum they are willing to pay. There is almost always room to negotiate, even for freshers. And the cost of not negotiating compounds over your entire career.

Let me explain with math. Suppose Company A offers you six lakhs per annum and you accept without negotiating. Your friend, with similar qualifications, negotiates and gets six point five lakhs. That fifty thousand rupee difference in the first year becomes much larger over time because every future raise, bonus, and job switch is calculated as a percentage of your current salary. Over a ten-year career, that one negotiation could be worth five to eight lakhs in cumulative difference.

So how do you negotiate as a fresher without sounding demanding? First, timing matters. Never discuss salary in the first interview. Wait until you have an offer or at least a strong signal that they want to hire you. That is when you have the most leverage.

Second, do your research. Use platforms like Glassdoor, Levels.fyi, AmbitionBox, and LinkedIn Salary Insights to understand the market range for your role and location. If the average salary for a junior software developer in Bangalore is five point five to seven lakhs, you have a data point to anchor your negotiation.

Third, negotiate the total package, not just the base salary. Indian CTC structures include many components — base salary, HRA, special allowance, performance bonus, stock options, joining bonus, relocation allowance, and learning budgets. If the company cannot increase the base, ask for a higher joining bonus, better stock options, or a learning allowance for courses and certifications.

Fourth, use collaborative language. Instead of saying I want seven lakhs, say based on my research and the market rate for this role in Hyderabad, I was expecting something in the range of six point five to seven lakhs. Is there flexibility to bridge the gap? This frames it as a discussion, not a demand.

Fifth, know when to stop. If the company has moved once or twice on their offer, do not push further. Accept graciously, express excitement about joining, and channel your energy into performing well enough to earn a strong increment in your first appraisal cycle. Negotiation is important, but so is not burning goodwill before you even start. The goal is to arrive at a number where both you and the company feel good about the deal.`,
      keyPoints: [
        'Always negotiate — the first offer is rarely the maximum',
        'Not negotiating costs you lakhs over a 10-year career (compounding)',
        'Research market rates: Glassdoor, AmbitionBox, Levels.fyi, LinkedIn',
        'Negotiate total CTC: joining bonus, stocks, learning budget — not just base',
        'Use collaborative language: "Is there flexibility to bridge the gap?"',
      ],
    },
  ],
  quizzes: [
    {
      triggerAtSeconds: 150,
      question:
        'What percentage of resumes are typically rejected by ATS before a human sees them?',
      options: ['25%', '50%', '75%', '90%'],
      correctIndex: 2,
      hint: 'It is a shockingly high number — which is why ATS optimization matters so much.',
    },
    {
      triggerAtSeconds: 300,
      question: 'What does STAR stand for in the interview context?',
      options: [
        'Skills, Training, Attitude, Results',
        'Situation, Task, Action, Result',
        'Summary, Technique, Approach, Review',
        'Strengths, Targets, Actions, Reflection',
      ],
      correctIndex: 1,
      hint: 'It is a storytelling framework that keeps your answers structured and concise.',
    },
    {
      triggerAtSeconds: 450,
      question:
        'When should you first discuss salary in the interview process?',
      options: [
        'In the very first interview',
        'In your cover letter',
        'After receiving an offer or strong hiring signal',
        'Never — accept what is offered',
      ],
      correctIndex: 2,
      hint: 'You have the most leverage at a specific point in the process — think about when that is.',
    },
  ],
}

// ============================================================================
// MODULE 5: FINANCIAL LITERACY FOR FRESHERS
// ============================================================================

const financialLiteracy: CourseScript = {
  id: 'financial-literacy-freshers',
  title: 'Financial Literacy for Freshers',
  description:
    'Your first salary is exciting — make it count. Learn practical budgeting, understand PF and taxes, discover saving vs investing, and protect yourself from common debt traps.',
  category: 'Personal Finance',
  segments: [
    {
      title: 'Budgeting Your First Salary',
      durationSeconds: 150,
      narration: `Let me tell you about Rohan. Rohan got his first job at a mid-size IT company in Pune with a package of five lakhs per annum. After taxes and deductions, his in-hand salary was about thirty-five thousand per month. His first month, he felt rich for the first time in his life. He bought new clothes, ate out every day, got a gym membership, subscribed to Netflix and Spotify, and bought an iPhone on EMI. By the twentieth of the month, he had four thousand rupees left. By the twenty-fifth, he was borrowing money from his roommate. Sound familiar? This is the story of almost every Indian fresher, and it happens because nobody teaches us how to budget.

Here is a simple budgeting framework that actually works — the 50-30-20 rule. Take your in-hand salary — let us use Rohan's thirty-five thousand as an example. Fifty percent, which is seventeen thousand five hundred, goes to Needs — rent, groceries, utilities, transportation, and any loan EMIs. Thirty percent, which is ten thousand five hundred, goes to Wants — eating out, entertainment, shopping, subscriptions. And twenty percent, which is seven thousand, goes to Savings and Investments — this is non-negotiable.

The order matters. The moment your salary hits your account, transfer that twenty percent to a separate savings account or investment. Pay yourself first. If you wait until the end of the month to see what is left, there will be nothing left. I promise you. Set up an auto-debit on salary day that moves seven thousand to your savings account. You cannot spend what you cannot see.

Now, let me be real about rent. If you are working in Bangalore or Mumbai, rent alone might eat up fifteen to eighteen thousand of your salary. That is already more than fifty percent of Rohan's Needs budget. In that case, adjust the ratio — maybe sixty-twenty-twenty or share a flat with roommates. The key principle remains: save at least twenty percent before spending on anything else.

Track your expenses for the first three months. Use an app like Walnut, Money Manager, or even a simple Google Sheet. You will be shocked at where your money actually goes. That daily hundred-rupee chai and samosa adds up to three thousand per month. Those weekend Zomato orders add up to four or five thousand. Awareness is the first step to control. You do not have to live like a monk — but you do have to live with intention.`,
      keyPoints: [
        '50-30-20 Rule: 50% Needs, 30% Wants, 20% Savings (non-negotiable)',
        'Pay yourself first — auto-debit savings on salary day',
        'Adjust ratios for expensive cities but NEVER skip the savings portion',
        'Track expenses for 3 months using Walnut, Money Manager, or Google Sheets',
        'Small daily expenses compound: Rs 100/day chai = Rs 3,000/month',
      ],
    },
    {
      title: 'Understanding PF, Taxes & Your Payslip',
      durationSeconds: 150,
      narration: `Your first payslip is going to confuse you. Guaranteed. You were told your CTC is five lakhs, but the number in your bank account is nowhere close to five lakhs divided by twelve. Where did the rest go? Let us break it down.

CTC stands for Cost to Company. It includes everything the company spends on you — not just your take-home pay. Your CTC is broken into several components.

Basic Salary is usually forty to fifty percent of your CTC. This is important because your PF contribution and gratuity are calculated on this amount.

HRA, or House Rent Allowance, is a portion meant to cover your rent. If you are living in a rented apartment and paying rent, you can claim HRA exemption while filing taxes — this saves you money.

Special Allowance is a catch-all component that makes up the remaining amount.

Employee Provident Fund, or EPF, is where twelve percent of your basic salary is deducted from your paycheck and deposited into your PF account. Your employer also contributes twelve percent. Think of this as forced retirement savings. Your PF balance earns around eight percent interest, which is higher than most savings accounts. Do not withdraw it when you switch jobs — transfer it. That money compounding over thirty years will become a substantial corpus.

Now, taxes. Under the new tax regime, which most freshers should choose for simplicity, income up to three lakh rupees is tax-free. From three to seven lakhs, you pay five percent. From seven to ten lakhs, ten percent. And so on. Your company deducts TDS — Tax Deducted at Source — from your salary every month based on your declared investments and projected annual income.

Here is what freshers must do. Fill out your investment declaration form carefully during the start of the financial year, usually in April. If you plan to invest in ELSS mutual funds, PPF, or pay life insurance premiums, declare these under Section 80C of the old regime or use the new regime's standard deduction. This ensures the right amount of TDS is deducted each month, so you do not end up with a huge tax bill or an unnecessarily large refund at year-end.

File your Income Tax Return every year, even if your income is below the taxable limit. It creates a financial track record that helps when you apply for loans or credit cards later. Use the Income Tax Department's e-filing portal or apps like ClearTax and Quicko. Filing is free for salaried individuals with income under a certain limit, and the process takes about fifteen minutes once you have your Form 16 from your employer.`,
      keyPoints: [
        'CTC is not equal to In-Hand: CTC includes PF, gratuity, bonuses, and employer costs',
        'EPF: 12% from you + 12% from employer — do NOT withdraw on job switch',
        'New Tax Regime: 0-3L = 0%, 3-7L = 5%, 7-10L = 10%',
        'Fill investment declaration form in April to optimize monthly TDS',
        'File ITR every year — even if below taxable limit — builds financial record',
      ],
    },
    {
      title: 'Saving vs Investing — Know the Difference',
      durationSeconds: 150,
      narration: `Okay, so you are budgeting well and you have got that twenty percent set aside every month. Now what? Do you just leave it in your savings account? Absolutely not. And here is why.

Your savings account gives you about three to four percent interest per year. Inflation in India averages around five to six percent. Do the math — if your money grows at four percent but prices rise at six percent, you are actually losing purchasing power every year. That ten thousand rupees in your savings account can buy less next year than it can today. Saving is not enough. You need to invest.

But before we talk about investing, let us build your emergency fund first. This is three to six months of your monthly expenses kept in a liquid, easily accessible place — a high-yield savings account or a liquid mutual fund. If your monthly expenses are twenty-five thousand, your emergency fund should be seventy-five thousand to one lakh fifty thousand. This is not for investing — this is your safety net for unexpected events like job loss, medical emergencies, or urgent travel home.

Once your emergency fund is set, let us talk about investing. For freshers, I recommend starting with three instruments.

First, SIP in index mutual funds. A Systematic Investment Plan lets you invest a fixed amount every month into a mutual fund. Start with a Nifty 50 or Sensex index fund. Even two thousand rupees per month, started at age twenty-two, can grow to over one crore by the time you are fifty, thanks to compounding. Use apps like Groww, Zerodha's Coin, or Kuvera to start a SIP in under ten minutes.

Second, PPF or Public Provident Fund. This is a government-backed savings scheme with an interest rate of around seven percent, and it is completely tax-free. You can invest up to one lakh fifty thousand per year. It has a fifteen-year lock-in, which actually helps because you cannot impulsively withdraw it.

Third, ELSS or Equity Linked Savings Scheme. These are tax-saving mutual funds with only a three-year lock-in, and they often give better returns than PPF because they invest in equities.

The biggest advantage you have as a twenty-two or twenty-three year old is time. Thanks to compound interest, money invested early grows exponentially. One rupee invested at twenty-two is worth significantly more than one rupee invested at thirty-two, even if the annual return is the same. Start small, but start now. Do not wait until you earn more — the best time to invest was yesterday, and the second best time is today.`,
      keyPoints: [
        'Savings account (3-4%) < Inflation (5-6%) — saving alone loses value',
        'Build emergency fund FIRST: 3-6 months of expenses in liquid funds',
        'Start SIP in index funds: Rs 2,000/month at 22 can become Rs 1 Cr+ by 50',
        'PPF: 7% tax-free, 15-year lock-in — great for long-term discipline',
        'Your biggest advantage at 22 is TIME — start small but start NOW',
      ],
    },
    {
      title: 'Avoiding Debt Traps',
      durationSeconds: 150,
      narration: `Now for the segment that could genuinely save your financial future — avoiding debt traps. India is experiencing an explosion of easy credit. Buy Now Pay Later apps, instant personal loans on apps, credit cards with tempting rewards, and EMI options on everything from phones to headphones. It has never been easier to spend money you do not have. And that is exactly the problem.

Let me tell you about the most dangerous debt trap for freshers — credit card minimum payments. Here is how it works. You get a credit card with a fifty thousand limit. You spend forty thousand in a month. The bill comes, and you see the minimum payment is just two thousand. So you pay two thousand and feel relieved. But here is what the credit card company does not tell you prominently — the remaining thirty-eight thousand starts accruing interest at two to three percent per month. That is twenty-four to thirty-six percent per year. On a thirty-eight thousand balance, that is almost a thousand rupees in interest in just the first month. And it compounds. This is how people end up paying twice the original amount over time.

The rule is simple — if you cannot pay the full credit card bill by the due date, you cannot afford what you bought. Use a credit card for convenience and rewards points, but always pay the full balance. Never carry forward.

Second trap — instant loan apps. You have seen the ads. Get fifty thousand in ten minutes, no documents needed. These apps charge exorbitant interest rates, sometimes forty to sixty percent annualized. They use aggressive collection practices, including calling your contacts. Stay far away from these. If you need a loan, go through a proper bank or NBFC.

Third trap — lifestyle inflation. This is the most subtle one. When you get a raise from five lakhs to seven lakhs, your lifestyle suddenly inflates to match — better apartment, better phone, more expensive restaurants. Before you know it, you are saving the same amount as before despite earning more. The antidote is to save at least fifty percent of every increment. If your salary increases by ten thousand per month, save at least five thousand of that increase.

Fourth, be very cautious with EMI purchases. Just because you can buy a one-lakh phone on twelve EMIs of nine thousand does not mean you should. That EMI amount could go into a SIP that would buy you financial freedom in the long run. Before any major purchase, ask yourself — will this matter in five years? If not, think twice.

Build wealth slowly and deliberately. Avoid the temptation of instant gratification. Your twenty-something self making smart financial decisions is the greatest gift you can give to your thirty-something self. I am not saying do not enjoy your money — I am saying enjoy it with a plan.`,
      keyPoints: [
        'Credit cards: ALWAYS pay full balance — minimum payment is a debt spiral (24-36% APR)',
        'Avoid instant loan apps — predatory rates (40-60%) and aggressive collection',
        'Lifestyle inflation: save at least 50% of every salary increment',
        'EMI trap: that Rs 9,000/month EMI could be a wealth-building SIP instead',
        'Ask before big purchases: "Will this matter in 5 years?"',
      ],
    },
  ],
  quizzes: [
    {
      triggerAtSeconds: 150,
      question:
        'In the 50-30-20 budgeting rule, what does the 20% represent?',
      options: [
        'Rent and utilities',
        'Entertainment',
        'Savings and Investments',
        'EMI payments',
      ],
      correctIndex: 2,
      hint: 'This portion is non-negotiable and should be auto-debited on salary day.',
    },
    {
      triggerAtSeconds: 300,
      question:
        'What is the employer EPF contribution rate as a percentage of your basic salary?',
      options: ['5%', '8%', '10%', '12%'],
      correctIndex: 3,
      hint: 'The employer matches what is deducted from your salary — same percentage.',
    },
    {
      triggerAtSeconds: 450,
      question:
        'What should you build before you start investing in mutual funds or stocks?',
      options: [
        'A diversified stock portfolio',
        'An emergency fund of 3-6 months of expenses',
        'A credit card with a high limit',
        'A fixed deposit of Rs 10 lakhs',
      ],
      correctIndex: 1,
      hint: 'This is your safety net for unexpected events — job loss, medical emergencies, etc.',
    },
  ],
}

// ============================================================================
// MODULE 6: LEADERSHIP & TEAMWORK
// ============================================================================

const leadershipTeamwork: CourseScript = {
  id: 'leadership-teamwork',
  title: 'Leadership & Teamwork',
  description:
    'You do not need a title to lead. Learn how to influence without authority, resolve conflicts constructively, delegate effectively, and build trust within your team.',
  category: 'Professional Skills',
  segments: [
    {
      title: 'Leading Without Authority',
      durationSeconds: 150,
      narration: `There is a myth that many freshers believe — leadership is for managers and seniors, not for someone who just joined. I am a junior developer, who am I to lead? Let me tell you something. Some of the most impactful leaders I have seen in Indian tech companies were not the ones with fancy titles. They were the junior engineers who stepped up, took initiative, and influenced outcomes without having any formal authority.

Leading without authority means making things happen through influence, initiative, and credibility rather than through positional power. And it is one of the fastest ways to accelerate your career.

Let me give you a real example. At a Hyderabad-based product company, there was a fresher named Ananya who noticed that the team was spending a lot of time on manual deployment — about two hours every release cycle. She was not the team lead. She was not even the most experienced developer. But she spent her weekends learning about CI/CD pipelines, built a proof of concept using Jenkins, and presented it to her manager with a clear estimate of time savings. The team adopted her solution, and within three months, she was recognized in the company's quarterly town hall. She did not wait for someone to assign her a leadership role — she created one.

So how do you lead without authority? First, identify problems before being asked. Look around your team and notice inefficiencies, pain points, and gaps. Then propose solutions. Do not just complain about a problem in a team chat — come with a suggestion. Instead of saying our documentation is terrible, say I have noticed our onboarding documentation is outdated. I would like to spend a few hours this week updating it. Would that be okay?

Second, be the person who follows through. In every team, there are people who talk about doing things and people who actually do them. Be the latter. When you take an action item in a meeting, deliver on it. When you promise to share a document, share it the same day. Reliability is the foundation of influence.

Third, help others succeed. Share useful articles, teach a concept to a struggling teammate, or volunteer to do a knowledge-sharing session. When you become the person who lifts others, people naturally look to you for guidance — regardless of your designation.

Fourth, manage up. Keep your manager informed about your initiatives without being asked. A simple weekly email saying here is what I worked on this week, here is what I am planning next week goes a long way. It shows ownership and strategic thinking. The people who get promoted fastest are not always the most talented — they are the ones who demonstrate leadership behavior before getting the title.`,
      keyPoints: [
        'Leadership is about influence and initiative, not titles',
        'Identify problems proactively and propose solutions',
        'Be the person who follows through — reliability builds influence',
        'Help others succeed: teach, share resources, volunteer for knowledge sessions',
        'Manage up: keep your manager informed about your initiatives weekly',
      ],
    },
    {
      title: 'Conflict Resolution in Teams',
      durationSeconds: 150,
      narration: `Let us be honest. Conflict in teams is inevitable. Put five or six people together, each with different backgrounds, working styles, and opinions, and disagreements will happen. In the Indian workplace, this is complicated by hierarchy, cultural deference, and sometimes regional or language dynamics. The question is not whether conflict will arise — it is how you handle it when it does.

First, understand that not all conflict is bad. Healthy conflict — where team members debate ideas, challenge assumptions, and push for better solutions — actually leads to stronger outcomes. The problem is unhealthy conflict — personal attacks, silent grudges, passive-aggressive behavior, and gossip behind people's backs.

Let me walk you through a common scenario. You are working on a project at a Bengaluru startup. You and your teammate Karthik have different opinions on the database design. You think MongoDB is the right choice for flexibility. He insists on PostgreSQL for data integrity. The discussion gets heated in a team call, and afterward, you both stop talking to each other. The project suffers because you are not collaborating.

Here is how to handle this constructively. Step one — separate the person from the problem. Karthik is not your enemy. He has a different technical perspective. Frame the conflict as us versus the problem, not you versus me. Say something like, we both want the best database solution for the project. Let us evaluate both options against our specific requirements.

Step two — listen to understand, not to respond. Go back to the active listening skills from Module Three. Let Karthik fully explain why he prefers PostgreSQL. Ask genuine questions. You might actually learn something that changes your mind — or at least helps you understand his reasoning.

Step three — find common ground. Maybe the answer is neither pure MongoDB nor pure PostgreSQL, but a combination that uses PostgreSQL for transactional data and MongoDB for the flexible user profile data. Most conflicts have a middle path that neither party initially sees.

Step four — if you cannot resolve it between yourselves, escalate constructively. Go to your team lead together — not separately. Separately means one person is complaining and the other is blindsided. Together means we have a technical disagreement and we would like your input. This shows maturity.

Step five — after resolution, let it go. Do not hold grudges. Do not bring up last month's database argument in next month's sprint retrospective. Resolve, learn, and move forward. The best teams are not the ones that avoid conflict — they are the ones that handle conflict well and come out stronger on the other side.`,
      keyPoints: [
        'Healthy conflict (idea debates) is good — unhealthy conflict (personal attacks, grudges) is toxic',
        'Separate the person from the problem: "us vs the problem" not "you vs me"',
        'Listen to understand their reasoning — you might learn something',
        'Find common ground: most conflicts have a middle path',
        'Escalate together, not separately — and after resolution, let it go',
      ],
    },
    {
      title: 'The Art of Delegation',
      durationSeconds: 150,
      narration: `Now, you might think — I am a fresher, who am I going to delegate to? But delegation is not just about assigning tasks to people who report to you. It is about knowing how to distribute work effectively, even among peers, in group projects, hackathons, or cross-functional teams. And understanding delegation early will prepare you for when you do become a team lead.

The biggest mistake people make with delegation is either doing everything themselves or dumping tasks on others without context. Let us talk about how to do it right.

First, understand that delegation is not about avoiding work — it is about leveraging strengths. In any team, different people have different skills. If you are great at frontend but weak at database design, and your teammate is the opposite, it makes zero sense for both of you to struggle with your weak areas when you could each focus on your strengths.

There is a simple framework called the Delegation Matrix. It maps tasks based on two factors — their importance and whether you are the best person to do them. High importance tasks that require your specific skills — do them yourself. High importance tasks that someone else can do better or equally well — delegate with clear instructions and checkpoints. Low importance tasks — delegate broadly or automate.

When you delegate, follow these five steps. One, clearly define the task. Not just what needs to be done, but what done looks like. Instead of saying handle the testing, say write integration tests for the payment module covering these five user flows. All tests should pass in the CI pipeline by Thursday. Two, provide context. Explain why the task matters. People do better work when they understand the purpose. Three, give appropriate authority. If you are asking someone to make decisions about the UI design, let them actually make decisions. Do not micromanage every pixel. Four, set check-in points. For a task due in a week, schedule a mid-week check-in to see progress and remove blockers. Five, give credit. When the work is done well, publicly acknowledge the person who did it. Nothing kills motivation faster than a team lead who takes credit for their team's work.

Here is a common Indian workplace dynamic. Many freshers are hesitant to delegate to peers because they do not want to seem bossy or arrogant. The key is framing. Instead of saying you do this, try hey, I think you would be great at the API documentation since you understand the endpoints so well. I will handle the testing if you can take that on. Would that work? This is collaborative delegation — and it works beautifully.`,
      keyPoints: [
        'Delegation is not avoiding work — it is leveraging team strengths',
        'Delegation Matrix: importance vs whether you are the best person for it',
        '5 steps: define clearly, give context, grant authority, set check-ins, give credit',
        'Frame peer delegation collaboratively: "I think you would be great at..."',
        'Never micromanage and never take credit for delegated work',
      ],
    },
    {
      title: 'Building Trust in Teams',
      durationSeconds: 150,
      narration: `Everything we have discussed in this module — leading without authority, resolving conflicts, delegating effectively — all of it depends on one foundation: trust. Without trust, teams fall apart. People hoard information, avoid collaboration, cover up mistakes, and play political games. With trust, teams become greater than the sum of their parts.

So how do you build trust, especially as a new member of a team? Let me share five principles that work in every Indian workplace, from a three-person startup to a three-hundred-thousand-person IT giant.

Principle one — consistency. Do what you say you will do. Every single time. If you say you will deliver the report by five PM, deliver it by five PM. If you realize you cannot make the deadline, communicate early — do not wait until the last minute. Consistency over time creates predictability, and predictability creates trust. People need to know they can rely on you.

Principle two — vulnerability. This sounds counterintuitive in Indian corporate culture, where we often feel pressure to appear perfect and all-knowing. But admitting when you do not know something, asking for help, and acknowledging mistakes actually builds trust faster than pretending to be flawless. When you say I made an error in the calculation, here is what I have done to fix it, your team respects you more, not less. Patrick Lencioni, who wrote The Five Dysfunctions of a Team, identified absence of vulnerability-based trust as the number one team dysfunction.

Principle three — transparency. Share information freely. If you learn something in a meeting that affects your teammates, pass it on. If you discover a risk in the project, flag it immediately instead of hoping it goes away. In companies like Zerodha and CRED, information transparency is a core value because they understand that hoarding information creates silos and distrust.

Principle four — give the benefit of the doubt. When a colleague misses a deadline or makes a mistake, assume positive intent first. Maybe they were dealing with a personal crisis. Maybe they misunderstood the requirement. Approach the situation with curiosity, not judgment. Hey, I noticed the module was not delivered on time. Is everything okay? How can I help? This response builds trust. Whereas going straight to complaint mode — you missed the deadline, this is unacceptable — destroys it.

Principle five — invest in relationships beyond work. You do not need to become best friends with your colleagues, but knowing them as people makes a difference. Have chai together. Ask about their weekend. Remember that Priya mentioned her mother's surgery and follow up. These small human connections create a fabric of trust that holds the team together when projects get tough and deadlines get tight. The strongest teams are not just colleagues working together — they are people who genuinely care about each other's success.`,
      keyPoints: [
        'Consistency: do what you say, every time — communicate early if you cannot',
        'Vulnerability: admitting mistakes and asking for help builds trust faster',
        'Transparency: share information freely — hoarding creates silos and distrust',
        'Benefit of the doubt: assume positive intent before jumping to blame',
        'Invest in human connections — chai, follow-ups, knowing people beyond work',
      ],
    },
  ],
  quizzes: [
    {
      triggerAtSeconds: 150,
      question:
        'What is the fastest way for a fresher to demonstrate leadership without a formal title?',
      options: [
        'Wait to be assigned leadership responsibilities',
        'Identify problems proactively and propose solutions',
        'Tell others what to do in meetings',
        'Apply for a team lead position immediately',
      ],
      correctIndex: 1,
      hint: 'Leadership without authority starts with initiative and taking ownership of problems.',
    },
    {
      triggerAtSeconds: 300,
      question:
        'When you and a teammate cannot resolve a technical disagreement, what is the best approach to escalation?',
      options: [
        'Complain to your manager privately',
        'Send an email to the entire team highlighting the issue',
        'Go to the team lead together and ask for input',
        'Drop the issue and go with whatever the other person wants',
      ],
      correctIndex: 2,
      hint: 'The key is approaching the escalation as a team, not as opponents.',
    },
    {
      triggerAtSeconds: 450,
      question:
        'According to Patrick Lencioni, what is the number one dysfunction of a team?',
      options: [
        'Lack of clear goals',
        'Absence of vulnerability-based trust',
        'Too many meetings',
        'Poor technical skills',
      ],
      correctIndex: 1,
      hint: 'It all starts with the foundation — the willingness to be open and honest with each other.',
    },
  ],
}

// ============================================================================
// MODULE 7: DIGITAL SKILLS & PERSONAL BRANDING
// ============================================================================

const digitalSkillsPersonalBranding: CourseScript = {
  id: 'digital-skills-personal-branding',
  title: 'Digital Skills & Personal Branding',
  description:
    'In the digital age, your online presence is your first impression. Learn to optimize LinkedIn, build a killer portfolio, contribute to open source, and craft a personal brand that opens doors.',
  category: 'Career Development',
  segments: [
    {
      title: 'LinkedIn Optimization for Indian Professionals',
      durationSeconds: 150,
      narration: `Let me ask you a question. If a recruiter from Google, Amazon, or Flipkart searched for someone with your skills on LinkedIn right now, would your profile show up? More importantly, if it did show up, would it convince them to reach out? For most Indian freshers, the answer to both questions is no. And that is a massive missed opportunity.

LinkedIn is not just a social media platform — it is the single most important professional networking tool in India today. Over one hundred million Indians are on LinkedIn, and recruiters at every major company use it as their primary sourcing tool. Here is how to make your profile work for you.

First, your profile photo. This is not Instagram. Use a professional headshot with a clean background. You do not need a studio photo — a well-lit photo taken on a phone with a plain wall behind you works perfectly. Dress in what you would wear to a business casual office. Smile. Profiles with photos get twenty-one times more views.

Second, your headline. Most people have their headline as student at XYZ College or fresher. That tells recruiters nothing. Instead, write a headline that showcases your value. Something like Full-Stack Developer with a passion for React and Node.js or Aspiring Data Scientist with published research in NLP at IIT Madras. Your headline appears in search results, so pack it with relevant keywords.

Third, your About section. This is your elevator pitch in two hundred words or less. Write in first person. Share what drives you, what you have built, and what you are looking for. Keep it conversational but professional. Something like I am a computer science graduate from BITS Pilani who loves building products that solve real problems. During my internship at PhonePe, I worked on the merchant onboarding flow, reducing drop-off rates by fifteen percent. I am currently exploring opportunities in product engineering where I can combine my backend skills with user-facing impact.

Fourth, your Experience and Projects sections. Treat these like your resume — use impact-driven bullet points with numbers. Do not just say worked on frontend development. Say built and deployed a React-based dashboard serving ten thousand daily active users, reducing page load time by forty percent.

Fifth, engage actively. Follow companies you admire. Comment thoughtfully on posts by industry leaders. Share your learnings — even a simple post about what you learned from a coding challenge can get hundreds of views. The LinkedIn algorithm favors consistent engagement. Post once or twice a week and within three months, you will have a visible presence. Recruiters do not just search for candidates — they notice people who show up regularly with valuable content.`,
      keyPoints: [
        'Professional headshot: clean background, business casual, smiling — 21x more views',
        'Headline: not "Fresher" — use keywords like "Full-Stack Developer | React & Node.js"',
        'About section: first person, 200 words, your story + impact + what you seek',
        'Experience: impact-driven bullets with numbers, just like your resume',
        'Engage: comment, share learnings, post 1-2x/week — consistency builds visibility',
      ],
    },
    {
      title: 'Building a Portfolio That Gets Noticed',
      durationSeconds: 150,
      narration: `Your resume says what you can do. Your portfolio proves it. In 2025 and beyond, every tech professional — whether you are a developer, designer, data analyst, or content creator — needs a portfolio. And no, your GitHub repository with a single to-do app from a tutorial does not count.

Let me tell you what a strong portfolio looks like. Take the example of Priya, a twenty-three-year-old developer from Chennai. She built a personal portfolio website using Next.js and deployed it on Vercel. On her site, she has four projects — not twenty, just four solid ones. Each project page includes a live demo link, the GitHub repository, a clear description of the problem it solves, the tech stack used, screenshots of the interface, challenges she faced during development and how she overcame them, and what she would do differently if she rebuilt it. One of her projects is a real tool that two hundred people actually use — a college canteen menu tracker. That single project, because it has real users and real impact, is worth more than ten tutorial-based projects.

So how do you build portfolio-worthy projects? Start with problems you actually face. Is there an attendance tracking problem at your college? Build a solution. Is there no good way to split expenses in your friend group? Build that. Does your local chai shop struggle with orders during rush hour? Build a simple ordering system. Real-world problems make for the best projects because they demonstrate that you can identify needs and build solutions — which is exactly what companies pay you to do.

For non-technical professionals, a portfolio looks different but is equally important. If you are a content writer, create a personal blog using WordPress or Medium. If you are into marketing, document a case study of a social media campaign you ran — even for a college fest. If you are a designer, use Behance or Dribbble to showcase your work.

Here is the technical setup I recommend. Buy a custom domain — your name dot com or your name dot dev. It costs about five hundred to a thousand rupees per year. Use a modern framework — Next.js, Astro, or even a clean HTML and CSS site. Host it for free on Vercel, Netlify, or GitHub Pages. Make sure it is mobile-responsive and loads fast. Add a clear call to action — a way for recruiters to contact you or download your resume.

One more thing — your portfolio is never done. Update it every time you complete a new project or learn a new skill. A portfolio that was last updated eighteen months ago looks abandoned. A portfolio updated last week looks like you are active, growing, and serious about your craft.`,
      keyPoints: [
        '4 solid projects > 20 tutorial projects — quality over quantity',
        'Each project: live demo, GitHub link, problem statement, challenges, learnings',
        'Build solutions for real problems — real users and impact are portfolio gold',
        'Custom domain + modern framework + free hosting (Vercel/Netlify/GitHub Pages)',
        'Update your portfolio regularly — an outdated portfolio looks abandoned',
      ],
    },
    {
      title: 'GitHub & Open-Source Contributions',
      durationSeconds: 150,
      narration: `If LinkedIn is your professional face, GitHub is your technical proof. And for software developers in India, a strong GitHub profile can literally be the difference between getting hired and getting ignored.

Let me be blunt. When a hiring manager at a product company like Atlassian, Razorpay, or Slice reviews your application, they will check your GitHub. And here is what they are looking for — not a profile full of forked repositories that you never touched. They want to see original projects, meaningful commits, clean code, good documentation, and ideally, contributions to open-source projects.

Let us start with your GitHub profile. Pin your six best repositories. Each pinned repo should have a clear README file with a project description, setup instructions, screenshots if applicable, and the tech stack. A repository without a README is like a book without a cover — nobody will open it.

Now let us talk about open-source contributions, because this is where things get exciting. Contributing to open source is one of the most powerful things a fresher can do. It proves that you can read and understand someone else's code, follow contribution guidelines, write clean PRs with proper descriptions, and collaborate with developers worldwide.

But where do you start? The whole thing can feel intimidating. Here are practical steps. First, look for repositories with labels like good-first-issue, beginner-friendly, or help-wanted on GitHub. Websites like goodfirstissue dot dev and up-for-grabs dot net curate these specifically for beginners. Second, start with documentation fixes. Correcting a typo in a README or improving setup instructions is a legitimate contribution that gets your name into the project's contributor list. Third, graduate to bug fixes and small features. Pick an issue that is clearly defined, understand the codebase, and submit a well-documented pull request.

Some Indian open-source projects are great starting points. Check out projects by organizations like Postman, Hasura, and Appwrite — all founded by Indians and very welcoming to new contributors. There is also Hacktoberfest every October, where you can earn swag by contributing to open source.

One thing that impresses hiring managers enormously is a contribution graph that shows consistent activity. You do not need to commit every day, but regular contributions — even small ones — show discipline and passion. Think of your GitHub profile as a garden. A few commits here and there is fine, but consistent nurturing over months creates something truly impressive.`,
      keyPoints: [
        'Pin 6 best repos with clear READMEs — description, setup, screenshots, tech stack',
        'Open source: start with "good-first-issue" labels and documentation fixes',
        'Resources: goodfirstissue.dev, up-for-grabs.net, Hacktoberfest',
        'Indian-founded projects to contribute to: Postman, Hasura, Appwrite',
        'Consistent contribution graph > occasional bursts — show discipline',
      ],
    },
    {
      title: 'Personal Brand Strategy',
      durationSeconds: 150,
      narration: `Let us tie everything together. You have optimized your LinkedIn, built a portfolio, and started contributing on GitHub. Now it is time to think about something bigger — your personal brand. And no, personal branding is not about becoming a LinkedIn influencer who posts motivational quotes every morning. It is about being intentionally known for something valuable.

Your personal brand is the answer to this question: when someone in your industry hears your name, what do they think of? Right now, as a fresher, the answer might be nothing — they have never heard of you. Your goal over the next one to two years is to change that. You want people in your niche to associate your name with expertise, reliability, and a specific area of knowledge.

Step one — pick your niche. You cannot be known for everything. Are you passionate about frontend development? Backend systems? Machine learning? Cloud architecture? DevOps? Choose one area and go deep. It is better to be the go-to person for React development in your network than to be vaguely known as a software developer.

Step two — create content consistently. This does not mean you need to become a YouTuber. Start with what feels comfortable. Write a blog post on Hashnode or Dev.to about something you learned. Tweet about a technical problem you solved. Make a short LinkedIn post about a book you read. Share a thread about your open-source journey. The format matters less than the consistency. Once a week is a great starting point.

Step three — speak at events. Start small. Give a lightning talk at your local tech meetup. Present at your company's internal knowledge-sharing session. Apply to speak at college tech fests. Every talk builds your confidence and expands your network. Cities like Bangalore, Hyderabad, Pune, and Chennai have thriving tech meetup communities — look for groups on meetup dot com, Luma, or Twitter.

Step four — build in public. Share your journey as you learn and grow. Document your hundred-day coding challenge. Share your experience preparing for system design interviews. Be honest about failures and learnings — people connect more with authentic journeys than polished highlight reels.

Step five — network with intention. Follow and engage with people you admire in your field. Reply to their tweets. Comment on their blog posts. Attend their talks and ask thoughtful questions. Over time, these one-way interactions become two-way relationships. I have seen Indian freshers land incredible opportunities — from referrals at FAANG companies to speaking invitations at major conferences — purely because they built a strong personal brand online.

Here is the long game. Your personal brand compounds over time, just like investments. The blog post you write today might be read by a recruiter two years from now. The meetup talk you give this month might be remembered by an attendee who becomes a hiring manager. Every piece of content, every interaction, every contribution is a brick in the building of your professional reputation. Start laying those bricks today.`,
      keyPoints: [
        'Personal brand = what people in your industry think when they hear your name',
        'Pick ONE niche and go deep — be the go-to person for a specific area',
        'Create content weekly: blog posts, tweets, LinkedIn posts, threads',
        'Speak at meetups and events: Bangalore, Hyderabad, Pune, Chennai — thriving communities',
        'Build in public: share your journey honestly — authenticity > perfection',
      ],
    },
  ],
  quizzes: [
    {
      triggerAtSeconds: 150,
      question:
        'What should your LinkedIn headline contain instead of just "Fresher" or "Student"?',
      options: [
        'Your college name and graduation year',
        'A motivational quote',
        'Keywords showcasing your skills and value proposition',
        'Your phone number for recruiters',
      ],
      correctIndex: 2,
      hint: 'Your headline appears in search results — think about what would make a recruiter click.',
    },
    {
      triggerAtSeconds: 300,
      question: 'What makes a portfolio project stand out to hiring managers?',
      options: [
        'Using the latest and most trendy framework',
        'Having the most lines of code',
        'Solving a real problem with actual users and documented impact',
        'Having a colorful and animated user interface',
      ],
      correctIndex: 2,
      hint: 'Companies hire people who can identify and solve real-world problems.',
    },
    {
      triggerAtSeconds: 450,
      question:
        'What is a good first step for contributing to open-source projects?',
      options: [
        'Rewrite the entire codebase of a major project',
        'Fork a popular repository and add your name to the README',
        'Start with documentation fixes and issues labeled "good-first-issue"',
        'Build your own programming language from scratch',
      ],
      correctIndex: 2,
      hint: 'Start small and manageable — there are labels specifically for beginners.',
    },
  ],
}

// ============================================================================
// EXPORT ALL COURSE SCRIPTS
// ============================================================================

export const COURSE_SCRIPTS: CourseScript[] = [
  timeManagement,
  workplaceEtiquette,
  socialCommunication,
  resumeInterviewMastery,
  financialLiteracy,
  leadershipTeamwork,
  digitalSkillsPersonalBranding,
]

// Utility exports for quick access by module ID
export const getCourseById = (id: string): CourseScript | undefined =>
  COURSE_SCRIPTS.find((course) => course.id === id)

export const getCoursesByCategory = (category: string): CourseScript[] =>
  COURSE_SCRIPTS.filter((course) => course.category === category)

export const ALL_COURSE_IDS = COURSE_SCRIPTS.map((course) => course.id)

export const COURSE_CATEGORIES = [
  ...new Set(COURSE_SCRIPTS.map((course) => course.category)),
]
