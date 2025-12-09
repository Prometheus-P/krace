import { NextRouter } from 'next/router';

export const addOpenGraphTags = (
  router: NextRouter,
  title: string,
  description: string,
  imageUrl?: string
) => {
  // This is a placeholder. In a real application, you would use a library
  // like Next SEO or manually add the tags to the <head> of the page.
  console.log(`Adding Open Graph tags for ${router.asPath}:`);
  console.log(`  title: ${title}`);
  console.log(`  description: ${description}`);
  if (imageUrl) {
    console.log(`  image: ${imageUrl}`);
  }
};
