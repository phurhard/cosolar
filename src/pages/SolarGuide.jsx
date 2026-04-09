import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from '@/components/ui/accordion';
import {
  Sun, Layers, Battery, Zap, Wrench, Shield, CheckCircle,
  ArrowRight, BookOpen, AlertTriangle, Lightbulb, Cable, Gauge
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const SYSTEM_COMPONENTS = [
  {
    icon: Layers,
    title: 'Solar Panels',
    description: 'Photovoltaic panels convert sunlight into DC electricity. Monocrystalline panels offer the best efficiency for African climates.',
    specs: ['Typical: 400W-550W per panel', 'Lifespan: 25+ years', 'Brands: Jinko, Canadian Solar, Longi, Trina'],
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Zap,
    title: 'Inverter',
    description: 'Converts DC power from panels/batteries to AC power for your appliances. Hybrid inverters handle both grid and solar input.',
    specs: ['Sizes: 3kVA, 5kVA, 8kVA, 10kVA+', 'Types: Hybrid, Off-grid, Grid-tied', 'Brands: Deye, Growatt, Victron, Sunsynk'],
    color: 'bg-chart-4/10 text-chart-4',
  },
  {
    icon: Battery,
    title: 'Battery Storage',
    description: 'Stores excess solar energy for use at night or during cloudy days. Lithium batteries (LiFePO4) offer the best cycle life.',
    specs: ['Types: LiFePO4, Lithium-ion, Lead-acid', 'Typical: 5kWh per unit', 'Cycle life: 6000+ cycles (LiFePO4)'],
    color: 'bg-chart-3/10 text-chart-3',
  },
  {
    icon: Gauge,
    title: 'Charge Controller',
    description: 'Regulates power from solar panels to batteries, preventing overcharging. MPPT controllers are more efficient than PWM.',
    specs: ['Types: MPPT (preferred), PWM', 'MPPT efficiency: 95-99%', 'Often built into hybrid inverters'],
    color: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    icon: Cable,
    title: 'Wiring & Protection',
    description: 'Proper gauge cables, MC4 connectors, circuit breakers, surge protectors, and earthing are critical for safety.',
    specs: ['DC cables: 4mm²–6mm² solar cable', 'AC cables: per load requirements', 'SPDs, MCBs, and proper earthing'],
    color: 'bg-orange-500/10 text-orange-500',
  },
  {
    icon: Wrench,
    title: 'Mounting Structure',
    description: 'Rooftop or ground-mount rails and brackets that hold panels at the optimal tilt angle for maximum sun exposure.',
    specs: ['Material: Anodized aluminum', 'Tilt: 5°-15° for most of Africa', 'Wind rated: 150 km/h+'],
    color: 'bg-slate-500/10 text-slate-500',
  },
];

const INSTALLATION_STEPS = [
  {
    step: 1,
    title: 'Site Assessment & Load Analysis',
    description: 'A certified installer inspects your roof or land, measures solar irradiance, and calculates your energy needs.',
    tips: ['Use our Load Calculator to estimate your daily kWh needs', 'Check for shading from trees or buildings', 'Ensure roof can support panel weight'],
  },
  {
    step: 2,
    title: 'System Design & Quotation',
    description: 'The installer designs a system matching your load, budget, and expansion goals, then provides a detailed quotation.',
    tips: ['Compare at least 3 quotes', 'Ask about warranty terms (panels: 25yr, inverter: 5-10yr)', 'Verify component brands and certifications'],
  },
  {
    step: 3,
    title: 'Procurement & Delivery',
    description: 'Components are sourced and delivered. Ensure all items match the quotation specifications.',
    tips: ['Verify serial numbers against warranty cards', 'Inspect panels for micro-cracks', 'Confirm battery capacity matches spec'],
  },
  {
    step: 4,
    title: 'Mounting & Panel Installation',
    description: 'Mounting rails are secured to the roof/ground, then panels are attached, wired in series or parallel as designed.',
    tips: ['Panels should face true south (in Northern Africa) or north (Southern Africa)', 'Maintain proper spacing for airflow', 'Use MC4 connectors, never splice solar cables'],
  },
  {
    step: 5,
    title: 'Electrical Wiring & Inverter Setup',
    description: 'DC and AC wiring is installed, the inverter is mounted (in a cool, ventilated area), batteries connected, and the changeover configured.',
    tips: ['Install in a well-ventilated battery room', 'Label all breakers and cables', 'Use dedicated DC breakers between panels and inverter'],
  },
  {
    step: 6,
    title: 'Testing & Commissioning',
    description: 'The system is powered on, tested under load, and all safety checks are completed. The installer provides user training.',
    tips: ['Test during peak sun hours', 'Verify battery charging and discharging behavior', 'Ask for a commissioning report and user manual'],
  },
];

const FAQS = [
  {
    question: 'How much does a solar system cost in Nigeria?',
    answer: 'A typical 5kVA system with lithium batteries costs between ₦3.5M - ₦6M depending on component quality and brand. Prices vary by state and installer. Use our Cost-Benefit Analysis tool for a personalized estimate.',
  },
  {
    question: 'How long do solar panels last?',
    answer: 'Quality solar panels come with a 25-year performance warranty and can produce electricity for 30+ years. Most panels degrade at about 0.5% per year, meaning after 25 years they still produce ~87% of their original output.',
  },
  {
    question: 'Can solar power my air conditioner?',
    answer: 'Yes, but ACs consume significant power (1,000-2,000W). A 5kVA system can handle 1-2 ACs alongside other loads. Inverter ACs are 40-60% more efficient than conventional ones and are recommended for solar setups.',
  },
  {
    question: 'What happens during rainy/cloudy days?',
    answer: 'Solar panels still produce power on cloudy days (about 20-40% of peak output). Your battery bank provides stored energy, and hybrid systems can switch to grid power automatically when needed.',
  },
  {
    question: 'Do I need to maintain my solar system?',
    answer: 'Solar systems require minimal maintenance. Clean panels quarterly (or after dusty harmattan season), check battery connections annually, and keep the inverter area ventilated. No moving parts means very low maintenance costs.',
  },
  {
    question: 'Can I expand my solar system later?',
    answer: 'Yes! Hybrid inverters support expansion. You can add more panels, batteries, or even a second inverter. Plan your initial wiring and mounting to accommodate future growth.',
  },
  {
    question: 'What is net metering?',
    answer: 'Net metering allows you to sell excess solar power back to the grid. While not widely available in all African countries, Nigeria\'s NERC has begun pilot programs. Grid-tied inverters support this feature.',
  },
];

export default function SolarGuide() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Solar Installation Guide
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about going solar in Africa — from system components
            to installation steps and best practices.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-12"
        >
          <Link to={createPageUrl('LoadCalculator')}>
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Zap className="w-4 h-4 mr-2" />
              Calculate Your Load
            </Button>
          </Link>
          <Link to={createPageUrl('CostBenefit')}>
            <Button variant="outline" className="w-full sm:w-auto">
              Analyze Cost & Savings
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>

        {/* System Components */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Sun className="w-6 h-6 text-primary" />
            System Components
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SYSTEM_COMPONENTS.map((component, index) => (
              <motion.div
                key={component.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full border-border hover:border-primary/30 transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 ${component.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <component.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{component.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{component.description}</p>
                      </div>
                    </div>
                    <div className="ml-13 space-y-1">
                      {component.specs.map((spec, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                          {spec}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Installation Steps */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-primary" />
            Installation Process
          </h2>
          <div className="space-y-4">
            {INSTALLATION_STEPS.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-border">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">{step.step}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                        <div className="space-y-1.5">
                          {step.tips.map((tip, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                              <Lightbulb className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Safety Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Safety First</h3>
                <p className="text-sm text-muted-foreground">
                  Solar installation involves high-voltage DC electricity which can be lethal.
                  Always hire a certified, experienced installer. Never attempt DIY installation
                  unless you are a qualified electrical professional. Ensure all installations
                  comply with local electrical codes and standards.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Frequently Asked Questions
          </h2>
          <Card className="border-border">
            <CardContent className="p-2">
              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left text-sm font-medium px-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 text-sm text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-foreground mb-2">Ready to go solar?</h3>
              <p className="text-muted-foreground mb-6">
                Start by calculating your energy needs, then find a verified installer on our platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to={createPageUrl('LoadCalculator')}>
                  <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                    <Zap className="w-4 h-4 mr-2" />
                    Calculate Your Load
                  </Button>
                </Link>
                <Link to={createPageUrl('Leaderboard')}>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Browse Installers
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
