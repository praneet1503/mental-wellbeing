'use client';

import { useState } from 'react';
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { 
  Brain, 
  Wind, 
  Quote, 
  Activity, 
  Smile, 
  Meh, 
  Frown, 
  Heart, 
  BookOpen, 
  Users,
  Menu
} from 'lucide-react';

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

export default function Home() {
    const [quote, setQuote] = useState(quotes[0]);
    const [fadeQuote, setFadeQuote] = useState(true);
    
    // Breathing state
    const [breathingText, setBreathingText] = useState('Click to Start');
    const [isBreathing, setIsBreathing] = useState(false);
    const [breathingPhase, setBreathingPhase] = useState('idle'); // idle, inhale, hold, exhale

    // Mood state
    const [moodData, setMoodData] = useState(null);

    // Quote function
    const getNewQuote = () => {
        setFadeQuote(false);
        setTimeout(() => {
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            setQuote(randomQuote);
            setFadeQuote(true);
        }, 300);
    };

    // Breathing function
    const startBreathing = () => {
        if (isBreathing) return;

        setIsBreathing(true);
        let cycle = 0;
        const maxCycles = 3;

        const breatheCycle = () => {
            if (cycle >= maxCycles) {
                setBreathingText('Complete! ✨');
                setBreathingPhase('idle');
                setIsBreathing(false);
                setTimeout(() => {
                    setBreathingText('Click to Start');
                }, 2000);
                return;
            }

            // Breathe in
            setBreathingText('Breathe In... 💨');
            setBreathingPhase('inhale');
            
            setTimeout(() => {
                // Hold
                setBreathingText('Hold... ⏸️');
                setBreathingPhase('hold');
                
                setTimeout(() => {
                    // Breathe out
                    setBreathingText('Breathe Out... 🌬️');
                    setBreathingPhase('exhale');
                    
                    setTimeout(() => {
                        cycle++;
                        breatheCycle();
                    }, 4000);
                }, 2000);
            }, 4000);
        };

        breatheCycle();
    };

    // Smooth scroll
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Mood function
    const selectMood = (mood) => {
        let message = '';
        let emoji = null;
        
        switch(mood) {
            case 'great':
                message = "That's wonderful! Keep spreading that positive energy! ✨";
                emoji = <Smile className="w-12 h-12 text-green-500" />;
                break;
            case 'good':
                message = "Great to hear! Remember to cherish these good moments. 🌟";
                emoji = <Smile className="w-12 h-12 text-blue-500" />;
                break;
            case 'okay':
                message = "It's okay to feel just okay. Take it one step at a time. 💙";
                emoji = <Meh className="w-12 h-12 text-yellow-500" />;
                break;
            case 'bad':
                message = "I'm sorry you're feeling this way. Remember, it's okay to reach out for support. 🤗";
                emoji = <Frown className="w-12 h-12 text-orange-500" />;
                break;
            case 'terrible':
                message = "Please remember you're not alone. Consider talking to a friend, family member, or mental health professional. 💜";
                emoji = <Frown className="w-12 h-12 text-red-500" />;
                break;
        }

        setMoodData({ message, emoji });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                            Mental Wellbeing
                        </span>
                    </div>
                    <nav className="hidden md:flex gap-6">
                        <Button variant="ghost" onClick={() => scrollToSection('home')}>Home</Button>
                        <Button variant="ghost" onClick={() => scrollToSection('features')}>Features</Button>
                        <Button variant="ghost" onClick={() => scrollToSection('mood-tracker')}>Mood Tracker</Button>
                        <Button variant="ghost" onClick={() => scrollToSection('resources')}>Resources</Button>
                    </nav>
                     {/* Mobile Menu Button - simplified */}
                     <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu />
                     </Button>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section id="home" className="py-20 md:py-32 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
                            Take Care of Your <span className="text-primary">Mental Health</span>
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                            Your journey to better mental wellbeing starts here. Discover tools and resources to help you thrive.
                        </p>
                        <Button size="lg" className="rounded-full text-lg px-8 shadow-lg hover:shadow-xl transition-all" onClick={() => scrollToSection('mood-tracker')}>
                            Start Your Journey
                        </Button>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 bg-white dark:bg-slate-950">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12">How We Can Help</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="hover:shadow-lg transition-shadow border-slate-200">
                                <CardHeader>
                                    <Wind className="w-10 h-10 text-blue-500 mb-2" />
                                    <CardTitle>Meditation</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    Guided breathing sessions to help you find inner peace and reduce stress.
                                </CardContent>
                            </Card>
                            <Card className="hover:shadow-lg transition-shadow border-slate-200">
                                <CardHeader>
                                    <Activity className="w-10 h-10 text-green-500 mb-2" />
                                    <CardTitle>Mood Tracking</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    Track emotions to understand patterns in your health and emotional state.
                                </CardContent>
                            </Card>
                            <Card className="hover:shadow-lg transition-shadow border-slate-200">
                                <CardHeader>
                                    <Users className="w-10 h-10 text-purple-500 mb-2" />
                                    <CardTitle>Community</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    Connect with others on similar journeys and share your experiences.
                                </CardContent>
                            </Card>
                            <Card className="hover:shadow-lg transition-shadow border-slate-200">
                                <CardHeader>
                                    <BookOpen className="w-10 h-10 text-orange-500 mb-2" />
                                    <CardTitle>Resources</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    Learn about mental health topics and strategies with curated guides.
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Breathing Exercise Section */}
                <section className="py-20 bg-slate-50 dark:bg-slate-900">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold mb-12">Take a Moment to Breathe</h2>
                        <div className="flex flex-col items-center justify-center">
                            <div 
                                onClick={startBreathing}
                                className={`
                                    w-64 h-64 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 
                                    flex items-center justify-center cursor-pointer shadow-xl mb-12
                                    transition-all duration-[4000ms] ease-in-out
                                    ${breathingPhase === 'inhale' ? 'scale-125 bg-blue-300' : 
                                      breathingPhase === 'exhale' ? 'scale-90 bg-purple-300' : 'scale-100'}
                                    hover:shadow-2xl hover:scale-105 active:scale-95
                                `}
                            >
                                <span className="text-xl font-medium text-slate-700 animate-pulse">{breathingText}</span>
                            </div>
                            <Button onClick={startBreathing} disabled={isBreathing} size="lg" className="rounded-full w-48">
                                {isBreathing ? 'In Progress...' : 'Start Exercise'}
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Daily Quote Section */}
                <section className="py-20 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900">
                    <div className="container mx-auto px-4 text-center max-w-3xl">
                        <Quote className="w-16 h-16 text-primary/20 mx-auto mb-6" />
                        <div className={`transition-all duration-500 transform ${fadeQuote ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            <blockquote className="text-2xl md:text-3xl font-serif text-slate-800 dark:text-slate-100 mb-6 italic leading-relaxed">
                                "{quote.text}"
                            </blockquote>
                            <cite className="text-lg text-slate-600 dark:text-slate-400 block mb-10 font-medium">
                                — {quote.author}
                            </cite>
                        </div>
                        <Button variant="secondary" onClick={getNewQuote} className="hover:bg-white">New Quote</Button>
                    </div>
                </section>

                {/* Mood Tracker Section */}
                <section id="mood-tracker" className="py-20 bg-white dark:bg-slate-950">
                    <div className="container mx-auto px-4 text-center max-w-4xl">
                        <h2 className="text-3xl font-bold mb-4">How Are You Feeling Today?</h2>
                        <p className="text-slate-500 mb-12">Select the emoji that best represents your current mood.</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                            {[
                                { id: 'great', label: 'Great', icon: Smile, color: 'text-green-500', bg: 'bg-green-50' },
                                { id: 'good', label: 'Good', icon: Smile, color: 'text-blue-500', bg: 'bg-blue-50' },
                                { id: 'okay', label: 'Okay', icon: Meh, color: 'text-yellow-500', bg: 'bg-yellow-50' },
                                { id: 'bad', label: 'Not Good', icon: Frown, color: 'text-orange-500', bg: 'bg-orange-50' },
                                { id: 'terrible', label: 'Terrible', icon: Frown, color: 'text-red-500', bg: 'bg-red-50' }
                            ].map((mood) => (
                                <Card 
                                    key={mood.id} 
                                    className={`
                                        cursor-pointer hover:border-primary hover:shadow-md transition-all 
                                        flex flex-col items-center justify-center p-6 gap-3 group
                                        hover:-translate-y-1
                                    `}
                                    onClick={() => selectMood(mood.id)}
                                >
                                    <div className={`p-3 rounded-full ${mood.bg} group-hover:scale-110 transition-transform`}>
                                        <mood.icon className={`w-8 h-8 ${mood.color}`} />
                                    </div>
                                    <span className="font-medium text-slate-700">{mood.label}</span>
                                </Card>
                            ))}
                        </div>
                        
                        {moodData && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
                                <Card className="bg-slate-50 border-slate-200">
                                    <CardContent className="p-8 flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
                                        <div className="p-4 bg-white rounded-full shadow-sm">
                                            {moodData.emoji}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold mb-2">Message for you</h3>
                                            <p className="text-lg text-slate-600 font-medium">{moodData.message}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer id="resources" className="py-12 bg-slate-900 text-slate-300">
                     <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:text-left text-center">
                            <div>
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                                    <Brain className="h-6 w-6 text-primary-foreground" />
                                    <span className="text-xl font-bold text-white">Mental Wellbeing</span>
                                </div>
                                <p className="text-sm">Dedication to improving mental health awareness and providing accessible tools for everyone.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-4">Quick Links</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><button onClick={() => scrollToSection('home')} className="hover:text-white transition-colors">Home</button></li>
                                    <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                                    <li><button onClick={() => scrollToSection('mood-tracker')} className="hover:text-white transition-colors">Mood Tracker</button></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-4">Emergency</h4>
                                <p className="text-sm mb-2">If you are in crisis, please call your local emergency number immediately.</p>
                                <p className="text-sm font-bold text-white">Helpline: 988</p>
                            </div>
                        </div>
                        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
                            <p>© 2026 Mental Wellbeing. All rights reserved.</p>
                        </div>
                     </div>
                </footer>
            </main>
        </div>
    );
}
