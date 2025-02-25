// app/help/page.tsx
"use client";

import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Book, Users, FileQuestion, Phone } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Help() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 mt-20">
      <motion.div 
        className="container mx-auto py-16 px-4"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          variants={fadeIn}
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            How can we help?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions and learn how to make the most of oKLocation API
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
          variants={stagger}
        >
          {[
            {
              title: "Documentation",
              description: "Detailed guides and API references",
              icon: Book,
              href: "/documentation"
            },
            {
              title: "FAQs",
              description: "Answers to common questions",
              icon: FileQuestion,
              href: "faqs"
            },
            {
              title: "Community",
              description: "Join our developer community",
              icon: Users,
              href: "/community"
            }
          ].map((item ) => (
            <motion.div
              key={item.title}
              variants={fadeIn}
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <Link href={item.href}>
                <Card className="p-6 h-full hover:shadow-lg transition-shadow duration-300 relative overflow-hidden">
                  <div className="flex items-start gap-4">
                    <item.icon className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all duration-300 absolute right-4 top-1/2 -translate-y-1/2" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQs Section */}
        <motion.section 
          id="faqs"
          className="mb-16"
          variants={fadeIn}
        >
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <FileQuestion className="h-8 w-8 text-primary" />
              Frequently Asked Questions
            </h2>
            <motion.div 
              className="grid gap-6"
              variants={stagger}
            >
              {[
                {
                  q: "How do I get an API key?",
                  a: "Sign up on our platform and generate one from your dashboard. The process is simple and takes just a few minutes."
                },
                {
                  q: "What are the rate limits?",
                  a: "Free tier: 100 requests/day. Basic tier: 1000 requests/day. Need more? Contact us for custom enterprise plans."
                },
                // Add more FAQs...
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className="p-6 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-300"
                >
                  <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </motion.div>
              ))}
            </motion.div>
          </Card>
        </motion.section>

        {/* Contact Section */}
        <motion.section variants={fadeIn}>
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our support team is here to assist you with any questions or concerns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="mailto:support@oklocation.com"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  Email Support
                </Link>
                <Link 
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  Contact Us
                </Link>
              </div>
            </div>
          </Card>
        </motion.section>
      </motion.div>
    </div>
  );
}