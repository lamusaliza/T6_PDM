import React, { createContext, useEffect, useState, useContext, ReactNode } from 'react';
import { SafeAreaView, FlatList, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import * as RSSParser from 'react-native-rss-parser';

// Define el tipo de NewsItem
type NewsItem = {
  title: string;
  pubDate: string;
  contentSnippet: string;
};

// Define el tipo del contexto
type NewsContextType = {
  news: NewsItem[];
  error: string | null;
};

// Crea el contexto
const NewsContext = createContext<NewsContextType | undefined>(undefined);

// Define el tipo para el proveedor de noticias
interface NewsProviderProps {
  children: ReactNode;
}

// Proveedor del contexto
const NewsProvider: React.FC<NewsProviderProps> = ({ children }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRSS = async () => {
      try {
        const response = await fetch('https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml');
        const text = await response.text();

        if (!text || text.trim().length === 0) {
          throw new Error('Empty or invalid XML');
        }

        const feed = await RSSParser.parse(text);
        const items = feed.items.map(item => ({
          title: item.title,
          pubDate: item.published,
          contentSnippet: item.description,
        }));
        setNews(items);
      } catch (error) {
        setError('Failed to fetch and parse RSS feed');
        console.error('Error fetching and parsing RSS feed', error);
      }
    };

    fetchRSS();
  }, []);

  return (
    <NewsContext.Provider value={{ news, error }}>
      {children}
    </NewsContext.Provider>
  );
};

// Hook para usar el contexto
const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};

// Componente principal de la aplicación
const App: React.FC = () => {
  const { news, error } = useNews();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (news.length > 0 || error) {
      setLoading(false);
    }
  }, [news, error]);

  const renderItem = ({ item }: { item: NewsItem }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.date}>{item.pubDate}</Text>
      <Text>{item.contentSnippet}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF69          B4" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={news}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </SafeAreaView>
  );
};

const WrappedApp: React.FC = () => (
  <NewsProvider>
    <App />
  </NewsProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    backgroundColor: '#FFC0CB', // Fondo rosado
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#FFB6C1', // Fondo de los ítems rosado claro
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000', // Color del texto negro
  },
  date: {
    fontSize: 14,
    color: 'gray',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFC0CB', // Fondo rosado mientras carga
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFC0CB', // Fondo rosado en caso de error
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});

export default WrappedApp;

