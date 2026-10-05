const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const connectDB = require('../config/db');

const sampleQuestions = [
  {
    questionText: 'What is the capital city of India?',
    questionType: 'multiple_choice',
    options: ['Mumbai', 'Kolkata', 'New Delhi', 'Chennai'],
    correctAnswer: 2,
    timer: 20,
    points: 1000
  },
  {
    questionText: 'Which planet is known as the "Red Planet"?',
    questionType: 'multiple_choice',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 1,
    timer: 15,
    points: 1000
  },
  {
    questionText: 'The chemical element Gold has the symbol "Au".',
    questionType: 'true_false',
    options: ['True', 'False'],
    correctAnswer: 0,
    timer: 10,
    points: 1000
  },
  {
    questionText: 'What is the largest ocean on Earth?',
    questionType: 'multiple_choice',
    options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
    correctAnswer: 3,
    timer: 20,
    points: 1000
  },
  {
    questionText: 'Who painted the Mona Lisa?',
    questionType: 'multiple_choice',
    options: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Claude Monet'],
    correctAnswer: 1,
    timer: 20,
    points: 1000
  },
  {
    questionText: 'Light travels faster than Sound.',
    questionType: 'true_false',
    options: ['True', 'False'],
    correctAnswer: 0,
    timer: 10,
    points: 1000
  },
  {
    questionText: 'What is the primary gas found in Earth’s atmosphere?',
    questionType: 'multiple_choice',
    options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'],
    correctAnswer: 2,
    timer: 20,
    points: 1000
  },
  {
    questionText: 'Which organ pumps blood throughout the human body?',
    questionType: 'multiple_choice',
    options: ['Lungs', 'Heart', 'Brain', 'Liver'],
    correctAnswer: 1,
    timer: 15,
    points: 1000
  },
  {
    questionText: 'Mount Everest is the highest mountain peak in the world.',
    questionType: 'true_false',
    options: ['True', 'False'],
    correctAnswer: 0,
    timer: 10,
    points: 1000
  },
  {
    questionText: 'What is the speed of light in vacuum (approx)?',
    questionType: 'multiple_choice',
    options: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '1,000,000 km/s'],
    correctAnswer: 0,
    timer: 20,
    points: 1000
  },
  {
    questionText: 'Which programming language is known as the language of the Web?',
    questionType: 'multiple_choice',
    options: ['Python', 'C++', 'JavaScript', 'Java'],
    correctAnswer: 2,
    timer: 15,
    points: 1000
  },
  {
    questionText: 'How many continents are there on Earth?',
    questionType: 'multiple_choice',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2,
    timer: 15,
    points: 1000
  },
  {
    questionText: 'Water freezes at 0 degrees Celsius.',
    questionType: 'true_false',
    options: ['True', 'False'],
    correctAnswer: 0,
    timer: 10,
    points: 1000
  },
  {
    questionText: 'Which planet has the most prominent ring system?',
    questionType: 'multiple_choice',
    options: ['Uranus', 'Saturn', 'Neptune', 'Jupiter'],
    correctAnswer: 1,
    timer: 15,
    points: 1000
  },
  {
    questionText: 'What is the powerhouse of the cell?',
    questionType: 'multiple_choice',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Endoplasmic Reticulum'],
    correctAnswer: 2,
    timer: 20,
    points: 1000
  }
];

const seedData = async () => {
  try {
    await connectDB();

    // Check if admin user exists
    let admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      console.log('Creating demo admin user...');
      admin = await User.create({
        name: 'Quiz Master',
        email: 'admin@example.com',
        passwordHash: 'Admin@123',
        role: 'admin'
      });
      console.log('Demo Admin created: admin@example.com / Admin@123');
    } else {
      console.log('Demo Admin already exists: admin@example.com');
    }

    // Check if sample quiz exists
    const existingQuiz = await Quiz.findOne({ title: 'General Knowledge Challenge', creatorId: admin._id });
    if (!existingQuiz) {
      console.log('Creating sample 15-question quiz...');
      await Quiz.create({
        title: 'General Knowledge Challenge',
        description: 'An exciting 15-question trivia challenge covering geography, science, history, and space science!',
        category: 'General Knowledge',
        difficulty: 'Medium',
        visibility: 'Public',
        creatorId: admin._id,
        questions: sampleQuestions
      });
      console.log('Sample quiz created successfully!');
    } else {
      console.log('Sample quiz already exists!');
    }

    console.log('Database seeding complete!');
  } catch (err) {
    console.error('Seeding error:', err.message);
  }
};

if (require.main === module) {
  seedData().then(() => mongoose.connection.close());
}

module.exports = seedData;
