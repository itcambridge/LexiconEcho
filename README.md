# LexiconEcho - AI Executive Suite

LexiconEcho is an innovative AI-powered executive consultation platform that simulates a C-suite of AI executives to provide comprehensive business analysis and strategic advice.

## Features

- **AI Executive Team**: Full C-suite of AI executives including CEO, CMO, CTO, CFO, and more
- **Interactive Consultation**: Real-time consultation with multiple AI executives
- **Strategic Synthesis**: Automated synthesis of executive insights into actionable strategies
- **Cost Tracking**: Detailed token usage and cost monitoring
- **Beautiful UI**: Modern, responsive interface with executive cards and detailed reporting

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/itcambridge/LexiconEcho.git
cd LexiconEcho
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your OpenAI API key:
```env
OPENAI_API_KEY=your_api_key_here
NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter your business query in the consultation interface
2. The AI CEO will analyze your query and delegate to relevant executives
3. Each executive provides specialized insights based on their domain
4. The CEO synthesizes all inputs into a comprehensive strategy
5. Review the detailed synthesis report and cost summary

## Architecture

- **Frontend**: Next.js with React and TypeScript
- **Styling**: CSS Modules for component-level styling
- **AI Integration**: OpenAI GPT-4 API
- **State Management**: React Hooks and Context
- **API Layer**: Next.js API Routes

## Project Structure

```
src/
├── components/      # React components
├── interfaces/      # TypeScript interfaces
├── pages/          # Next.js pages and API routes
├── services/       # Business logic and API services
├── types/          # TypeScript type definitions
└── utils/          # Utility functions and helpers
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for providing the GPT-4 API
- Next.js team for the amazing framework
- All contributors and users of LexiconEcho 