declare module 'react-native-rss-parser' {
    export interface RSSFeed {
      title: string;
      items: RSSItem[];
    }
  
    export interface RSSItem {
      title: string;
      description: string;
      published: string;
    }
  
    export function parse(text: string): Promise<RSSFeed>;
  }
  