import { PrismaClient } from '../app/generated/prisma/client';
import { slugify } from '../lib/utils';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  {
    name: 'Vinyl Prints',
    description: 'Bold graphic works pressed and finished on vinyl — tactile, durable, built for walls and windows.',
  },
  {
    name: 'Art Prints',
    description: 'High-quality paper editions exploring color, form, and minimalist composition.',
  },
  {
    name: 'Limited Editions',
    description: 'Small-run SUPERVILLAIN pieces — once they are gone, they are gone.',
  },
];

const PRODUCTS = [
  {
    name: 'SUPERVILLAIN Vol. 01',
    category: 'Vinyl Prints',
    basePrice: 85000,
    stock: 12,
    description:
      'The inaugural vinyl print under the SUPERVILLAIN name. A stark black-and-white graphic study inspired by vintage record sleeves and late-night studio sessions.',
    images: [
      'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    name: 'Analog Witch',
    category: 'Vinyl Prints',
    basePrice: 72000,
    stock: 18,
    description:
      'A moody vinyl piece channeling analog hiss, cracked grooves, and the occult charm of worn sleeve art. Designed for dim rooms and loud speakers.',
    images: [
      'https://images.unsplash.com/photo-1547826037-72e67d46e22d?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    name: 'Chrome Negative',
    category: 'Vinyl Prints',
    basePrice: 68000,
    stock: 20,
    description:
      'Inverted tones and metallic gradients collide in this vinyl print — a love letter to photocopy culture and DIY poster runs.',
    images: [
      'https://images.unsplash.com/photo-1618004914136-7fbb164a6e2f?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    name: 'Midnight Press',
    category: 'Vinyl Prints',
    basePrice: 75000,
    stock: 15,
    description:
      'Deep blues and hard-edged typography. A vinyl print that feels like the last record spinning before the lights come on.',
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511379938546-c1f69419868d?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    name: 'Static Frequency',
    category: 'Art Prints',
    basePrice: 45000,
    stock: 25,
    description:
      'Fine art paper edition. Grainy textures and broken waveforms rendered in Franklyn’s signature minimalist graphic language.',
    images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1549490349-8648-2e2287761df9?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    name: 'Form Study No. 2',
    category: 'Art Prints',
    basePrice: 42000,
    stock: 30,
    description:
      'A quiet composition of shape and negative space. Printed on heavyweight matte stock for a soft, gallery-ready finish.',
    images: [
      'https://images.unsplash.com/photo-1561214115-f2f8e88e0d03?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    name: 'Red Room',
    category: 'Art Prints',
    basePrice: 48000,
    stock: 22,
    description:
      'One bold plane of red against an empty field. An exercise in restraint — color as the entire argument.',
    images: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b178?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513364777864-611e06e83f59?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    name: 'Paper Ghost',
    category: 'Art Prints',
    basePrice: 40000,
    stock: 28,
    description:
      'Pale layers and faint marks, like a drawing that survived a flood. A print for people who like their art whispered, not shouted.',
    images: [
      'https://images.unsplash.com/photo-1578304975892-a14159749779?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    name: 'Villain’s Index',
    category: 'Limited Editions',
    basePrice: 120000,
    stock: 5,
    description:
      'Limited run of 5. A numbered vinyl-and-paper set cataloguing early SUPERVILLAIN experiments — part archive, part manifesto.',
    images: [
      'https://images.unsplash.com/photo-1514227795306-9f8b2448e913?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    name: 'Groove Theology',
    category: 'Limited Editions',
    basePrice: 95000,
    stock: 8,
    description:
      'Edition of 8. Concentric rings and sermon-like type treatments — vinyl culture treated like sacred text.',
    images: [
      'https://images.unsplash.com/photo-1619983081563-430f63629156?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    name: 'Franklyn / Self Portrait (Print)',
    category: 'Limited Editions',
    basePrice: 110000,
    stock: 6,
    description:
      'A rare studio self-portrait, reproduced as a signed art print. Not a photo — a graphic reduction of the person behind the work.',
    images: [
      'https://images.unsplash.com/photo-1460661419646-9d7b6b2232b8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1547891654-da39b41c89a0?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    name: 'Tactile Proof',
    category: 'Art Prints',
    basePrice: 52000,
    stock: 16,
    description:
      'Built to be touched, not just viewed. Heavy ink density and visible paper tooth — Franklyn’s ode to the physical print medium.',
    images: [
      'https://images.unsplash.com/photo-1515404005342-1412d3a3a263?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop',
    ],
  },
];

async function main() {
  console.log('Seeding SUPERVILLAIN catalog...');

  // Reset catalog so old non-art inventory does not linger
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  for (const category of CATEGORIES) {
    await prisma.category.create({
      data: {
        name: category.name,
        slug: slugify(category.name),
        description: category.description,
      },
    });
  }

  const categories = await prisma.category.findMany();

  for (const product of PRODUCTS) {
    const category = categories.find((c) => c.name === product.category);
    if (!category) continue;

    await prisma.product.create({
      data: {
        name: product.name,
        slug: slugify(product.name),
        description: product.description,
        basePrice: product.basePrice,
        images: product.images,
        categoryId: category.id,
        stock: product.stock,
        isVisible: true,
      },
    });
  }

  console.log(`Seeded ${PRODUCTS.length} works across ${CATEGORIES.length} categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
