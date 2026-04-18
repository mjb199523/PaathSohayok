import React from 'react';

const SchemaMarkup = () => {
  const schemas = [
    // Schema 1 — SoftwareApplication
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "PaathSohayok",
      "url": "https://www.paathsohayok.in",
      "applicationCategory": "EducationApplication",
      "operatingSystem": "Web",
      "description": "PaathSohayok is an AI-powered tool that helps teachers generate lesson plans, MCQs, worksheets, and learning content in 1–2 minutes.",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
      "featureList": ["AI lesson plan generator", "MCQ generator for teachers", "Worksheet generator", "Content generation in under 2 minutes"]
    },
    // Schema 2 — WebSite
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "PaathSohayok",
      "url": "https://www.paathsohayok.in"
    },
    // Schema 3 — Organization
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "PaathSohayok",
      "url": "https://www.paathsohayok.in",
      "logo": "https://www.paathsohayok.in/favicon.svg"
    },
    // Schema 4 — FAQPage
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is PaathSohayok?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "PaathSohayok is an AI-powered tool that helps teachers generate lesson plans, MCQs, worksheets, and learning content in just 1–2 minutes, saving hours of manual preparation time."
          }
        },
        {
          "@type": "Question",
          "name": "How does PaathSohayok help teachers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Teachers enter a topic or subject, and PaathSohayok uses AI to instantly generate structured learning content including objectives, explanations, activities, and assessments."
          }
        },
        {
          "@type": "Question",
          "name": "Is PaathSohayok free to use?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "PaathSohayok offers free access to its AI content generation tools for teachers. Visit paathsohayok.in to get started."
          }
        },
        {
          "@type": "Question",
          "name": "How long does it take to generate content on PaathSohayok?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "PaathSohayok generates complete learning content in 1–2 minutes, compared to the hours it typically takes teachers to create materials manually."
          }
        }
      ]
    },
    // Schema 5 — VideoObject (How to Use PaathSohayok)
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": "How to Use PaathSohayok – AI Tool for Teachers in Assam",
      "description": "A step-by-step guide on using PaathSohayok to generate lesson plans, assessments, and slides in minutes.",
      "thumbnailUrl": "https://img.youtube.com/vi/B5a4mFVWyY0/maxresdefault.jpg",
      "uploadDate": "2024-01-01",
      "contentUrl": "https://youtu.be/B5a4mFVWyY0",
      "embedUrl": "https://www.youtube.com/embed/B5a4mFVWyY0"
    },
    // Schema 6 — VideoObject (What is PaathSohayok)
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": "What is PaathSohayok – AI Tool for Teachers in Assam",
      "description": "Learn what PaathSohayok is and how it helps teachers in Assam generate lesson plans, assessments, and classroom content with AI.",
      "thumbnailUrl": "https://img.youtube.com/vi/hh7dfSezZNs/maxresdefault.jpg",
      "uploadDate": "2024-01-01",
      "contentUrl": "https://youtu.be/hh7dfSezZNs",
      "embedUrl": "https://www.youtube.com/embed/hh7dfSezZNs"
    }
  ];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
};

export default SchemaMarkup;
