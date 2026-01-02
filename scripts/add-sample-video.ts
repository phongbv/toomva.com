// Example script to add sample video via API
// Run with: npm install -D tsx && npx tsx scripts/add-sample-video.ts

const sampleVideo = {
  title: "English Learning - Basic Greetings",
  description: "Learn basic English greetings and introductions",
  videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  subtitles: {
    english: [
      {
        startTime: 1,
        endTime: 4,
        textEn: "Hello, welcome to our English learning platform.",
        textVi: "Xin chào, chào mừng đến với nền tảng học tiếng Anh của chúng tôi."
      },
      {
        startTime: 4,
        endTime: 7,
        textEn: "Today we will learn some basic phrases.",
        textVi: "Hôm nay chúng ta sẽ học một số cụm từ cơ bản."
      },
      {
        startTime: 7,
        endTime: 10,
        textEn: "Let's start with greetings and introductions.",
        textVi: "Hãy bắt đầu với việc chào hỏi và giới thiệu."
      },
      {
        startTime: 10,
        endTime: 13,
        textEn: "Good morning! How are you today?",
        textVi: "Chào buổi sáng! Hôm nay bạn thế nào?"
      },
      {
        startTime: 13,
        endTime: 16,
        textEn: "I'm fine, thank you. And you?",
        textVi: "Tôi khỏe, cảm ơn bạn. Còn bạn thì sao?"
      },
      {
        startTime: 16,
        endTime: 19,
        textEn: "Nice to meet you. What's your name?",
        textVi: "Rất vui được gặp bạn. Tên bạn là gì?"
      },
      {
        startTime: 19,
        endTime: 22,
        textEn: "My name is John. I'm from America.",
        textVi: "Tên tôi là John. Tôi đến từ Mỹ."
      },
      {
        startTime: 22,
        endTime: 25,
        textEn: "That's wonderful! Where do you live?",
        textVi: "Thật tuyệt vời! Bạn sống ở đâu?"
      },
      {
        startTime: 25,
        endTime: 28,
        textEn: "I live in New York City.",
        textVi: "Tôi sống ở thành phố New York."
      },
      {
        startTime: 28,
        endTime: 31,
        textEn: "Great! Let's continue learning together.",
        textVi: "Tuyệt vời! Hãy cùng nhau tiếp tục học nhé."
      }
    ],
    vietnamese: [
      {
        startTime: 1,
        endTime: 4,
        textEn: "Hello, welcome to our English learning platform.",
        textVi: "Xin chào, chào mừng đến với nền tảng học tiếng Anh của chúng tôi."
      },
      {
        startTime: 4,
        endTime: 7,
        textEn: "Today we will learn some basic phrases.",
        textVi: "Hôm nay chúng ta sẽ học một số cụm từ cơ bản."
      },
      {
        startTime: 7,
        endTime: 10,
        textEn: "Let's start with greetings and introductions.",
        textVi: "Hãy bắt đầu với việc chào hỏi và giới thiệu."
      },
      {
        startTime: 10,
        endTime: 13,
        textEn: "Good morning! How are you today?",
        textVi: "Chào buổi sáng! Hôm nay bạn thế nào?"
      },
      {
        startTime: 13,
        endTime: 16,
        textEn: "I'm fine, thank you. And you?",
        textVi: "Tôi khỏe, cảm ơn bạn. Còn bạn thì sao?"
      },
      {
        startTime: 16,
        endTime: 19,
        textEn: "Nice to meet you. What's your name?",
        textVi: "Rất vui được gặp bạn. Tên bạn là gì?"
      },
      {
        startTime: 19,
        endTime: 22,
        textEn: "My name is John. I'm from America.",
        textVi: "Tên tôi là John. Tôi đến từ Mỹ."
      },
      {
        startTime: 22,
        endTime: 25,
        textEn: "That's wonderful! Where do you live?",
        textVi: "Thật tuyệt vời! Bạn sống ở đâu?"
      },
      {
        startTime: 25,
        endTime: 28,
        textEn: "I live in New York City.",
        textVi: "Tôi sống ở thành phố New York."
      },
      {
        startTime: 28,
        endTime: 31,
        textEn: "Great! Let's continue learning together.",
        textVi: "Tuyệt vời! Hãy cùng nhau tiếp tục học nhé."
      }
    ]
  }
};

async function addSampleVideo() {
  try {
    const response = await fetch('http://localhost:3000/api/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleVideo),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create video');
    }

    const result = await response.json();
    console.log('Sample video added successfully!');
    console.log('Video ID:', result.id);
    console.log('Watch at: http://localhost:3000/watch/' + result.id);
  } catch (error) {
    console.error('Error adding sample video:', error);
  }
}

// Only run if this is the main module
if (require.main === module) {
  addSampleVideo();
}

export { addSampleVideo, sampleVideo };
