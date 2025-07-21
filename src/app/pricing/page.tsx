"use client";

import React, { useEffect } from "react";
import PricingCard from "@/components/PricingCard";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Head from 'next/head';

const PricingPage = () => {
  const router = useRouter();
  useEffect(() => {
    document.title = "AutoInsta";
  }, []);
  return (
    <>
      <Head>
        <title>AutoInsta</title>
      </Head>
      <Navbar />
      <div className="min-h-screen bg-white flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full flex flex-col items-center pt-16 pb-8 px-4">
          <h1 className="text-5xl md:text-6xl font-serif font-semibold text-gray-800 text-center mb-6">
            Let the bot do the chat for you
          </h1>
          <p className="text-lg md:text-xl text-gray-600 text-center max-w-2xl mb-8">
            Whether you’re a small business or a large enterprise, AutoInsta Pro enables you to focus on growing your business.
          </p>
          <div className="w-16 h-1 bg-teal-200 rounded-full mb-8" />
        </section>
        {/* Pricing Cards Section */}
        <section className="w-full flex flex-col items-center justify-center pb-16">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            <PricingCard
              planType="Free"
              price="Kostenlos"
              buttonLabel="Get started for free"
              onClick={() => router.push("/register")}
            />
            <PricingCard
              planType="Pro"
              price="10€ / month"
              buttonLabel="Get started"
              highlight
              onClick={() => router.push("/pro")}
            />
          </div>
        </section>
      </div>
    </>
  );
};

export default PricingPage; 