/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.paathsohayok.in',
  generateRobotsTxt: true,
  outDir: 'public', // Output to Vite's public folder
  additionalPaths: async (config) => {
    return [
      {
        loc: '/learn/class-8/science/force',
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/learn/class-8/science/newton-laws',
        lastmod: new Date().toISOString(),
      },
    ];
  },
};
