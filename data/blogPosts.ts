// data/blogPosts.ts

export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'image'; src: string; alt: string };

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: 'news' | 'appreciation';
  image: string;
  excerpt: string;
  content: ContentBlock[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'an-appreciation-from-lead-fort-gate-college',
    title: 'An Appreciation from Lead-Fort Gate College',
    date: 'June 5, 2023',
    category: 'appreciation',
    image: '/images/blog/lead-fort.jpg',
    excerpt:
      'We received an appreciation letter from Lead-Fort Gate College...',
    content: [
      {
        type: 'paragraph',
        text:
          'We are honored to have received an appreciation letter from Lead-Fort Gate College. This reflects our commitment to excellence.',
      },
      {
        type: 'image',
        src: '/images/blog/lead-fort.jpg',
        alt: 'Appreciation Letter',
      },
    ],
  },

  {
    slug: 'national-open-university-tour',
    title: "National Open University Students' Tour",
    date: 'April 20, 2023',
    category: 'news',
    image: '/images/blog/noun-tour.jpg',
    excerpt:
      'Students from National Open University visited our facility...',
    content: [
      {
        type: 'paragraph',
        text:
          'We hosted students from the National Open University who toured our facilities and learned about our operations.',
      },
    ],
  },
];