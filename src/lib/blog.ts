import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'src/content/blog');

export interface BlogPostData {
    slug: string;
    title: string;
    date: string;
    category: string;
    readTime: string;
    content: string;
}

export async function getPostBySlug(slug: string): Promise<BlogPostData | null> {
    try {
        const fullPath = path.join(postsDirectory, `${slug}.md`);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // Use gray-matter to parse the post metadata section
        const { data, content } = matter(fileContents);

        // Extract metadata from the markdown directly (since it's in the content)
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
        const processedContent = await remark()
            .use(html, { sanitize: false })
            .process(content);

        const contentHtml = processedContent.toString();

        return {
            slug,
            title,
            date,
            category,
            readTime,
            content: contentHtml
        };
    } catch (error) {
        console.error(`Error reading post ${slug}:`, error);
        return null;
    }
}

export function getAllPostSlugs(): string[] {
    try {
        const fileNames = fs.readdirSync(postsDirectory);
        return fileNames
            .filter(fileName => fileName.endsWith('.md'))
            .map(fileName => fileName.replace(/\.md$/, ''));
    } catch (error) {
        console.error('Error reading posts directory:', error);
        return [];
    }
}
