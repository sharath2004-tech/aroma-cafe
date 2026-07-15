'use client';

import { CoffeeCupScene } from '@/components/3d/RotatingCoffeeCup';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <Image
                src="/logo.jpg"
                alt="Urban Crave - The Kitchen"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/40"
                priority
              />
              <span className="font-bold text-lg text-primary">Urban Crave</span>
            </motion.div>

            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-primary hover:bg-primary/90">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16 px-4">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto items-center">
          {/* Left content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 z-10"
          >
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl font-bold text-foreground leading-tight"
            >
              Welcome to <span className="text-primary">Urban Crave</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-muted-foreground leading-relaxed"
            >
              Experience premium dining with seamless ordering, table reservations, and real-time order tracking. Savor the best of Continental, Italian & Chinese cuisine with our modern kitchen management system.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex gap-4 pt-4"
            >
              <Link href="/auth/register?role=customer">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
                  Order Now
                </Button>
              </Link>
              <Link href="/auth/register?role=chef">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Join as Chef
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-6 pt-8"
            >
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Daily Orders</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Menu Items</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">4.9★</div>
                <div className="text-sm text-muted-foreground">Customer Rating</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right 3D Coffee Cup */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-96 md:h-full min-h-[500px]"
          >
            <CoffeeCupScene />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose Us</h2>
            <p className="text-lg text-muted-foreground">Experience the future of cafe management</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Pre-Order Ahead',
                description: 'Place your order 15 minutes in advance and skip the line',
                icon: '⏱️',
              },
              {
                title: 'Table Reservations',
                description: 'Book your favorite table before you arrive',
                icon: '🪑',
              },
              {
                title: 'Real-Time Tracking',
                description: 'Track your order status from kitchen to table',
                icon: '📍',
              },
              {
                title: 'Premium Selection',
                description: 'Handpicked coffee beans and fresh pastries daily',
                icon: '☕',
              },
              {
                title: 'Expert Chefs',
                description: 'Prepared by our talented culinary team',
                icon: '👨‍🍳',
              },
              {
                title: 'Customer Support',
                description: '24/7 support for all your dining needs',
                icon: '💬',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass p-8 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Preview Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Menu</h2>
            <p className="text-lg text-muted-foreground">Carefully curated selection of premium items</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Espresso', price: '₹120', desc: 'Rich and bold' },
              { name: 'Cappuccino', price: '₹180', desc: 'Smooth and creamy' },
              { name: 'Latte', price: '₹200', desc: 'Silky milk foam' },
              { name: 'Croissant', price: '₹150', desc: 'Buttery and flaky' },
              { name: 'Pastries', price: '₹90', desc: 'Fresh daily' },
              { name: 'Sandwich', price: '₹280', desc: 'Premium ingredients' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
                  <span className="text-primary font-bold">{item.price}</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold">Ready to Order?</h2>
            <p className="text-lg opacity-90">Join thousands of happy customers enjoying premium cafe experience</p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/auth/register?role=customer">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  Get Started
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.jpg"
                  alt="Urban Crave - The Kitchen"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/40"
                />
                <span className="font-bold text-primary">Urban Crave</span>
              </div>
              <p className="text-sm text-muted-foreground">The Kitchen — Continental · Italian · Chinese</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold">Quick Links</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">About</a></li>
                <li><a href="#" className="hover:text-primary transition">Menu</a></li>
                <li><a href="#" className="hover:text-primary transition">Contact</a></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold">Support</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition">FAQ</a></li>
                <li><a href="#" className="hover:text-primary transition">Contact Us</a></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold">Legal</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Urban Crave - The Kitchen. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
