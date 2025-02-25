// app/(routes)/apply-for-higher-limits/page.tsx

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ApplyForHigherLimits() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    currentUsage: '',
    requestedLimit: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate form submission
    try {
      const response = await fetch('/api/apply-for-higher-limits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      toast.success('Form submitted successfully!', {
        description: 'Our team will review your request and get back to you shortly.',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        currentUsage: '',
        requestedLimit: '',
        message: '',
      });
    } catch (error) {
        console.log(error)
      toast.error('Failed to submit form', {
        description: 'Please try again or contact support.',
      });
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Apply for Higher Rate Limits</h1>
      <Card className="p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Company</label>
            <Input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Current Usage</label>
            <Input
              type="text"
              name="currentUsage"
              value={formData.currentUsage}
              onChange={handleChange}
              placeholder="e.g., 500 requests/day"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Requested Limit</label>
            <Input
              type="text"
              name="requestedLimit"
              value={formData.requestedLimit}
              onChange={handleChange}
              placeholder="e.g., 5000 requests/day"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              rows={4}
              placeholder="Tell us more about your use case..."
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Submit Request
          </Button>
        </form>
      </Card>
    </div>
  );
}