// Inspirational quotes for mental wellbeing
const quotes = [
    {
        text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
        author: "Nelson Mandela"
    },
    {
        text: "You are not your illness. You have an individual story to tell. You have a name, a history, a personality. Staying yourself is part of the battle.",
        author: "Julian Seifter"
    },
    {
        text: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.",
        author: "Noam Shpancer"
    },
    {
        text: "There is hope, even when your brain tells you there isn't.",
        author: "John Green"
    },
    {
        text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared and anxious. Having feelings doesn't make you a negative person. It makes you human.",
        author: "Lori Deschene"
    },
    {
        text: "Self-care is how you take your power back.",
        author: "Lalah Delia"
    },
    {
        text: "It's okay to not be okay as long as you are not giving up.",
        author: "Karen Salmansohn"
    },
    {
        text: "You are stronger than you think, braver than you believe, and loved more than you know.",
        author: "Unknown"
    },
    {
        text: "Healing takes time, and asking for help is a courageous step.",
        author: "Mariska Hargitay"
    },
    {
        text: "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.",
        author: "Unknown"
    }
];

// Smooth scroll function
function scrollToMoodTracker() {
    const moodSection = document.getElementById('mood-tracker');
    moodSection.scrollIntoView({ behavior: 'smooth' });
}

// Get new quote function
function getNewQuote() {
    const quoteText = document.getElementById('quoteText');
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    
    // Add fade effect
    quoteText.style.opacity = '0';
    
    setTimeout(() => {
        quoteText.textContent = `"${randomQuote.text}"`;
        document.querySelector('.quote-author').textContent = `- ${randomQuote.author}`;
        quoteText.style.opacity = '1';
    }, 300);
}

// Breathing exercise function
let breathingActive = false;

function startBreathing() {
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    
    if (breathingActive) {
        text.textContent = 'Exercise in progress...';
        setTimeout(() => {
            if (!breathingActive) {
                text.textContent = 'Click to Start';
            }
        }, 2000);
        return;
    }
    
    breathingActive = true;
    let cycle = 0;
    const maxCycles = 3;
    
    function breatheCycle() {
        if (cycle >= maxCycles) {
            text.textContent = 'Complete! ✨';
            circle.classList.remove('expand', 'contract');
            breathingActive = false;
            setTimeout(() => {
                text.textContent = 'Click to Start';
            }, 2000);
            return;
        }
        
        // Breathe in
        text.textContent = 'Breathe In... 💨';
        circle.classList.add('expand');
        circle.classList.remove('contract');
        
        setTimeout(() => {
            // Hold
            text.textContent = 'Hold... ⏸️';
            
            setTimeout(() => {
                // Breathe out
                text.textContent = 'Breathe Out... 🌬️';
                circle.classList.remove('expand');
                circle.classList.add('contract');
                
                setTimeout(() => {
                    cycle++;
                    breatheCycle();
                }, 4000);
            }, 2000);
        }, 4000);
    }
    
    breatheCycle();
}

// Mood tracker function
function selectMood(mood) {
    const moodMessage = document.getElementById('moodMessage');
    let message = '';
    let emoji = '';
    
    switch(mood) {
        case 'great':
            message = "That's wonderful! Keep spreading that positive energy! ✨";
            emoji = '😄';
            break;
        case 'good':
            message = "Great to hear! Remember to cherish these good moments. 🌟";
            emoji = '🙂';
            break;
        case 'okay':
            message = "It's okay to feel just okay. Take it one step at a time. 💙";
            emoji = '😐';
            break;
        case 'bad':
            message = "I'm sorry you're feeling this way. Remember, it's okay to reach out for support. 🤗";
            emoji = '😕';
            break;
        case 'terrible':
            message = "Please remember you're not alone. Consider talking to a friend, family member, or mental health professional. 💜";
            emoji = '😢';
            break;
    }
    
    // Add animation
    moodMessage.style.opacity = '0';
    moodMessage.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        moodMessage.innerHTML = `<span style="font-size: 2rem; margin-right: 1rem;">${emoji}</span> ${message}`;
        moodMessage.style.opacity = '1';
        moodMessage.style.transform = 'translateY(0)';
    }, 300);
    
    // Store mood (in a real app, this would be saved to a database)
    console.log(`Mood tracked: ${mood} at ${new Date().toLocaleString()}`);
}

// Add transition styles for quote
document.addEventListener('DOMContentLoaded', () => {
    const quoteText = document.getElementById('quoteText');
    if (quoteText) {
        quoteText.style.transition = 'opacity 0.3s ease-in-out';
    }
    
    const moodMessage = document.getElementById('moodMessage');
    if (moodMessage) {
        moodMessage.style.transition = 'all 0.3s ease-in-out';
    }
});

// Add click event to breathing circle
document.addEventListener('DOMContentLoaded', () => {
    const breathingCircle = document.getElementById('breathingCircle');
    if (breathingCircle) {
        breathingCircle.addEventListener('click', startBreathing);
        breathingCircle.style.cursor = 'pointer';
    }
});
