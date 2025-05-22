const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  addQuizzes();
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

async function addQuizzes() {
  try {
    // Find an admin user to assign as creator
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Quiz 1: Web Development
    await createWebDevQuiz(adminUser._id);
    
    // Quiz 2: Ubuntu VM Setup
    await createUbuntuVMQuiz(adminUser._id);
    
    // Quiz 3: Customer Support
    await createCustomerSupportQuiz(adminUser._id);
    
    console.log('All quizzes created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating quizzes:', error);
    process.exit(1);
  }
}

async function createWebDevQuiz(userId) {
  // Create the quiz
  const quiz = new Quiz({
    title: 'Grunnleggende Webutvikling',
    description: 'Test din kunnskap om HTML, CSS og JavaScript - de grunnleggende byggesteinene for moderne nettsider.',
    category: 'Programmering',
    difficulty: 'Lett',
    createdBy: userId,
    isPublic: true,
    questions: []
  });
  
  // Save the quiz to get its ID
  await quiz.save();
  
  // Create questions
  const questions = [
    // Question 1: Multiple choice
    new Question({
      quizId: quiz._id,
      questionText: 'Hva står HTML for?',
      questionType: 'multiple-choice',
      timeLimit: 20,
      points: 10,
      options: [
        { text: 'Hyper Text Markup Language', isCorrect: true },
        { text: 'Hyperlinks and Text Markup Language', isCorrect: false },
        { text: 'Home Tool Markup Language', isCorrect: false },
        { text: 'Hyper Technical Modern Language', isCorrect: false }
      ],
      explanation: 'HTML står for Hyper Text Markup Language og er standardspråket for å lage websider.'
    }),
    
    // Question 2: Multiple choice
    new Question({
      quizId: quiz._id,
      questionText: 'Hvilken CSS-egenskap brukes for å endre tekstfarge?',
      questionType: 'multiple-choice',
      timeLimit: 15,
      points: 10,
      options: [
        { text: 'text-color', isCorrect: false },
        { text: 'font-color', isCorrect: false },
        { text: 'color', isCorrect: true },
        { text: 'text-style', isCorrect: false }
      ],
      explanation: 'CSS-egenskapen "color" brukes for å spesifisere tekstfargen på et element.'
    }),
    
    // Question 3: True/False
    new Question({
      quizId: quiz._id,
      questionText: 'JavaScript er det samme som Java.',
      questionType: 'true-false',
      timeLimit: 15,
      points: 5,
      options: [
        { text: 'Sant', isCorrect: false },
        { text: 'Usant', isCorrect: true }
      ],
      explanation: 'JavaScript og Java er helt forskjellige programmeringsspråk til tross for likheten i navn. JavaScript er et skriptspråk primært brukt for webutvikling, mens Java er et generelt programmeringsspråk.'
    }),
    
    // Question 4: Fill in blank
    new Question({
      quizId: quiz._id,
      questionText: 'For å linke til en ekstern CSS-fil i HTML, bruker vi ____ taggen.',
      questionType: 'fill-in-blank',
      timeLimit: 20,
      points: 15,
      correctAnswer: 'link',
      explanation: 'Link-taggen (<link>) brukes for å linke eksterne ressurser til HTML-dokumentet, spesielt CSS-filer.'
    }),
    
    // Question 5: Multiple choice
    new Question({
      quizId: quiz._id,
      questionText: 'Hvilken metode bruker vi for å velge et HTML-element etter ID i JavaScript?',
      questionType: 'multiple-choice',
      timeLimit: 20,
      points: 10,
      options: [
        { text: 'document.query(id)', isCorrect: false },
        { text: 'document.getElementById(id)', isCorrect: true },
        { text: 'document.innerHTML(id)', isCorrect: false },
        { text: 'document.getElement(id)', isCorrect: false }
      ],
      explanation: 'document.getElementById() er en innebygd JavaScript-metode som returnerer et element med en spesifisert ID.'
    }),
    
    // Question 6: Matching
    new Question({
      quizId: quiz._id,
      questionText: 'Match HTML-elementene med deres formål:',
      questionType: 'matching',
      timeLimit: 30,
      points: 20,
      matchingPairs: [
        { left: '<h1>', right: 'Hovedoverskrift' },
        { left: '<p>', right: 'Paragraf' },
        { left: '<a>', right: 'Hyperlink' },
        { left: '<img>', right: 'Bilde' },
        { left: '<ul>', right: 'Unummerert liste' }
      ],
      explanation: 'Hver HTML-tag har sitt spesifikke formål i strukturen av en nettside.'
    }),
    
    // Question 7: Multiple choice
    new Question({
      quizId: quiz._id,
      questionText: 'Hvilken CSS-boks-egenskap legger til mellomrom rundt innholdet i et element, innenfor eventuell padding?',
      questionType: 'multiple-choice',
      timeLimit: 20,
      points: 15,
      options: [
        { text: 'border', isCorrect: false },
        { text: 'margin', isCorrect: false },
        { text: 'padding', isCorrect: true },
        { text: 'spacing', isCorrect: false }
      ],
      explanation: 'Padding legger til mellomrom rundt innholdet i et element, men innenfor grensen (border).'
    })
  ];
  
  // Save questions and add them to the quiz
  for (const question of questions) {
    await question.save();
    quiz.questions.push(question._id);
  }
  
  // Update the quiz with question references
  await quiz.save();
  
  console.log('Web Development Quiz created');
  return quiz;
}

