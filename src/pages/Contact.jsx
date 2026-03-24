import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Send, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ContactMessage } from '@/api/supabaseClient';
import { useMutation } from '@tanstack/react-query';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const sendEmailMutation = useMutation({
    mutationFn: async (data) => {
      await ContactMessage.create({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Message sent successfully!');
    },
    onError: () => {
      toast.error('Failed to send message. Please try again.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    sendEmailMutation.mutate(formData);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-12">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Message Sent!</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for reaching out. We'll get back to you as soon as possible.
            </p>
            <Button onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}>
              Send Another Message
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Contact Us</h1>
          <p className="text-muted-foreground">
            Have questions about CoSolar? We'd love to hear from you.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="How can we help?"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Tell us more about your inquiry..."
                  className="bg-background min-h-[150px]"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={sendEmailMutation.isPending}
              >
                {sendEmailMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">Email Us</div>
                <div className="text-sm text-muted-foreground">hello@cosolar.africa</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}