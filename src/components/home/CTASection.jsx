import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, UserPlus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CTASection() {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Join Africa's Solar Movement
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether you're a seasoned installer or just starting out, 
              CoSolar helps you track your impact and connect with the ecosystem.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('InstallerSignup')}>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-xl">
                  <UserPlus className="mr-2 w-5 h-5" />
                  Register as Installer
                </Button>
              </Link>
              <Link to={createPageUrl('SubmitInstallation')}>
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 px-8 py-6 text-lg rounded-xl">
                  <FileText className="mr-2 w-5 h-5" />
                  Submit Installation
                </Button>
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Questions? <Link to={createPageUrl('Contact')} className="text-primary hover:underline">Contact us</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}