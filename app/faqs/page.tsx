// app/faq/page.tsx
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Minus } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    question: "What is oKLocation?",
    answer: "oKLocation is a digital addressing system designed specifically for Ghana. It provides accurate location information using GPS coordinates and generates unique digital addresses that can be easily shared and integrated into applications.",
    category: "General"
  },
  {
    question: "How do I get an API key?",
    answer: "To get an API key, sign up for an account on our platform, navigate to the Dashboard, and click on 'Generate API Key'. You'll receive both an API key and secret that you can use to authenticate your requests.",
    category: "API Access"
  },
  {
    question: "What are the rate limits?",
    answer: "Free tier users get 100 requests per day, while basic tier users get 1,000 requests per day. Enterprise customers can receive custom rate limits based on their needs. You can monitor your usage in the dashboard.",
    category: "API Access"
  },
  {
    question: "How accurate are the generated addresses?",
    answer: "Our addresses are highly accurate as they combine GPS coordinates with OpenStreetMap data and Ghana Post's addressing system. The system provides detailed information including street names, districts, and postal codes.",
    category: "Technical"
  },
  {
    question: "Can I use oKLocation in my commercial application?",
    answer: "Yes, oKLocation can be used in both personal and commercial applications. Different pricing tiers are available based on your usage requirements. Check our pricing page for more details.",
    category: "Pricing"
  },
  {
    question: "How do I handle API errors?",
    answer: "The API uses standard HTTP status codes and returns detailed error messages. Common errors include rate limiting (429), authentication errors (401), and invalid parameters (400). Check our documentation for comprehensive error handling guides.",
    category: "Technical"
  },
  {
    question: "Is there a batch processing option?",
    answer: "Yes, you can process multiple coordinates in a single API call using our batch endpoint. This is more efficient for handling multiple locations at once.",
    category: "Technical"
  },
  {
    question: "How do I report issues?",
    answer: "You can report issues through our support portal, email us at support@oklocation.com, or open an issue in our GitHub repository. We typically respond within 24 hours.",
    category: "Support"
  }
];

const categories = Array.from(new Set(faqs.map(faq => faq.category)));

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 py-16 mt-20">
      <motion.div 
        className="container mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Find answers to common questions about oKLocation API
          </motion.p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-12 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search FAQs..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <motion.div 
          className="max-w-4xl mx-auto space-y-4"
          layout
        >
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <button
                  className="w-full text-left p-6 focus:outline-none"
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold pr-8">{faq.question}</h3>
                    {expandedIndex === index ? (
                      <Minus className="h-5 w-5 flex-shrink-0" />
                    ) : (
                      <Plus className="h-5 w-5 flex-shrink-0" />
                    )}
                  </div>
                  <motion.div
                    initial={false}
                    animate={{ height: expandedIndex === index ? "auto" : 0 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-4 text-muted-foreground">
                      {faq.answer}
                    </p>
                    <div className="mt-4 pt-4 border-t">
                      <span className="text-sm text-muted-foreground">
                        Category: {faq.category}
                      </span>
                    </div>
                  </motion.div>
                </button>
              </Card>
            </motion.div>
          ))}

          {filteredFaqs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">No FAQs found matching your criteria.</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}