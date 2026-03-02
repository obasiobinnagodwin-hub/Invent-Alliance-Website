"use client";

import { useState } from "react";
import Image from "next/image";

export default function VirtualOfficePage() {
  const [activeTab, setActiveTab] = useState("virtual");

  return (
    <div className="bg-white text-slate-700">

      {/* HERO */}
      <section className="relative h-[220px] md:h-[250px] w-full">
        <Image
          src="/images/office_reception.jpg"
          alt="Virtual Office & Hosted Services"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-blue-900/75"></div>

        <div className="absolute inset-0 flex items-center justify-center px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center max-w-3xl leading-tight">
            Virtual Office & Hosted Shared Services.. 
          </h1>
        </div>
      </section>

      {/* TABS */}
      <div className="bg-yellow-500">
        <div className="max-w-6xl mx-auto flex flex-wrap">
          <Tab
            label="Virtual Office Services"
            isActive={activeTab === "virtual"}
            onClick={() => setActiveTab("virtual")}
          />
          <Tab
            label="Video Conferencing Services"
            isActive={activeTab === "video"}
            onClick={() => setActiveTab("video")}
          />
          <Tab
            label="Hosted Shared Services"
            isActive={activeTab === "hosted"}
            onClick={() => setActiveTab("hosted")}
          />
        </div>
      </div>

      {/* CONTENT CONTAINER */}
      <div className="max-w-6xl mx-auto py-20 px-6">

        {activeTab === "virtual" && (
          <ContentWrapper>
            <h2 className="section-title text-2xl font-bold text-blue-900 mb-3">Virtual Office Services</h2>

            <p className="paragraph">
              The Virtual Office concept is a modern alternative to traditional furnished offices.
              It eliminates the high cost and rigidity of serviced offices while providing essential
              business address and communication services without the need for a dedicated physical space.
            </p>

            <p className="paragraph">
              Invent Alliance Limited offers flexible hosted office solutions designed to enhance
              your professional image and support your business growth.
            </p>

            <SectionHeading>What We Offer:</SectionHeading>

            <BulletList
              items={[
                "Business Meeting Space – Modern, non-branded conference rooms available hourly, daily, or weekly.",
                "Cost-Effective Plans – Prepaid, flexible services that boost productivity.",
                "Professional Call Handling – Calls answered on your behalf and forwarded.",
                "Flexible Workspace – Drop-in office space hourly, daily, or monthly.",
                "Full-Service Amenities – High-speed internet, printing, conferencing, kitchenette and reception.",
              ]}
            />

            <HighlightText>
              Build a credible business presence from day one — without the overhead of a traditional office.
            </HighlightText>

            <ContactBlock
              phone="+2349062764054"
              email="sales@inventallianceco.com"
            />
          </ContentWrapper>
        )}

        {activeTab === "video" && (
          <ContentWrapper>
            <h2 className="section-title text-2xl font-bold text-blue-900 mb-3">Video Conferencing Services</h2>

            <p className="paragraph">
              In today’s fast-paced digital environment, video conferencing is essential for productivity
              and seamless collaboration without location or time barriers.
            </p>

            <p className="paragraph">
              Invent Alliance Limited delivers reliable, high-quality video conferencing solutions that
              connect teams, clients, and partners anywhere in the world.
            </p>

            <SectionHeading>Our Features Include:</SectionHeading>

            <BulletList
              items={[
                "HD Video & Clear Audio – Professional live communication",
                "Up to 500 Participants – Ideal for meetings & webinars",
                "Screen Sharing & Collaboration Tools",
                "Cloud Recording & Auto Transcripts",
                "Training Support – Whiteboarding & breakout rooms",
                "Local & Cloud Recording (MP4/MP4A)",
                "24/7 Technical Support",
              ]}
            />

            <HighlightText>
              Empower your team with secure, scalable, and enterprise-ready video conferencing.
            </HighlightText>

            <ContactBlock
              phone="+2349062764054"
              email="sales@inventallianceco.com"
            />
          </ContentWrapper>
        )}

        {activeTab === "hosted" && (
          <ContentWrapper>
            <h2 className="section-title text-2xl font-bold text-blue-900 mb-3">Hosted Shared Services</h2>

            <p className="paragraph">
              Modern businesses face rising operational costs and increasing administrative complexity.
              Invent Alliance Limited provides centralized Shared Services that reduce overhead and
              strengthen operational performance.
            </p>

            <SectionHeading>Core Service Areas:</SectionHeading>

            <BulletList
              items={[
                "Secretarial Services",
                "Office Administration",
                "Legal Services (via trusted partners)",
                "Accounting Services",
                "IT Management",
                "Procurement Advisory",
              ]}
            />

            <HighlightText>
              Our goal is simple: streamline your support functions, reduce costs, and improve efficiency.
            </HighlightText>

            <ContactBlock
              phone="+2349062764054"
              email="sales@inventallianceco.com"
            />
          </ContentWrapper>
        )}

      </div>
    </div>
  );
}

/* COMPONENTS */

function Tab({ label, isActive, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 font-semibold transition ${
        isActive
          ? "bg-white text-blue-900"
          : "text-white hover:bg-yellow-600"
      }`}
    >
      {label}
    </button>
  );
}

function ContentWrapper({ children }: any) {
  return <div className="max-w-4xl mx-auto space-y-8">{children}</div>;
}

function SectionHeading({ children }: any) {
  return <h3 className="text-lg font-semibold mt-6">{children}</h3>;
}

function BulletList({ items }: any) {
  return (
    <ul className="list-disc pl-6 space-y-2 text-slate-700">
      {items.map((item: string, i: number) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function HighlightText({ children }: any) {
  return (
    <p className="mt-8 text-blue-900 font-semibold border-l-4 border-yellow-500 pl-4">
      {children}
    </p>
  );
}

function ContactBlock({ phone, email }: any) {
  return (
    <div className="mt-8 p-6 bg-slate-100 rounded-lg">
      <p className="font-semibold">For enquiries:</p>
      <p>{phone}</p>
      <p>{email}</p>
    </div>
  );
}