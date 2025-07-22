# TruthLens - AI-Powered Disinformation Detection Tool

## Overview

TruthLens is a full-stack application that leverages AI to analyze textual content and identify potentially misleading or unreliable information. Built as an educational platform to promote digital literacy and critical thinking skills.

**Design Philosophy**: Focuses on education and user empowerment - not on determining absolute "truth" but on promoting critical thinking skills.

## Key Features

- **Reliability Score (0-100)**: Overall assessment of content trustworthiness
- **Cognitive Bias Detection**: Identifies biases like confirmation bias, anchoring bias
- **Logical Fallacy Recognition**: Detects ad hominem, false dichotomy, straw man arguments
- **Red Flag Identification**: Highlights suspicious patterns and warning signs
- **Educational Explanations**: Clear, understandable analysis with concrete examples

## Tech Stack

- **Frontend**: React 18 with hooks, modern CSS, RTL support
- **Backend**: Node.js with Express.js
- **AI Provider**: Groq API with Llama 3 model (fast, free tier available)

## Installation

### Prerequisites
```bash
Node.js (v16+)
npm or yarn
```

### Setup
```bash
# Frontend
cd client
npm install
npm run dev

# Backend
cd server
npm install
npm run dev
```

### Environment Variables
```
GROQ_API_KEY=your_groq_api_key_here
```

## Usage Example

**Input:**
```
"Scientists discovered that downloading the 'Good Morning' app improves mood by 200% instantly. Everyone already downloaded it!"
```

**Output:**
- Reliability Score: 15/100
- Red Flags: Claim without evidence, social pressure tactics
- Logical Fallacies: Appeal to popularity

## Key Features

### Privacy by Design
- No data retention
- Transparent processing
- User agency emphasized

### Educational Focus
- Promotes independent evaluation
- Detailed explanations for every analysis
- Cultural context awareness

## Limitations

- AI may miss satirical content or cultural nuances
- Risk of AI hallucination
- Designed as educational aid, not definitive truth arbiter

## Contributing

Contributions welcome that align with our mission of promoting digital literacy and critical thinking.

---

**Note**: TruthLens is an educational aid to promote critical thinking, not a definitive arbiter of truth. Users should verify information through multiple sources.
