import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, MessageSquare, Shield, Zap } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight"
          >
            Chat with your <br />
            <span className="gradient-text">PDF Documents</span> with AI
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl opacity-70 max-w-2xl mx-auto mb-10"
          >
            Upload multiple PDFs, ask questions, and get instant answers powered by advanced RAG technology. 
            Isolated environments for every user.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link 
              to="/register" 
              className="px-8 py-4 bg-primary hover:bg-primary/80 rounded-xl text-lg font-semibold transition-all shadow-xl shadow-primary/30 inline-block"
            >
              Get Started for Free
            </Link>
          </motion.div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          <FeatureCard 
            icon={<FileText className="text-primary" />}
            title="Multi-PDF Support"
            description="Upload and process multiple PDF files simultaneously for comprehensive context."
          />
          <FeatureCard 
            icon={<MessageSquare className="text-secondary" />}
            title="Smart Chat"
            description="Intuitive AI agent that remembers your conversation history within each chat."
          />
          <FeatureCard 
            icon={<Zap className="text-accent" />}
            title="Fast Processing"
            description="High-speed vectorization and search for near-instant responses."
          />
          <FeatureCard 
            icon={<Shield className="text-green-500" />}
            title="Private & Secure"
            description="Your data and chats are strictly isolated and stored securely."
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="glass-card p-8 rounded-2xl border border-white/5 hover:border-white/20 transition-all group">
    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="opacity-60 text-sm leading-relaxed">{description}</p>
  </div>
);

export default Landing;
