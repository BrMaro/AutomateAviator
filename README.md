# AutomateAviator

A Node.js-based automation bot for collecting and analyzing Aviator game data. This bot monitors game outcomes and can execute betting strategies based on historical patterns.

## Overview

This bot automates the process of:

- Collecting bust data from Aviator games
- Logging game results with timestamps
- Implementing customizable betting strategies
- Monitoring balance changes

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- Chrome/Chromium browser

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/AutomateAviator.git
cd AutomateAviator
```

2. Install dependencies:

```bash
npm install
```

## Configuration

1. Copy the environment template file:

```bash
cp .env.example .env
```

2. Update your environment variables in `.env`:

```env
# Aviator login credentials
PHONE_NUMBER=your_phone_number
PASSWORD=your_password

# Game configuration
DEFAULT_BET_AMOUNT=10
DEFAULT_MULTIPLIER=10

# Strategies configuration
INITIAL_STRATEGY=strategy_3
```

3. The `.env` file is gitignored for security, so your credentials won't be tracked in version control.

## Usage

Run the bot:

```bash
node index.js
```

### Data Output

The bot generates a `bustLog.json` file with the following structure:

```json
[
  {
    "Time": "HH:MM:SS",
    "bust": 1.98
  }
]
```

### Features

- Real-time bust data collection
- Automated login handling
- Multiple betting strategies
- Balance monitoring
- Error handling and recovery
- Session persistence through JSON logging

## License

MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Disclaimer

This bot is for educational purposes only. Please be aware of and comply with the terms of service of any platform you use this with.
