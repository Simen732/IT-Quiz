// Client-side JavaScript
document.addEventListener('DOMContentLoaded', () => {
  console.log('Web application template loaded');
  
  // Add any client-side functionality here
});

// Add interactive elements and animations

// Helper function for adding ripple effect to buttons
function createRipple(event) {
  const button = event.currentTarget;
  
  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
  circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
  circle.classList.add("ripple");
  
  const ripple = button.querySelector(".ripple");
  
  if (ripple) {
    ripple.remove();
  }
  
  button.appendChild(circle);
}

// Apply ripple effect to buttons
document.addEventListener('DOMContentLoaded', function() {
  // Apply ripple effect to all buttons
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('click', createRipple);
  });
  
  // Add hover glow effect to cards
  const addGlowEffect = () => {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
      // Create glow element
      const glow = document.createElement('div');
      glow.classList.add('card-glow');
      card.appendChild(glow);
      
      // Track mouse movement
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        glow.style.background = `radial-gradient(circle at ${x}px ${y}px, 
                                 rgba(105, 50, 255, 0.4) 0%, 
                                 rgba(0, 212, 255, 0.2) 30%, 
                                 transparent 70%)`;
      });
      
      // Remove glow effect when not hovering
      card.addEventListener('mouseleave', () => {
        glow.style.background = 'transparent';
      });
    });
  };
  
  // Run the function
  addGlowEffect();
  
  // Add scroll animations
  const animateOnScroll = () => {
    const elements = document.querySelectorAll('.card, .btn-primary, h1, h2');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });
    
    elements.forEach(element => {
      observer.observe(element);
    });
  };
  
  animateOnScroll();
  
  // Add counters with animation for numbers
  const animateCounters = () => {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      const duration = 1500;
      const step = target / (duration / 16);
      let current = 0;
      
      const updateCounter = () => {
        current += step;
        if (current < target) {
          counter.textContent = Math.floor(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      };
      
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          updateCounter();
          observer.unobserve(counter);
        }
      });
      
      observer.observe(counter);
    });
  };
  
  animateCounters();
  
  // Celebration effects
  function showCelebration() {
    // Create confetti effect
    const colors = ['#9013FE', '#FF2D55', '#FF9500', '#32D74B', '#00e5ff'];
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.classList.add('confetti-piece');
      
      // Random position and animation
      const size = Math.random() * 10 + 5;
      const posX = Math.random() * 100;
      const delay = Math.random() * 3;
      const duration = Math.random() * 3 + 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      confetti.style.width = `${size}px`;
      confetti.style.height = `${size}px`;
      confetti.style.left = `${posX}%`;
      confetti.style.backgroundColor = color;
      confetti.style.animationDelay = `${delay}s`;
      confetti.style.animationDuration = `${duration}s`;
      
      document.body.appendChild(confetti);
      
      // Remove after animation ends
      setTimeout(() => {
        confetti.remove();
      }, (delay + duration) * 1000);
    }
    
    // Show celebratory message
    const messageEl = document.createElement('div');
    messageEl.classList.add('celebration-message');
    messageEl.innerHTML = '<h2>Fantastisk!</h2><p>Du har fullført quizen!</p>';
    messageEl.style.position = 'fixed';
    messageEl.style.top = '40%';
    messageEl.style.left = '50%';
    messageEl.style.transform = 'translate(-50%, -50%)';
    messageEl.style.background = 'rgba(17, 17, 34, 0.8)';
    messageEl.style.backdropFilter = 'blur(10px)';
    messageEl.style.padding = '2rem';
    messageEl.style.borderRadius = '1rem';
    messageEl.style.boxShadow = '0 0 30px rgba(0, 229, 255, 0.4)';
    messageEl.style.zIndex = '1000';
    messageEl.style.textAlign = 'center';
    messageEl.style.animation = 'fadeIn 1s ease forwards';
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      messageEl.style.animation = 'fadeOut 1s ease forwards';
      setTimeout(() => {
        messageEl.remove();
      }, 1000);
    }, 3000);
  }
  
  // Call this when a quiz is completed
  const quizCompletionButtons = document.querySelectorAll('.quiz-complete-btn');
  
  if (quizCompletionButtons.length) {
    quizCompletionButtons.forEach(button => {
      button.addEventListener('click', showCelebration);
    });
  }
});
