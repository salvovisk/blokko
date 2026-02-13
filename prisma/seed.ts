import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const demoPassword = await hash('demo123', 12);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@blokko.com' },
    update: {},
    create: {
      email: 'demo@blokko.com',
      name: 'Demo User',
      password: demoPassword,
    },
  });

  console.log('✅ Demo user created:');
  console.log('   Email: demo@blokko.com');
  console.log('   Password: demo123');
  console.log('   ID:', demoUser.id);

  // Create a sample quote for demo user
  const sampleQuote = await prisma.quote.create({
    data: {
      userId: demoUser.id,
      title: 'Sample Quote - Website Design',
      description: 'Professional website design and development',
      status: 'draft',
      content: JSON.stringify({
        blocks: [
          {
            id: '1',
            type: 'HEADER',
            data: {
              companyName: 'BLOKKO',
              clientName: 'Sample Client',
              date: new Date().toISOString(),
            },
          },
          {
            id: '2',
            type: 'PRICES',
            data: {
              items: [
                { description: 'Website Design', quantity: 1, price: 2500 },
                { description: 'Development', quantity: 40, price: 100 },
                { description: 'Testing & QA', quantity: 8, price: 80 },
              ],
            },
          },
        ],
      }),
    },
  });

  console.log('✅ Sample quote created:', sampleQuote.title);

  // Create system templates
  const basicTemplate = await prisma.template.upsert({
    where: { id: 'template-basic' },
    update: {},
    create: {
      id: 'template-basic',
      userId: null,
      isSystem: true,
      name: 'Basic Quote',
      description: 'Minimal quote template with header, pricing, and terms',
      content: JSON.stringify([
        {
          id: 'header-1',
          type: 'HEADER',
          data: {
            companyName: 'Your Company',
            companyAddress: '',
            companyPhone: '',
            companyEmail: '',
            clientName: 'Client Name',
            clientAddress: '',
            clientEmail: '',
            quoteNumber: `Q-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            validUntil: '',
          },
        },
        {
          id: 'prices-1',
          type: 'PRICES',
          data: {
            items: [],
            currency: 'EUR',
            taxRate: 22,
            showTax: true,
            subtotal: 0,
            tax: 0,
            total: 0,
          },
        },
        {
          id: 'terms-1',
          type: 'TERMS',
          data: {
            title: 'Terms & Conditions',
            terms: [
              'Payment due within 30 days',
              'Prices valid for 30 days',
              'All work subject to agreement',
            ],
          },
        },
      ]),
    },
  });

  const detailedTemplate = await prisma.template.upsert({
    where: { id: 'template-detailed' },
    update: {},
    create: {
      id: 'template-detailed',
      userId: null,
      isSystem: true,
      name: 'Detailed Quote',
      description: 'Comprehensive template with introduction and next steps',
      content: JSON.stringify([
        {
          id: 'header-1',
          type: 'HEADER',
          data: {
            companyName: 'Your Company',
            companyAddress: '',
            companyPhone: '',
            companyEmail: '',
            clientName: 'Client Name',
            clientAddress: '',
            clientEmail: '',
            quoteNumber: `Q-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            validUntil: '',
          },
        },
        {
          id: 'text-1',
          type: 'TEXT',
          data: {
            title: 'Introduction',
            content: 'Thank you for your interest. We are pleased to present this quote for your consideration.',
          },
        },
        {
          id: 'prices-1',
          type: 'PRICES',
          data: {
            items: [],
            currency: 'EUR',
            taxRate: 22,
            showTax: true,
            subtotal: 0,
            tax: 0,
            total: 0,
          },
        },
        {
          id: 'text-2',
          type: 'TEXT',
          data: {
            title: 'Next Steps',
            content: 'Upon acceptance of this quote, we will proceed with the project timeline and deliverables as discussed.',
          },
        },
        {
          id: 'terms-1',
          type: 'TERMS',
          data: {
            title: 'Terms & Conditions',
            terms: [
              'Payment due within 30 days of invoice date',
              'Quote valid for 30 days from date of issue',
              'All work subject to signed agreement',
              '50% deposit required to commence work',
              'Final deliverables upon receipt of final payment',
            ],
          },
        },
      ]),
    },
  });

  const serviceTemplate = await prisma.template.upsert({
    where: { id: 'template-service' },
    update: {},
    create: {
      id: 'template-service',
      userId: null,
      isSystem: true,
      name: 'Service Quote',
      description: 'Service-focused template with detailed description',
      content: JSON.stringify([
        {
          id: 'header-1',
          type: 'HEADER',
          data: {
            companyName: 'Your Company',
            companyAddress: '',
            companyPhone: '',
            companyEmail: '',
            clientName: 'Client Name',
            clientAddress: '',
            clientEmail: '',
            quoteNumber: `Q-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            validUntil: '',
          },
        },
        {
          id: 'text-1',
          type: 'TEXT',
          data: {
            title: 'Service Description',
            content: 'We provide professional services tailored to your specific needs. Our approach ensures quality delivery and client satisfaction.',
          },
        },
        {
          id: 'prices-1',
          type: 'PRICES',
          data: {
            items: [],
            currency: 'EUR',
            taxRate: 22,
            showTax: true,
            subtotal: 0,
            tax: 0,
            total: 0,
          },
        },
        {
          id: 'terms-1',
          type: 'TERMS',
          data: {
            title: 'Service Terms',
            terms: [
              'Services billed monthly in arrears',
              'Contract subject to 30-day notice period',
              'Service level agreement as per contract',
              'Pricing subject to annual review',
            ],
          },
        },
      ]),
    },
  });

  // New template: Project Proposal (with Timeline and Contact)
  const projectTemplate = await prisma.template.upsert({
    where: { id: 'template-project' },
    update: {},
    create: {
      id: 'template-project',
      userId: null,
      isSystem: true,
      name: 'Project Proposal',
      description: 'Complete project proposal with timeline, team contacts, and FAQ',
      content: JSON.stringify([
        {
          id: 'header-1',
          type: 'HEADER',
          data: {
            companyName: 'Your Company',
            companyAddress: '',
            companyPhone: '',
            companyEmail: '',
            clientName: 'Client Name',
            clientAddress: '',
            clientEmail: '',
            quoteNumber: `Q-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            validUntil: '',
          },
        },
        {
          id: 'text-1',
          type: 'TEXT',
          data: {
            title: 'Project Overview',
            content: 'We are excited to present this comprehensive proposal for your project. Our team will deliver high-quality results within the agreed timeline.',
          },
        },
        {
          id: 'prices-1',
          type: 'PRICES',
          data: {
            items: [],
            currency: 'EUR',
            taxRate: 22,
            showTax: true,
            subtotal: 0,
            tax: 0,
            total: 0,
          },
        },
        {
          id: 'timeline-1',
          type: 'TIMELINE',
          data: {
            title: 'Project Timeline',
            startDate: 'Upon approval',
            milestones: [
              {
                id: 'milestone-1',
                phase: 'Discovery & Planning',
                duration: '1 week',
                deliverables: 'Project plan, requirements document, wireframes',
                dueDate: '',
              },
              {
                id: 'milestone-2',
                phase: 'Design & Development',
                duration: '3 weeks',
                deliverables: 'UI designs, working prototype',
                dueDate: '',
              },
              {
                id: 'milestone-3',
                phase: 'Testing & Launch',
                duration: '1 week',
                deliverables: 'QA testing, deployment, training',
                dueDate: '',
              },
            ],
            notes: 'Timeline assumes timely client feedback and approvals at each milestone.',
          },
        },
        {
          id: 'contact-1',
          type: 'CONTACT',
          data: {
            title: 'Your Project Team',
            contacts: [
              {
                id: 'contact-1',
                name: 'Project Manager',
                role: 'Lead Project Manager',
                email: 'pm@yourcompany.com',
                phone: '+1 234 567 8900',
                bio: 'Oversees project delivery and client communication',
              },
              {
                id: 'contact-2',
                name: 'Technical Lead',
                role: 'Senior Developer',
                email: 'tech@yourcompany.com',
                phone: '',
                bio: 'Responsible for technical architecture and implementation',
              },
            ],
            layout: 'list',
          },
        },
        {
          id: 'faq-1',
          type: 'FAQ',
          data: {
            title: 'Frequently Asked Questions',
            faqs: [
              {
                id: 'faq-1',
                question: "What's included in the price?",
                answer: 'All deliverables listed in the timeline section, along with post-launch support for 30 days.',
              },
              {
                id: 'faq-2',
                question: 'What if I need changes during the project?',
                answer: 'Minor revisions are included at each milestone. Major scope changes will be quoted separately.',
              },
              {
                id: 'faq-3',
                question: 'How do we communicate during the project?',
                answer: 'Weekly status calls and a shared project management tool for daily updates.',
              },
            ],
            showNumbering: true,
          },
        },
        {
          id: 'terms-1',
          type: 'TERMS',
          data: {
            title: 'Terms & Conditions',
            terms: [
              '50% deposit required to commence work',
              'Remaining balance due upon project completion',
              'Client responsible for providing timely feedback',
              'Source code and assets transferred upon final payment',
            ],
          },
        },
      ]),
    },
  });

  // New template: Payment Plan (with Payment and Discount blocks)
  const paymentPlanTemplate = await prisma.template.upsert({
    where: { id: 'template-payment-plan' },
    update: {},
    create: {
      id: 'template-payment-plan',
      userId: null,
      isSystem: true,
      name: 'Payment Plan Quote',
      description: 'Quote with detailed payment schedule and early payment discount',
      content: JSON.stringify([
        {
          id: 'header-1',
          type: 'HEADER',
          data: {
            companyName: 'Your Company',
            companyAddress: '',
            companyPhone: '',
            companyEmail: '',
            clientName: 'Client Name',
            clientAddress: '',
            clientEmail: '',
            quoteNumber: `Q-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            validUntil: '',
          },
        },
        {
          id: 'prices-1',
          type: 'PRICES',
          data: {
            items: [],
            currency: 'EUR',
            taxRate: 22,
            showTax: true,
            subtotal: 0,
            tax: 0,
            total: 0,
          },
        },
        {
          id: 'discount-1',
          type: 'DISCOUNT',
          data: {
            title: 'Early Payment Discount',
            offerType: 'percentage',
            discountValue: 10,
            description: 'Pay in full within 7 days of quote acceptance and save 10%',
            validUntil: '',
            conditions: [
              'Full payment required within 7 days',
              'Discount applied to total amount before tax',
              'Cannot be combined with other offers',
            ],
            highlightColor: '',
          },
        },
        {
          id: 'payment-1',
          type: 'PAYMENT',
          data: {
            title: 'Payment Terms',
            schedule: [
              {
                id: 'payment-1',
                milestone: 'Deposit (upon signing)',
                percentage: 50,
                amount: 0,
              },
              {
                id: 'payment-2',
                milestone: 'Milestone 1 (design approval)',
                percentage: 25,
                amount: 0,
              },
              {
                id: 'payment-3',
                milestone: 'Final payment (upon delivery)',
                percentage: 25,
                amount: 0,
              },
            ],
            bankingInfo: {
              accountName: 'Your Company Name',
              accountNumber: 'XXXX-XXXX-XXXX',
              routingNumber: 'XXXXXXX',
              swiftCode: '',
            },
            acceptedMethods: ['Bank Transfer', 'PayPal', 'Credit Card'],
            notes: 'Invoices sent at each milestone. Payment due within 7 days of invoice.',
          },
        },
        {
          id: 'terms-1',
          type: 'TERMS',
          data: {
            title: 'Payment Terms & Conditions',
            terms: [
              'Late payments subject to 2% monthly interest',
              'Work may be paused if payments are overdue',
              'All prices in EUR unless otherwise stated',
              'Refund policy as per service agreement',
            ],
          },
        },
      ]),
    },
  });

  // New template: Consulting Agreement (with Signature and Table)
  const consultingTemplate = await prisma.template.upsert({
    where: { id: 'template-consulting' },
    update: {},
    create: {
      id: 'template-consulting',
      userId: null,
      isSystem: true,
      name: 'Consulting Agreement',
      description: 'Professional consulting quote with deliverables table and signature section',
      content: JSON.stringify([
        {
          id: 'header-1',
          type: 'HEADER',
          data: {
            companyName: 'Your Company',
            companyAddress: '',
            companyPhone: '',
            companyEmail: '',
            clientName: 'Client Name',
            clientAddress: '',
            clientEmail: '',
            quoteNumber: `Q-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            validUntil: '',
          },
        },
        {
          id: 'text-1',
          type: 'TEXT',
          data: {
            title: 'Scope of Work',
            content: 'This consulting engagement will provide expert guidance and strategic recommendations in the following areas.',
          },
        },
        {
          id: 'table-1',
          type: 'TABLE',
          data: {
            title: 'Deliverables',
            headers: ['Deliverable', 'Description', 'Timeline'],
            rows: [
              ['Initial Assessment', 'Current state analysis and gap identification', 'Week 1'],
              ['Strategic Roadmap', 'Detailed action plan with priorities', 'Week 2'],
              ['Implementation Guide', 'Step-by-step execution guidelines', 'Week 3'],
              ['Final Report', 'Comprehensive findings and recommendations', 'Week 4'],
            ],
            footers: [],
            alignment: ['left', 'left', 'center'],
            showBorders: true,
          },
        },
        {
          id: 'prices-1',
          type: 'PRICES',
          data: {
            items: [],
            currency: 'EUR',
            taxRate: 22,
            showTax: true,
            subtotal: 0,
            tax: 0,
            total: 0,
          },
        },
        {
          id: 'contact-1',
          type: 'CONTACT',
          data: {
            title: 'Your Consultant',
            contacts: [
              {
                id: 'contact-1',
                name: 'Senior Consultant',
                role: 'Lead Consultant',
                email: 'consultant@yourcompany.com',
                phone: '+1 234 567 8900',
                bio: '15+ years of industry experience in strategic planning and execution',
              },
            ],
            layout: 'list',
          },
        },
        {
          id: 'signature-1',
          type: 'SIGNATURE',
          data: {
            title: 'Agreement Acceptance',
            approvalText: 'By signing below, both parties agree to the terms, scope, and pricing outlined in this consulting agreement.',
            signatureLabel: 'Client Signature',
            dateLabel: 'Date',
            showCompanySignature: true,
          },
        },
        {
          id: 'terms-1',
          type: 'TERMS',
          data: {
            title: 'Terms & Conditions',
            terms: [
              'Confidentiality agreement applies to all work',
              'All intellectual property remains with consultant',
              'Client may use deliverables for internal purposes only',
              'Additional consulting hours billed at hourly rate',
            ],
          },
        },
      ]),
    },
  });

  // New template: Agency Proposal (comprehensive with all new blocks)
  const agencyTemplate = await prisma.template.upsert({
    where: { id: 'template-agency' },
    update: {},
    create: {
      id: 'template-agency',
      userId: null,
      isSystem: true,
      name: 'Agency Proposal',
      description: 'Full-featured agency proposal showcasing all available blocks',
      content: JSON.stringify([
        {
          id: 'header-1',
          type: 'HEADER',
          data: {
            companyName: 'Your Agency',
            companyAddress: '',
            companyPhone: '',
            companyEmail: '',
            clientName: 'Client Name',
            clientAddress: '',
            clientEmail: '',
            quoteNumber: `Q-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            validUntil: '',
          },
        },
        {
          id: 'text-1',
          type: 'TEXT',
          data: {
            title: 'Executive Summary',
            content: 'We are thrilled to present this comprehensive proposal for your digital transformation project. Our agency combines creative excellence with technical expertise to deliver exceptional results.',
          },
        },
        {
          id: 'contact-1',
          type: 'CONTACT',
          data: {
            title: 'Your Dedicated Team',
            contacts: [
              {
                id: 'contact-1',
                name: 'Account Director',
                role: 'Client Success Lead',
                email: 'director@agency.com',
                phone: '+1 234 567 8900',
                bio: 'Your main point of contact for strategy and planning',
              },
              {
                id: 'contact-2',
                name: 'Creative Director',
                role: 'Design Lead',
                email: 'creative@agency.com',
                phone: '',
                bio: 'Award-winning designer with 10+ years experience',
              },
              {
                id: 'contact-3',
                name: 'Technical Director',
                role: 'Development Lead',
                email: 'tech@agency.com',
                phone: '',
                bio: 'Full-stack expert specializing in scalable solutions',
              },
            ],
            layout: 'grid',
          },
        },
        {
          id: 'table-1',
          type: 'TABLE',
          data: {
            title: 'Service Packages Comparison',
            headers: ['Feature', 'Essential', 'Professional', 'Enterprise'],
            rows: [
              ['Design Concepts', '2', '4', 'Unlimited'],
              ['Revisions', '3', '5', 'Unlimited'],
              ['Pages/Screens', '5', '15', '30+'],
              ['Support Period', '30 days', '90 days', '1 year'],
              ['Training Sessions', '-', '2 hours', '8 hours'],
            ],
            footers: [],
            alignment: ['left', 'center', 'center', 'center'],
            showBorders: true,
          },
        },
        {
          id: 'prices-1',
          type: 'PRICES',
          data: {
            items: [],
            currency: 'EUR',
            taxRate: 22,
            showTax: true,
            subtotal: 0,
            tax: 0,
            total: 0,
          },
        },
        {
          id: 'discount-1',
          type: 'DISCOUNT',
          data: {
            title: 'Launch Special Offer',
            offerType: 'percentage',
            discountValue: 15,
            description: 'Book your project this month and receive 15% off the total project cost',
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            conditions: [
              'Valid for new projects only',
              'Project must start within 60 days',
              'Minimum project value €5,000',
            ],
            highlightColor: '',
          },
        },
        {
          id: 'timeline-1',
          type: 'TIMELINE',
          data: {
            title: 'Project Roadmap',
            startDate: 'Upon contract signing',
            milestones: [
              {
                id: 'milestone-1',
                phase: 'Discovery & Strategy',
                duration: '1-2 weeks',
                deliverables: 'Research findings, strategy document, creative brief',
                dueDate: '',
              },
              {
                id: 'milestone-2',
                phase: 'Design & Prototyping',
                duration: '2-3 weeks',
                deliverables: 'UI/UX designs, interactive prototypes, style guide',
                dueDate: '',
              },
              {
                id: 'milestone-3',
                phase: 'Development',
                duration: '4-6 weeks',
                deliverables: 'Functional website/application, CMS integration',
                dueDate: '',
              },
              {
                id: 'milestone-4',
                phase: 'Testing & Launch',
                duration: '1-2 weeks',
                deliverables: 'QA testing, performance optimization, deployment',
                dueDate: '',
              },
            ],
            notes: 'Actual timeline may vary based on project complexity and feedback cycles.',
          },
        },
        {
          id: 'payment-1',
          type: 'PAYMENT',
          data: {
            title: 'Payment Schedule',
            schedule: [
              {
                id: 'payment-1',
                milestone: 'Project kickoff',
                percentage: 30,
                amount: 0,
              },
              {
                id: 'payment-2',
                milestone: 'Design approval',
                percentage: 30,
                amount: 0,
              },
              {
                id: 'payment-3',
                milestone: 'Development complete',
                percentage: 30,
                amount: 0,
              },
              {
                id: 'payment-4',
                milestone: 'Project launch',
                percentage: 10,
                amount: 0,
              },
            ],
            bankingInfo: {
              accountName: 'Your Agency Ltd',
              accountNumber: 'XXXX-XXXX-XXXX',
              routingNumber: 'XXXXXXX',
              swiftCode: '',
            },
            acceptedMethods: ['Bank Transfer', 'PayPal', 'Credit Card', 'Stripe'],
            notes: 'Invoices issued at each milestone. Payment due within 14 days.',
          },
        },
        {
          id: 'faq-1',
          type: 'FAQ',
          data: {
            title: 'Frequently Asked Questions',
            faqs: [
              {
                id: 'faq-1',
                question: 'What happens if the project takes longer than expected?',
                answer: 'We provide a detailed timeline with buffer periods built in. Any delays caused by our team are our responsibility. Client-side delays may extend the timeline accordingly.',
              },
              {
                id: 'faq-2',
                question: 'Do you provide ongoing support after launch?',
                answer: 'Yes! We include 30-90 days of post-launch support depending on your package. Extended support and maintenance plans are available.',
              },
              {
                id: 'faq-3',
                question: 'Can we request changes during development?',
                answer: 'Absolutely. Minor adjustments are included. Major changes to scope will be assessed and quoted separately to avoid delays.',
              },
              {
                id: 'faq-4',
                question: 'Who owns the final deliverables?',
                answer: 'Upon final payment, you receive full ownership of all custom designs, code, and content created for your project.',
              },
            ],
            showNumbering: true,
          },
        },
        {
          id: 'signature-1',
          type: 'SIGNATURE',
          data: {
            title: 'Project Agreement',
            approvalText: 'By signing this proposal, both parties agree to proceed with the project under the terms, timeline, and pricing outlined above.',
            signatureLabel: 'Client Signature',
            dateLabel: 'Date',
            showCompanySignature: true,
          },
        },
        {
          id: 'terms-1',
          type: 'TERMS',
          data: {
            title: 'Terms & Conditions',
            terms: [
              'All work remains property of agency until final payment received',
              'Client responsible for providing content and materials in timely manner',
              'Cancellation requires 30 days written notice',
              'Additional work outside of scope billed at hourly rate',
              'Confidentiality and NDA apply to all project information',
            ],
          },
        },
      ]),
    },
  });

  console.log('✅ System templates created:');
  console.log('   -', basicTemplate.name);
  console.log('   -', detailedTemplate.name);
  console.log('   -', serviceTemplate.name);
  console.log('   -', projectTemplate.name);
  console.log('   -', paymentPlanTemplate.name);
  console.log('   -', consultingTemplate.name);
  console.log('   -', agencyTemplate.name);
  console.log('');
  console.log('🎉 Seeding complete!');
  console.log('');
  console.log('You can now login with:');
  console.log('  Email: demo@blokko.com');
  console.log('  Password: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
