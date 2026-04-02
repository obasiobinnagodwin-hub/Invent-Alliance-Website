export const blogPosts = [
  {
    slug: 'an-appreciation-from-lead-fort-gate-college',
    title: 'An Appreciation from Lead-Fort Gate College',
    date: 'June 5, 2023',
    category: 'appreciation', // 👈 NEW
    image: '/images/blog/lead-fort.jpg',
    excerpt: 'We received an appreciation letter from Lead-Fort Gate College...',
    content: [
      {
        type: 'paragraph',
        text: 'We are honored to have received an appreciation letter...'
      },
      {
        type: 'image',
        src: '/images/blog/lead-fort.jpg',
        alt: 'Appreciation Letter'
      }
    ]
  },

  {
    slug: 'national-open-university-tour',
    title: "National Open University Students' Tour",
    date: 'April 20, 2023',
    category: 'news', // 👈 DIFFERENT TYPE
    image: '/images/blog/noun-tour.jpg',
    excerpt: 'Students from National Open University visited our facility...',
    content: [
      {
        type: 'paragraph',
        text: 'We hosted students from the National Open University...'
      }
    ]
  }
];