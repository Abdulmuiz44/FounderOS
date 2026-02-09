import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsDirectory = path.join(__dirname, '../src/content/blog');
const outputFile = path.join(__dirname, '../src/lib/blog-content.ts');

async function processMarkdown(content) {
    const processedContent = await remark()
        .use(html, { sanitize: false })
        .process(content);
    return processedContent.toString();
}

async function generateBlogContent() {
    console.log('📝 Generating embedded blog content...');

    if (!fs.existsSync(postsDirectory)) {
        console.error('❌ Blog posts directory not found:', postsDirectory);
        process.exit(1);
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const mdFiles = fileNames.filter(fileName => fileName.endsWith('.md'));

    console.log(`📚 Found ${mdFiles.length} blog posts:`, mdFiles.map(f => f.replace('.md', '')));

    const posts = [];

    for (const fileName of mdFiles) {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        try {
            // Parse frontmatter and content
            const { data, content } = matter(fileContents);

            // Extract metadata from markdown
            const lines = content.split('\n');
            const titleMatch = lines.find(l => l.startsWith('# '));
            const metaLine = lines.find(l => l.includes('Published:'));

            let title = titleMatch ? titleMatch.replace('# ', '') : slug;
            let date = '';
            let category = '';
            let readTime = '';

            if (metaLine) {
                const parts = metaLine.split('|').map(p => p.trim());
                date = parts[0]?.replace('**Published:**', '').trim() || '';
                category = parts[1]?.replace('**Category:**', '').trim() || '';
                readTime = parts[2]?.replace('**Reading Time:**', '').trim() || '';
            }

            // Convert markdown to HTML
            const contentHtml = await processMarkdown(content);

            posts.push({
                slug,
                title,
                date,
                category,
                readTime,
                content: contentHtml
            });

            console.log(`✅ Processed: ${slug}`);
        } catch (error) {
            console.error(`❌ Error processing ${slug}:`, error.message);
        }
    }

    // Generate TypeScript file
    const tsContent = `// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Generated at: ${new Date().toISOString()}
// Source: src/content/blog/*.md

export interface BlogPostContent {
    slug: string;
    title: string;
    date: string;
    category: string;
    readTime: string;
    content: string;
}

export const BLOG_CONTENT: Record<string, BlogPostContent> = ${JSON.stringify(
        posts.reduce((acc, post) => {
            acc[post.slug] = post;
            return acc;
        }, {}),
        null,
        2
    )};

export function getEmbeddedPost(slug: string): BlogPostContent | null {
    return BLOG_CONTENT[slug] || null;
}

export function getAllEmbeddedSlugs(): string[] {
    return Object.keys(BLOG_CONTENT);
}
`;

    fs.writeFileSync(outputFile, tsContent, 'utf8');
    console.log(`✅ Generated ${outputFile}`);
    console.log(`📦 Embedded ${posts.length} blog posts into bundle`);
}

generateBlogContent().catch(error => {
    console.error('❌ Failed to generate blog content:', error);
    process.exit(1);
});
