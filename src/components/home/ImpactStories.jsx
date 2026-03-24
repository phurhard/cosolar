import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Quote, MapPin } from 'lucide-react';

const testimonials = [
  {
    quote: "Before solar, we closed at 6 PM. Now we work until 10 PM and tripled our income.",
    author: "Amara Okafor",
    role: "Tailor, Lagos",
    location: "Nigeria",
    impact: "5 kVA System"
  },
  {
    quote: "Our students can now study at night. Solar didn't just give us power—it gave us hope.",
    author: "Dr. Kamau Mwangi",
    role: "School Principal, Nairobi",
    location: "Kenya",
    impact: "25 kVA System"
  },
  {
    quote: "CoSolar helped us prove our track record. Now investors want to talk. This platform changed our business.",
    author: "Kwame Asante",
    role: "Solar Installer, Accra",
    location: "Ghana",
    impact: "620 kVA Installed"
  }
];

export default function ImpactStories() {
  return (
    <section className="py-20 bg-gradient-to-br from-card to-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Real People. Real Impact.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Behind every kilowatt is a story of transformation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="bg-card border-border h-full hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <Quote className="w-8 h-8 text-primary/30 mb-4" />
                  <p className="text-foreground text-lg mb-6 leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        {testimonial.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-primary">
                        {testimonial.impact}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}