async function createUbuntuVMQuiz(userId) {
  // Create the quiz
  const quiz = new Quiz({
    title: 'Oppsett av Ubuntu VM',
    description: 'Lær hvordan du setter opp og konfigurerer en Ubuntu virtuell maskin steg for steg.',
    category: 'Nettverk',
    difficulty: 'Middels',
    createdBy: userId,
    isPublic: true,
    questions: []
  });
  
  // Save the quiz to get its ID
  await quiz.save();
  
  // Create questions
  const questions = [
    // Question 1: Multiple choice
    new Question({
      quizId: quiz._id,
      questionText: 'Hvilken programvare er mest populær for å kjøre virtuelle maskiner på en Windows-PC?',
      questionType: 'multiple-choice',
      timeLimit: 20,
      points: 10,
      options: [
        { text: 'VMware Workstation', isCorrect: false },
        { text: 'VirtualBox', isCorrect: true },
        { text: 'Hyper-V', isCorrect: false },
        { text: 'Docker', isCorrect: false }
      ],
      explanation: 'Oracle VirtualBox er en populær og gratis løsning for virtuelle maskiner på Windows, macOS og Linux.'
    }),
    
    // Question 2: True/False
    new Question({
      quizId: quiz._id,
      questionText: 'Ubuntu er en Windows-basert operativsystem.',
      questionType: 'true-false',
      timeLimit: 15,
      points: 5,
      options: [
        { text: 'Sant', isCorrect: false },
        { text: 'Usant', isCorrect: true }
      ],
      explanation: 'Ubuntu er en Linux-distribusjon, ikke Windows-basert. Det er utviklet av Canonical og basert på Debian.'
    }),
    
    // Question 3: Multiple choice
    new Question({
      quizId: quiz._id,
      questionText: 'Hvor mye diskplass anbefales minimum for en standard Ubuntu-installasjon?',
      questionType: 'multiple-choice',
      timeLimit: 20,
      points: 10,
      options: [
        { text: '2 GB', isCorrect: false },
        { text: '10 GB', isCorrect: false },
        { text: '25 GB', isCorrect: true },
        { text: '50 GB', isCorrect: false }
      ],
      explanation: 'Ubuntu anbefaler minst 25 GB diskplass for en standard installasjon, selv om det teknisk kan installeres på mindre.'
    }),
    
    // Question 4: Fill in blank
    new Question({
      quizId: quiz._id,
      questionText: 'Kommandoen for å oppdatere pakkelisten i Ubuntu er sudo apt ____.',
      questionType: 'fill-in-blank',
      timeLimit: 20,
      points: 15,
      correctAnswer: 'update',
      explanation: 'sudo apt update oppdaterer pakkelisten og forteller systemet hvilke pakker som har oppdateringer tilgjengelig.'
    }),
    
    // Question 5: Multiple choice
    new Question({
      quizId: quiz._id,
      questionText: 'Hvilken fil redigerer du for å konfigurere nettverksinnstillinger i nyere Ubuntu-versjoner?',
      questionType: 'multiple-choice',
      timeLimit: 25,
      points: 15,
      options: [
        { text: '/etc/network/interfaces', isCorrect: false },
        { text: '/etc/netplan/*.yaml', isCorrect: true },
        { text: '/etc/hosts', isCorrect: false },
        { text: '/etc/resolv.conf', isCorrect: false }
      ],
      explanation: 'Nyere Ubuntu-versjoner bruker Netplan for nettverkskonfigurering, med YAML-filer i /etc/netplan/ katalogen.'
    }),
    
    // Question 6: Matching
    new Question({
      quizId: quiz._id,
      questionText: 'Match Ubuntu kommandoer med deres funksjon:',
      questionType: 'matching',
      timeLimit: 30,
      points: 20,
      matchingPairs: [
        { left: 'apt install', right: 'Installerer programvare' },
        { left: 'ufw enable', right: 'Aktiverer brannmuren' },
        { left: 'systemctl restart', right: 'Starter en tjeneste på nytt' },
        { left: 'passwd', right: 'Endrer passord' },
        { left: 'df -h', right: 'Viser diskbruk' }
      ],
      explanation: 'Disse Linux-kommandoene er grunnleggende for administrasjon av en Ubuntu-server eller VM.'
    }),
    
    // Question 7: Multiple choice
    new Question({
      quizId: quiz._id,
      questionText: 'Hva er standard brukernavn for SSH-tilkobling til en nyinstallert Ubuntu VM?',
      questionType: 'multiple-choice',
      timeLimit: 20,
      points: 10,
      options: [
        { text: 'admin', isCorrect: false },
        { text: 'root', isCorrect: false },
        { text: 'ubuntu', isCorrect: true },
        { text: 'user', isCorrect: false }
      ],
      explanation: 'Standardbrukernavnet på Ubuntu Cloud-images og mange VM-installasjoner er "ubuntu".'
    }),
    
    // Question 8: Fill in blank
    new Question({
      quizId: quiz._id,
      questionText: 'For å gi en bruker sudo-rettigheter i Ubuntu, må du legge brukeren til i ____ gruppen.',
      questionType: 'fill-in-blank',
      timeLimit: 20,
      points: 15,
      correctAnswer: 'sudo',
      explanation: 'Brukere som skal ha administratorrettigheter i Ubuntu legges til i "sudo"-gruppen.'
    })
  ];
  
  // Save questions and add them to the quiz
  for (const question of questions) {
    await question.save();
    quiz.questions.push(question._id);
  }
  
  // Update the quiz with question references
  await quiz.save();
  
  console.log('Ubuntu VM Quiz created');
  return quiz;
}

