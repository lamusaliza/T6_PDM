import React, { createContext, useState, useEffect, ReactNode } from 'react';
import Parser from 'rss-parser';

type NewsItem = {
  title: string;
  pubDate: string;
  contentSnippet: string;
};

type NewsContextType = {
  news: NewsItem[];
};

const NewsContext = createContext<NewsContextType | undefined>(undefined);

const NewsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const parser = new Parser();

  useEffect(() => {
    const fetchRSS = async () => {
      try {
        const feed = await parser.parseURL('https://www.inegi.org.mx/rss/noticias.xml');
        setNews(feed.items as NewsItem[]);
      } catch (error) {
        console.error(error);
      }
    };
    
    fetchRSS();
  }, []);

  return (
    <NewsContext.Provider value={{ news }}>
      {children}
    </NewsContext.Provider>
  );
};

export { NewsProvider, NewsContext };