async function createCustomerSupportQuiz(userId) {
  // Create the quiz
  const quiz = new Quiz({
    title: 'Kundeservice Grunnleggende',
    description: 'Test din kunnskap om god kundeservice og effektiv problemløsning for kunder.',
    category: 'Annet',
    difficulty: 'Lett',
    createdBy: userId,
    isPublic: true,
    questions: []
  });
  
  // Save the quiz to get its ID
  await quiz.save();
  
  // Create questions
  const questions = [
    // Question 1: Multiple choice
    new Question({
      quizId: quiz._id,
      questionText: 'Hva er den viktigste egenskapen for god kundeservice?',
      questionType: 'multiple-choice',
      timeLimit: 20,
      points: 10,
      options: [
        { text: 'Rask responstid', isCorrect: false },
        { text: 'Teknisk kunnskap', isCorrect: false },
        { text: 'Aktiv lytting', isCorrect: true },
        { text: 'Problemløsningshastighet', isCorrect: false }
      ],
      explanation: 'Aktiv lytting er grunnleggende for å forstå kundens problem og behov korrekt.'
    }),
    
    // Question 2: True/False
    new Question({
      quizId: quiz._id,
      questionText: 'Det er best å unngå å si "unnskyld" til kunder for å ikke innrømme feil.',
      questionType: 'true-false',
      timeLimit: 15,
      points: 5,
      options: [
        { text: 'Sant', isCorrect: false },
        { text: 'Usant', isCorrect: true }
      ],
      explanation: 'Å si unnskyld ved feil eller misforståelser er viktig for å bygge tillit og vise ansvarlighet overfor kunder.'
    }),
    
    // Question 3: Multiple choice
    new Question({
      quizId: quiz._id,
      questionText: 'Når en kunde er frustrert, hva bør du gjøre først?',
      questionType: 'multiple-choice',
      timeLimit: 20,
      points: 10,
      options: [
        { text: 'Forklare hvorfor situasjonen oppstod', isCorrect: false },
        { text: 'La dem få utløp for frustrasjonen og lytte', isCorrect: true },
        { text: 'Overføre samtalen til en leder', isCorrect: false },
        { text: 'Tilby umiddelbar kompensasjon', isCorrect: false }
      ],
      explanation: 'Det er viktig å la kunden uttrykke sin frustrasjon og føle seg hørt før du prøver å løse problemet.'
    }),
    
    // Question 4: Fill in blank
    new Question({
      quizId: quiz._id,
      questionText: 'Teknikken der man gjentar kundens problem for å vise forståelse kalles _____.',
      questionType: 'fill-in-blank',
      timeLimit: 20,
      points: 15,
      correctAnswer: 'parafrasering',
      explanation: 'Parafrasering innebærer å gjenta kundens problem med dine egne ord for å bekrefte at du har forstått problemet riktig.'
    }),
    
    // Question 5: Multiple choice
    new Question({
      quizId: quiz._id,
      questionText: 'Hvilken metode er mest effektiv for å håndtere gjentatte klager på samme problem?',
      questionType: 'multiple-choice',
      timeLimit: 25,
      points: 15,
      options: [
        { text: 'Overse klagene da kunden sannsynligvis overdriver', isCorrect: false },
        { text: 'Håndtere hver klage individuelt', isCorrect: false },
        { text: 'Dokumentere mønsteret og eskalere til produktutviklingsteamet', isCorrect: true },
        { text: 'Forklare kunden at dette er en kjent begrensning', isCorrect: false }
      ],
      explanation: 'Systematisk dokumentasjon og eskalering av gjentatte problemer er viktig for å adressere underliggende årsaker.'
    }),
    
    // Question 6: Matching
    new Question({
      quizId: quiz._id,
      questionText: 'Match kundetyper med den beste tilnærmingen:',
      questionType: 'matching',
      timeLimit: 30,
      points: 20,
      matchingPairs: [
        { left: 'Detaljorientert kunde', right: 'Gi spesifikk og grundig informasjon' },
        { left: 'Utålmodig kunde', right: 'Gå direkte til poenget og løsningen' },
        { left: 'Forvirret kunde', right: 'Bruk enkelt språk og bekreft forståelse' },
        { left: 'Teknisk kompetent kunde', right: 'Bruk fagterminologi og detaljer' },
        { left: 'Misfornøyd kunde', right: 'Vis empati og fokuser på løsninger' }
      ],
      explanation: 'Tilpasning av kommunikasjonsstil til kundetypen forbedrer kundeopplevelsen betydelig.'
    }),
    
    // Question 7: Multiple choice
    new Question({
      quizId: quiz._id,
      questionText: 'Hva er beste praksis når du må sette en kunde på vent i telefonen?',
      questionType: 'multiple-choice',
      timeLimit: 20,
      points: 10,
      options: [
        { text: 'Sette dem på vent umiddelbart for å spare tid', isCorrect: false },
        { text: 'Si at du kommer tilbake "snart"', isCorrect: false },
        { text: 'Forklare hvorfor du setter dem på vent og anslå ventetid', isCorrect: true },
        { text: 'Spørre om de heller vil ha en tilbakeringing', isCorrect: false }
      ],
      explanation: 'Det er viktig å gi kunden en forklaring og en tidsindikasjon før du setter dem på vent for å redusere frustrasjon.'
    }),
    
    // Question 8: True/False
    new Question({
      quizId: quiz._id,
      questionText: 'Å løse kundens problem raskt er viktigere enn å sikre at løsningen er den rette.',
      questionType: 'true-false',
      timeLimit: 15,
      points: 10,
      options: [
        { text: 'Sant', isCorrect: false },
        { text: 'Usant', isCorrect: true }
      ],
      explanation: 'Selv om hastighet er viktig, er det viktigere å sikre at løsningen faktisk adresserer kundens problem korrekt og fullstendig.'
    })
  ];
  
  // Save questions and add them to the quiz
  for (const question of questions) {
    await question.save();
    quiz.questions.push(question._id);
  }
  
  // Update the quiz with question references
  await quiz.save();
  
  console.log('Customer Support Quiz created');
  return quiz;
}